import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io' show Platform;
import '../models/user.dart';
import '../config/app_config.dart';
import 'notification_service.dart';
import 'user_check_service.dart';
import 'subscription_status_service.dart';

class SubscriptionService {
  // Получение API ключей из переменных окружения
  static String get _iosApiKey {
    try {
      return dotenv.env['REVENUECAT_IOS_API_KEY'] ?? '';
    } catch (e) {
      print('⚠️ Ошибка получения API ключа: $e');
      return '';
    }
  }

  // Ручная синхронизация подписок (можно вызвать из UI)
  static Future<void> syncSubscriptions() async {
    try {
      print('🔄 Ручная синхронизация подписок...');
      await syncSubscriptionsOnStartup();
    } catch (e) {
      print('❌ Ошибка ручной синхронизации: $e');
      rethrow;
    }
  }

  // Синхронизация подписок с бэкендом при старте
  static Future<void> syncSubscriptionsOnStartup() async {
    try {
      print('🔄 Синхронизируем подписки при старте...');

      // Получаем информацию о пользователе
      final customerInfo = await Purchases.getCustomerInfo();
      final deviceId = await NotificationService.getDeviceId();

      print('🔍 Customer Info: ${customerInfo.toJson()}');
      print('🔍 Device ID: $deviceId');

      // Проверяем, есть ли активные entitlements
      final activeEntitlements = customerInfo.entitlements.active;
      if (activeEntitlements.isEmpty) {
        print('ℹ️ Нет активных entitlements для синхронизации');
        return;
      }

      print('📦 Активные entitlements: ${activeEntitlements.keys.toList()}');

      // Синхронизируем каждую активную подписку
      for (final entitlementId in activeEntitlements.keys) {
        try {
          final subscription = activeEntitlements[entitlementId];
          if (subscription != null) {
            print('🔄 Синхронизируем entitlement: $entitlementId');

            final syncData = {
              'userId':
                  deviceId, // Используем deviceId как userId для поиска в БД
              'deviceId': deviceId,
              'customerInfo': {
                'originalAppUserId': customerInfo.originalAppUserId,
                'activeEntitlements': activeEntitlements.keys.toList(),
              },
              'productId': subscription.productIdentifier,
              'transactionId': subscription.originalPurchaseDate,
              'originalTransactionId': subscription.originalPurchaseDate,
              'purchaseDate': subscription.originalPurchaseDate,
              'expirationDate': subscription.expirationDate,
              'isActive': subscription.isActive,
              'isPremium': subscription.isActive,
              'autoRenew': subscription.willRenew,
              'environment': subscription.isSandbox ? 'Sandbox' : 'Production',
              'platform': Platform.isIOS ? 'ios' : 'android',
              'price': null, // RevenueCat не всегда предоставляет цену
              'currency': null,
            };

            print('📤 Отправляем данные синхронизации:');
            print('   - userId: ${syncData['userId']}');
            print('   - deviceId: ${syncData['deviceId']}');
            print('   - productId: ${syncData['productId']}');
            print('   - isActive: ${syncData['isActive']}');
            print('   - expirationDate: ${syncData['expirationDate']}');

            await _syncExistingSubscriptionToBackend(syncData);
            print('✅ Entitlement $entitlementId синхронизирован');
          }
        } catch (e) {
          print('❌ Ошибка синхронизации entitlement $entitlementId: $e');
        }
      }

      print('✅ Синхронизация подписок завершена');
    } catch (e) {
      print('❌ Ошибка синхронизации подписок: $e');
    }
  }

