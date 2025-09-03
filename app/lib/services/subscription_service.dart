import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
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
      // В debug режиме используем реальный RevenueCat для тестирования
      print('🔧 Debug режим: Инициализируем RevenueCat для тестирования');

      await Purchases.setLogLevel(LogLevel.debug);

      // Настройка API ключей для разных платформ
      PurchasesConfiguration configuration;

      if (Platform.isIOS) {
        final apiKey = _iosApiKey;
        if (apiKey.isEmpty) {
          throw Exception('REVENUECAT_IOS_API_KEY не найден в .env файле');
        }
        configuration = PurchasesConfiguration(apiKey);
      } else if (Platform.isAndroid) {
        throw Exception('Android пока не поддерживается');
      } else {
        throw Exception('Неподдерживаемая платформа');
      }

      await Purchases.configure(configuration);
      print('✅ RevenueCat инициализирован успешно');
    } catch (e) {
      print('❌ Ошибка инициализации RevenueCat: $e');
      rethrow;
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
      final current = offerings.current;

      if (current == null) {
        print('⚠️ Нет доступных подписок в RevenueCat');
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

      return products;
    } catch (e) {
      print('❌ Ошибка получения подписок: $e');
      print('🔧 Возвращаем mock подписки для тестирования');
      return _getMockSubscriptions();
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
      // В debug режиме используем реальный RevenueCat для тестирования
      print('🔧 Debug режим: Проверяем реальный статус премиум');

      final customerInfo = await Purchases.getCustomerInfo();
      final isPremium = customerInfo.entitlements.active.containsKey('premium');

      print('🔧 Статус премиум: $isPremium');
      print(
        '🔧 Активные entitlements: ${customerInfo.entitlements.active.keys}',
      );

      return isPremium;
    } catch (e) {
      print('❌ Ошибка проверки статуса: $e');
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
      print('🔧 Принудительное обновление статуса подписки');

      final customerInfo = await Purchases.getCustomerInfo();
      final isPremium = customerInfo.entitlements.active.containsKey('premium');

      print('🔧 Обновленный статус: ${isPremium ? "Premium" : "Basic"}');
      print(
        '🔧 Активные entitlements: ${customerInfo.entitlements.active.keys}',
      );

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
}
