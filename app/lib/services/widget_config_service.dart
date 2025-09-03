import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class WidgetConfigService {
  static const platform = MethodChannel('widget_config_channel');

  /// Сохраняет API ключ RevenueCat в UserDefaults для виджета
  static Future<void> saveRevenueCatApiKey() async {
    try {
      final apiKey = dotenv.env['REVENUECAT_IOS_API_KEY'] ?? '';

      if (apiKey.isNotEmpty) {
        await platform.invokeMethod('saveRevenueCatApiKey', {'apiKey': apiKey});
        print('✅ API ключ RevenueCat сохранен для виджета: $apiKey');
      } else {
        print('⚠️ REVENUECAT_IOS_API_KEY не найден в .env файле');
      }
    } catch (e) {
      print('❌ Ошибка сохранения API ключа для виджета: $e');
    }
  }

  /// Обновляет данные виджета
  static Future<void> updateWidgetData() async {
    try {
      await platform.invokeMethod('updateWidget');
      print('✅ Виджет обновлен');
    } catch (e) {
      print('❌ Ошибка обновления виджета: $e');
    }
  }
}