  // Инициализация RevenueCat
  static Future<void> initialize() async {
    try {
      print('🔧 Инициализируем RevenueCat...');

      // Устанавливаем уровень логирования только в debug режиме
      if (kDebugMode) {
        await Purchases.setLogLevel(LogLevel.debug);
      }

      // Настройка API ключей для разных платформ
      PurchasesConfiguration configuration;

      if (Platform.isIOS) {
        final apiKey = _iosApiKey;
        if (apiKey.isEmpty) {
          print('⚠️ REVENUECAT_IOS_API_KEY не найден в .env файле');
          print('🔧 Используем тестовый ключ для разработки');
          // Используем тестовый ключ для разработки
          configuration = PurchasesConfiguration('app42ff7d937d');
        } else {
          configuration = PurchasesConfiguration(apiKey);
        }
      } else if (Platform.isAndroid) {
        print('⚠️ Android пока не поддерживается');
        throw Exception('Android пока не поддерживается');
      } else if (Platform.isMacOS) {
        print('🔧 Настройка RevenueCat для macOS');
        // Для macOS используем тот же ключ, что и для iOS
        final apiKey = _iosApiKey;
        if (apiKey.isEmpty) {
          print('⚠️ REVENUECAT_IOS_API_KEY не найден в .env файле');
          print('🔧 Используем тестовый ключ для разработки');
          configuration = PurchasesConfiguration('app42ff7d937d');
        } else {
          configuration = PurchasesConfiguration(apiKey);
        }
      } else {
        print('⚠️ Неподдерживаемая платформа');
        throw Exception('Неподдерживаемая платформа');
      }

      await Purchases.configure(configuration);

      // Устанавливаем ваш deviceId как App User ID в RevenueCat
      final deviceId = await NotificationService.getDeviceId();
      print('🔍 Получен deviceId: $deviceId');

      if (deviceId.isNotEmpty) {
        try {
          // Проверяем, есть ли активный пользователь перед logout
          final customerInfo = await Purchases.getCustomerInfo();
          if (customerInfo.originalAppUserId.isNotEmpty &&
              customerInfo.originalAppUserId != deviceId) {
            // Сначала logout, чтобы очистить кэш
            await Purchases.logOut();
            print('🔓 Выполнен logout из RevenueCat');
          } else {
            print(
              '🔍 Пользователь уже анонимный или тот же, пропускаем logout',
            );
          }
        } catch (e) {
          print('⚠️ Ошибка при проверке пользователя перед logout: $e');
          // Продолжаем без logout
        }

        // Затем login с новым ID
        await Purchases.logIn(deviceId);
        print('🔗 Установлен App User ID в RevenueCat: $deviceId');

        // Проверяем, какой ID теперь используется
        final customerInfo = await Purchases.getCustomerInfo();
        print(
          '🔍 RevenueCat App User ID после логина: ${customerInfo.originalAppUserId}',
        );
      }

      print('✅ RevenueCat инициализирован успешно');

      // Синхронизируем существующие подписки с бэкендом
      await syncSubscriptionsOnStartup();
    } catch (e) {
      print('❌ Ошибка инициализации RevenueCat: $e');
      // Не выбрасываем исключение, чтобы приложение могло работать без RevenueCat
      print('🔧 Приложение будет работать без функций подписки');
      rethrow; // Пробрасываем ошибку для обработки в UI
    }
  }

  // Установка пользователя
  static Future<void> setUser(String userId) async {
    try {
      // В debug режиме используем реальный RevenueCat
      print('🔧 Debug режим: Устанавливаем пользователя в RevenueCat: $userId');

      await Purchases.logIn(userId);
      print('✅ Пользователь установлен: $userId');
    } catch (e) {
      print('❌ Ошибка установки пользователя: $e');
      rethrow;
    }
  }

  // Получение доступных подписок
  static Future<List<StoreProduct>> getAvailablePackages() async {
    try {
      print('🔧 Получаем подписки из RevenueCat...');

      final offerings = await Purchases.getOfferings();

      // Пытаемся найти offering "subscriptions" (ваше название)
      var current = offerings.getOffering('subscriptions');

      // Если не найден, используем текущий
      if (current == null) {
        current = offerings.current;
        print(
          '🔧 Offering "subscriptions" не найден, используем текущий: ${current?.identifier}',
        );
      } else {
        print('🔧 Найден offering "subscriptions"');
      }

      if (current == null) {
        print('⚠️ Нет доступных подписок в RevenueCat');
        print('🔧 Проверьте настройки в RevenueCat Dashboard');
        print('🔧 Убедитесь, что продукты созданы в App Store Connect');
        // Возвращаем mock подписки для тестирования
        return _getMockSubscriptions();
      }

      final products = current.availablePackages
          .map((package) => package.storeProduct)
          .toList();

      print('✅ Найдено ${products.length} подписок:');
      for (final product in products) {
        print(
          '  - ${product.identifier}: ${product.title} (${product.priceString})',
        );
      }

      // Проверяем наличие проблемных продуктов
      _checkProductIssues(products);

      return products;
    } catch (e) {
      print('❌ Ошибка получения подписок: $e');
      print('🔧 Возвращаем mock подписки для тестирования');
      return _getMockSubscriptions();
    }
  }

