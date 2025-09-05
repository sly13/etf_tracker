import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../config/app_config.dart';
import 'dart:io' show Platform;

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
      print('✅ RevenueCat инициализирован успешно');
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

      final customerInfo = await Purchases.getCustomerInfo();

      print('🔧 Все entitlements: ${customerInfo.entitlements.all.keys}');
      print(
        '🔧 Активные entitlements: ${customerInfo.entitlements.active.keys}',
      );

      // Выводим детальную информацию о каждом entitlement
      for (final entry in customerInfo.entitlements.all.entries) {
        print(
          '🔧 Entitlement "${entry.key}": активен = ${entry.value.isActive}',
        );
        if (entry.value.isActive) {
          print('   - Истекает: ${entry.value.expirationDate}');
          print('   - Будет продлеваться: ${entry.value.willRenew}');
        }
      }

      // Временная логика: если entitlements не настроены, проверяем активные покупки
      var isPremium = customerInfo.entitlements.active.containsKey('premium');

      // Если entitlements не настроены, проверяем активные покупки
      if (customerInfo.entitlements.all.isEmpty &&
          customerInfo.activeSubscriptions.isNotEmpty) {
        print('🔧 Entitlements не настроены, но есть активные покупки');
        isPremium = true;
      }

      if (kDebugMode) {
        print('🔧 Статус премиум: $isPremium');
        print('🔧 Проверяем entitlement "premium"');
        print(
          '🔧 Активные покупки: ${customerInfo.activeSubscriptions.length}',
        );
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

      final customerInfo = await Purchases.getCustomerInfo();
      final isPremium = customerInfo.entitlements.active.containsKey('premium');

      if (kDebugMode) {
        print('🔧 Обновленный статус: ${isPremium ? "Premium" : "Basic"}');
        print(
          '🔧 Активные entitlements: ${customerInfo.entitlements.active.keys}',
        );
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
}
