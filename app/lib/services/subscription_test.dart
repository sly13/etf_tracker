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

  // Полный тест всех функций
  static Future<void> runAllTests() async {
    print('🚀 Запускаем полный тест RevenueCat...');

    await testInitialization();
    await Future.delayed(Duration(seconds: 1));

    await testGetCustomerInfo();
    await Future.delayed(Duration(seconds: 1));

    await testIsPremium();
    await Future.delayed(Duration(seconds: 1));

    await testGetAvailablePackages();

    print('✅ Все тесты завершены!');
  }
}