  // Проверка проблем с продуктами
  static void _checkProductIssues(List<StoreProduct> products) {
    final expectedProducts = ['MONTHLY_ETF_FLOW_PLAN', 'YEARLY_ETF_FLOW_PLAN'];
    final missingProducts = <String>[];

    for (final expectedId in expectedProducts) {
      final found = products.any((product) => product.identifier == expectedId);
      if (!found) {
        missingProducts.add(expectedId);
      }
    }

    if (missingProducts.isNotEmpty) {
      print(
        '⚠️ ПРЕДУПРЕЖДЕНИЕ: Отсутствуют продукты: ${missingProducts.join(', ')}',
      );
      print('🔧 Возможные причины:');
      print('  1. Продукты не созданы в App Store Connect');
      print('  2. Продукты имеют статус MISSING_METADATA');
      print('  3. Продукты не добавлены в offering в RevenueCat');
      print('🔧 См. файл REVENUECAT_FIX_MISSING_METADATA.md для решения');
    }

    if (products.isEmpty) {
      print('⚠️ ПРЕДУПРЕЖДЕНИЕ: Нет доступных продуктов');
      print('🔧 Проверьте настройки offering в RevenueCat Dashboard');
    }
  }

  // Mock подписки для тестирования
  static List<StoreProduct> _getMockSubscriptions() {
    print('🔧 Создаем mock подписки для тестирования');
    // В реальном приложении здесь будут ваши продукты
    return [];
  }

  // Покупка подписки
  static Future<CustomerInfo> purchasePackage(StoreProduct product) async {
    try {
      // В debug режиме используем реальный RevenueCat
      print('🔧 Debug режим: Реальная покупка подписки: ${product.identifier}');

      final customerInfo = await Purchases.purchaseStoreProduct(product);
      print('✅ Подписка куплена: ${product.identifier}');

      // Проверяем статус после покупки
      final isPremium = customerInfo.entitlements.active.containsKey('premium');
      print('🔧 Статус после покупки: ${isPremium ? "Premium" : "Basic"}');

      // Отправляем данные о покупке на бэкенд
      await _syncPurchaseToBackend(product, customerInfo);
      print(
        '🔧 Активные entitlements после покупки: ${customerInfo.entitlements.active.keys}',
      );

      return customerInfo;
    } catch (e) {
      print('❌ Ошибка покупки: $e');
      rethrow;
    }
  }

  // Проверка статуса подписки
  static Future<bool> isPremium() async {
    try {
      if (kDebugMode) {
        print('🔧 Debug режим: Проверяем реальный статус премиум');
      }

      // Используем новый сервис для получения актуального статуса
      final isPremium =
          await SubscriptionStatusService.getCurrentSubscriptionStatus();

      if (kDebugMode) {
        print('🔧 Статус премиум: $isPremium');
      }

      return isPremium;
    } catch (e) {
      print('❌ Ошибка проверки статуса: $e');
      print('🔧 Возвращаем false как значение по умолчанию');
      return false;
    }
  }

  // Получение информации о пользователе
  static Future<CustomerInfo> getCustomerInfo() async {
    try {
      // В debug режиме используем реальный RevenueCat для тестирования
      print('🔧 Debug режим: Получаем реальную информацию о пользователе');

      final customerInfo = await Purchases.getCustomerInfo();
      print('🔧 Получена информация о пользователе');
      print(
        '🔧 Активные entitlements: ${customerInfo.entitlements.active.keys}',
      );

      return customerInfo;
    } catch (e) {
      print('❌ Ошибка получения информации: $e');
      rethrow;
    }
  }

  // Принудительное обновление статуса подписки
  static Future<bool> refreshSubscriptionStatus() async {
    try {
      if (kDebugMode) {
        print('🔧 Принудительное обновление статуса подписки');
      }

      // Используем новый сервис для обновления статуса
      final isPremium =
          await SubscriptionStatusService.refreshSubscriptionStatus();

      if (kDebugMode) {
        print('🔧 Обновленный статус: ${isPremium ? "Premium" : "Basic"}');
      }

      return isPremium;
    } catch (e) {
      print('❌ Ошибка обновления статуса: $e');
      return false;
    }
  }

  // Восстановление покупок
  static Future<CustomerInfo> restorePurchases() async {
    try {
      // В debug режиме используем реальный RevenueCat для тестирования
      print('🔧 Debug режим: Реальное восстановление покупок');

      final customerInfo = await Purchases.restorePurchases();
      print('✅ Покупки восстановлены');
      return customerInfo;
    } catch (e) {
      print('❌ Ошибка восстановления: $e');
      rethrow;
    }
  }

