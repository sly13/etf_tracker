import 'package:flutter/foundation.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import '../services/subscription_service.dart';

class RevenueCatChecker {
  /// Быстрая проверка статуса RevenueCat
  static Future<Map<String, dynamic>> quickCheck() async {
    final result = <String, dynamic>{
      'status': 'unknown',
      'message': '',
      'issues': <String>[],
      'products': <String>[],
      'canPurchase': false,
    };

    try {
      print('🔍 Быстрая проверка RevenueCat...');

      // Проверяем инициализацию
      final customerInfo = await Purchases.getCustomerInfo();
      result['status'] = 'initialized';

      // Проверяем offerings
      final offerings = await Purchases.getOfferings();
      final current = offerings.current;

      if (current == null) {
        result['status'] = 'no_offering';
        result['message'] = 'Нет доступного offering';
        result['issues'].add('Создайте offering в RevenueCat Dashboard');
        return result;
      }

      // Проверяем продукты
      final products = current.availablePackages
          .map((package) => package.storeProduct.identifier)
          .toList();

      result['products'] = products;
      result['canPurchase'] = products.isNotEmpty;

      if (products.isEmpty) {
        result['status'] = 'no_products';
        result['message'] = 'Нет доступных продуктов';
        result['issues'].add('Добавьте продукты в offering');
        result['issues'].add('Проверьте статус продуктов в App Store Connect');
      } else {
        result['status'] = 'ready';
        result['message'] = 'RevenueCat готов к работе';
      }

      // Проверяем ожидаемые продукты
      final expectedProducts = [
        'MONTHLY_ETF_FLOW_PLAN',
        'YEARLY_ETF_FLOW_PLAN',
      ];
      final missingProducts = expectedProducts
          .where((id) => !products.contains(id))
          .toList();

      if (missingProducts.isNotEmpty) {
        result['issues'].add(
          'Отсутствуют продукты: ${missingProducts.join(', ')}',
        );
        result['issues'].add('См. REVENUECAT_FIX_MISSING_METADATA.md');
      }
    } catch (e) {
      result['status'] = 'error';
      result['message'] = 'Ошибка проверки: $e';
      result['issues'].add('Проверьте настройки RevenueCat');
    }

    return result;
  }

  /// Получение статуса в читаемом виде
  static String getStatusText(String status) {
    switch (status) {
      case 'ready':
        return '✅ Готов к работе';
      case 'initialized':
        return '⚠️ Инициализирован, но есть проблемы';
      case 'no_offering':
        return '❌ Нет offering';
      case 'no_products':
        return '❌ Нет продуктов';
      case 'error':
        return '❌ Ошибка';
      default:
        return '❓ Неизвестный статус';
    }
  }

  /// Проверка готовности к покупкам
  static Future<bool> isReadyForPurchases() async {
    final check = await quickCheck();
    return check['canPurchase'] == true;
  }

  /// Получение списка проблем
  static Future<List<String>> getIssues() async {
    final check = await quickCheck();
    return List<String>.from(check['issues'] ?? []);
  }

  /// Вывод диагностической информации в консоль
  static Future<void> printDiagnostics() async {
    if (!kDebugMode) return;

    print('🔍 === RevenueCat Диагностика ===');
    final check = await quickCheck();

    print('Статус: ${getStatusText(check['status'])}');
    print('Сообщение: ${check['message']}');

    if (check['products'].isNotEmpty) {
      print('Продукты: ${check['products'].join(', ')}');
    }

    if (check['issues'].isNotEmpty) {
      print('Проблемы:');
      for (final issue in check['issues']) {
        print('  - $issue');
      }
    }

    print('Готов к покупкам: ${check['canPurchase'] ? '✅ Да' : '❌ Нет'}');
    print('================================');
  }
}
