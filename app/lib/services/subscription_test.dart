import 'package:purchases_flutter/purchases_flutter.dart';
import 'subscription_service.dart';

class SubscriptionTest {
  // Тест инициализации RevenueCat
  static Future<void> testInitialization() async {
    try {
      print('🧪 Тестируем инициализацию RevenueCat...');
      await SubscriptionService.initialize();
      print('✅ Инициализация прошла успешно');
    } catch (e) {
      print('❌ Ошибка инициализации: $e');
    }
  }

  // Тест получения информации о пользователе
  static Future<void> testGetCustomerInfo() async {
    try {
      print('🧪 Тестируем получение информации о пользователе...');
      final customerInfo = await SubscriptionService.getCustomerInfo();
      print('✅ Информация получена');
      print(
        '🔧 Активные entitlements: ${customerInfo.entitlements.active.keys}',
      );
      print('🔧 Все entitlements: ${customerInfo.entitlements.all.keys}');
    } catch (e) {
      print('❌ Ошибка получения информации: $e');
    }
  }

  // Тест проверки статуса премиум
  static Future<void> testIsPremium() async {
    try {
      print('🧪 Тестируем проверку статуса премиум...');
      final isPremium = await SubscriptionService.isPremium();
      print('✅ Статус премиум: $isPremium');
    } catch (e) {
      print('❌ Ошибка проверки статуса: $e');
    }
  }

  // Тест получения доступных подписок
  static Future<void> testGetAvailablePackages() async {
    try {
      print('🧪 Тестируем получение доступных подписок...');
      final packages = await SubscriptionService.getAvailablePackages();
      print('✅ Найдено ${packages.length} подписок:');
      for (final package in packages) {
        print(
          '  - ${package.identifier}: ${package.title} (${package.priceString})',
        );
      }
    } catch (e) {
      print('❌ Ошибка получения подписок: $e');
    }
  }

  // Тест восстановления покупок
  static Future<void> testRestorePurchases() async {
    try {
      print('🧪 Тестируем восстановление покупок...');
      final customerInfo = await SubscriptionService.restorePurchases();
      print('✅ Покупки восстановлены');
      print(
        '🔧 Активные entitlements: ${customerInfo.entitlements.active.keys}',
      );
    } catch (e) {
      print('❌ Ошибка восстановления: $e');
    }
  }

  // Полный тест всех функций
  static Future<void> runFullTest() async {
    print('🚀 Запускаем полный тест подписки...\n');

    await testInitialization();
    print('');

    await testGetCustomerInfo();
    print('');

    await testIsPremium();
    print('');

    await testGetAvailablePackages();
    print('');

    await testRestorePurchases();
    print('');

    print('✅ Полный тест завершен');
  }
}