  // Отмена подписки
  static Future<void> cancelSubscription() async {
    try {
      // RevenueCat не предоставляет прямой API для отмены
      // Пользователь должен отменить через App Store/Google Play
      print('ℹ️ Для отмены подписки используйте App Store/Google Play');
    } catch (e) {
      print('❌ Ошибка отмены: $e');
      rethrow;
    }
  }

  // Получение активных подписок
  static Future<List<EntitlementInfo>> getActiveEntitlements() async {
    try {
      // В debug режиме используем реальный RevenueCat для тестирования
      print('🔧 Debug режим: Получаем реальные активные подписки');

      final customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active.values.toList();
    } catch (e) {
      print('❌ Ошибка получения активных подписок: $e');
      return [];
    }
  }

  // Получение всех доступных entitlements из RevenueCat Dashboard
  static Future<List<String>> getAllAvailableEntitlements() async {
    try {
      print('🔧 Получаем все доступные entitlements из RevenueCat...');

      final customerInfo = await Purchases.getCustomerInfo();
      final allEntitlements = customerInfo.entitlements.all.keys.toList();

      print('🔧 Все доступные entitlements: $allEntitlements');

      return allEntitlements;
    } catch (e) {
      print('❌ Ошибка получения entitlements: $e');
      return [];
    }
  }

  // Конвертация CustomerInfo в модель User
  static User updateUserWithSubscription(User user, CustomerInfo customerInfo) {
    final activeEntitlements = customerInfo.entitlements.active;
    final isPremium = activeEntitlements.containsKey('premium');

    // Находим активную подписку
    EntitlementInfo? activeSubscription;
    if (isPremium) {
      activeSubscription = activeEntitlements['premium'];
    }

    // Создаем обновленную подписку
    Subscription? subscription;
    if (activeSubscription != null) {
      DateTime? expirationDate;
      if (activeSubscription.expirationDate != null) {
        try {
          expirationDate = DateTime.parse(activeSubscription.expirationDate!);
        } catch (e) {
          print('⚠️ Ошибка парсинга даты: $e');
          expirationDate = null;
        }
      }

      subscription = Subscription(
        plan: isPremium ? 'premium' : 'free',
        expiresAt: expirationDate,
        autoRenew: activeSubscription.willRenew,
      );
    }

    // Обновляем пользователя
    return user.copyWith(subscription: subscription);
  }

  // Диагностика проблем с RevenueCat
  static Future<void> diagnoseRevenueCatIssues() async {
    try {
      print('🔍 Диагностика проблем с RevenueCat...');

      // Проверяем инициализацию
      print('1. Проверка инициализации...');
      final customerInfo = await Purchases.getCustomerInfo();
      print('✅ RevenueCat инициализирован корректно');

      // Проверяем offerings
      print('2. Проверка offerings...');
      final offerings = await Purchases.getOfferings();
      final current = offerings.current;

      if (current == null) {
        print('❌ Нет текущего offering');
        print('🔧 Создайте offering "default" в RevenueCat Dashboard');
        return;
      }

      print('✅ Offering найден: ${current.identifier}');
      print('📦 Доступных пакетов: ${current.availablePackages.length}');

      // Проверяем продукты
      print('3. Проверка продуктов...');
      final products = current.availablePackages
          .map((package) => package.storeProduct)
          .toList();

      if (products.isEmpty) {
        print('❌ Нет доступных продуктов');
        print('🔧 Добавьте продукты в offering в RevenueCat Dashboard');
        return;
      }

      print('✅ Найдено продуктов: ${products.length}');
      for (final product in products) {
        print('   - ${product.identifier}: ${product.title}');
      }

      // Проверяем entitlements
      print('4. Проверка entitlements...');
      final entitlements = customerInfo.entitlements.active;
      print('✅ Активных entitlements: ${entitlements.length}');
      for (final entitlement in entitlements.keys) {
        print('   - $entitlement');
      }

      print('✅ Диагностика завершена успешно');
    } catch (e) {
      print('❌ Ошибка диагностики: $e');
      print('🔧 Проверьте настройки RevenueCat');
    }
  }

  // Синхронизация существующей подписки с бэкендом
  static Future<void> _syncExistingSubscriptionToBackend(
    Map<String, dynamic> subscriptionData,
  ) async {
    try {
      print('💳 === СИНХРОНИЗАЦИЯ СУЩЕСТВУЮЩЕЙ ПОДПИСКИ С БЭКЕНДОМ ===');
      print('📦 Данные для отправки: $subscriptionData');

      final backendUrl = AppConfig.getApiUrl('/subscription/sync-purchase');
      print('🔧 Используем BACKEND_URL из .env: $backendUrl');

      final response = await http.post(
        Uri.parse(backendUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(subscriptionData),
      );

      print('📦 Статус ответа: ${response.statusCode}');
      print('📦 Ответ бэкенда: ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        print('✅ Синхронизация существующей подписки успешна');

        // Парсим ответ для проверки
        try {
          final responseData = json.decode(response.body);
          if (responseData['success'] == true) {
            print('✅ Подписка успешно сохранена в базе данных');
          } else {
            print('❌ Ошибка сохранения подписки: ${responseData['error']}');
          }
        } catch (e) {
          print('⚠️ Не удалось распарсить ответ бэкенда: $e');
        }
      } else {
        print(
          '❌ Ошибка синхронизации существующей подписки: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('❌ Ошибка синхронизации существующей подписки с бэкендом: $e');
    }
  }

  // Синхронизация данных о покупке с бэкендом
  static Future<void> _syncPurchaseToBackend(
    StoreProduct product,
    CustomerInfo customerInfo,
  ) async {
    try {
      print('💳 === СИНХРОНИЗАЦИЯ ПОКУПКИ С БЭКЕНДОМ ===');

      // Сначала проверяем/создаем пользователя
      print(
        '👤 Проверяем существование пользователя перед синхронизацией покупки...',
      );
      final userReady = await UserCheckService.checkUserBeforePurchase();

      if (!userReady) {
        print('⚠️ Пользователь не готов, но продолжаем синхронизацию...');
        // Не прерываем процесс, так как бэкенд может создать пользователя автоматически
      }

      // Получаем активную подписку
      final activeEntitlements = customerInfo.entitlements.active;
      final isPremium = activeEntitlements.containsKey('premium');
      EntitlementInfo? activeSubscription;

      if (isPremium) {
        activeSubscription = activeEntitlements['premium'];
      }

      // Получаем deviceId для идентификации пользователя
      final deviceId = await NotificationService.getDeviceId();
      print('🔍 DeviceId для отправки: $deviceId');
      print('🔍 DeviceId type: ${deviceId.runtimeType}');
      print('🔍 DeviceId length: ${deviceId.length}');

      // Подготавливаем данные для отправки
      final purchaseData = {
        'userId': deviceId, // Используем deviceId как userId для поиска в БД
        'deviceId':
            deviceId, // Используем deviceId для идентификации пользователя
        // deviceToken НЕ передаем - он уже есть в базе данных
        'customerInfo': {
          'originalAppUserId': customerInfo.originalAppUserId,
          'activeEntitlements': activeEntitlements.keys.toList(),
        },
        'productId': product.identifier,
        'transactionId': activeSubscription?.originalPurchaseDate,
        'originalTransactionId': activeSubscription?.originalPurchaseDate,
        'purchaseDate': activeSubscription?.originalPurchaseDate,
        'expirationDate': activeSubscription?.expirationDate,
        'isActive': isPremium,
        'isPremium': isPremium,
        'autoRenew': activeSubscription?.willRenew ?? false,
        'environment': kDebugMode ? 'Sandbox' : 'Production',
        'platform': Platform.isIOS ? 'ios' : 'android',
        'price': product.price,
        'currency': product.currencyCode,
      };

      print('📦 Данные для отправки: ${jsonEncode(purchaseData)}');

      // Отправляем данные на бэкенд
      final backendUrl = AppConfig.backendBaseUrl;
      final response = await http.post(
        Uri.parse('$backendUrl/api/subscription/sync-purchase'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(purchaseData),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        print('✅ Данные о покупке успешно синхронизированы с бэкендом');
        print('📦 Ответ бэкенда: $responseData');
      } else {
        print('❌ Ошибка синхронизации с бэкендом: ${response.statusCode}');
        print('📦 Ответ бэкенда: ${response.body}');
      }
    } catch (e) {
      print('❌ Ошибка синхронизации покупки с бэкендом: $e');
      // Не прерываем процесс покупки из-за ошибки синхронизации
    }
  }
}
