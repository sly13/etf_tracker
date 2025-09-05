import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class DeviceSettingsService {
  static final DeviceSettingsService _instance =
      DeviceSettingsService._internal();
  factory DeviceSettingsService() => _instance;
  DeviceSettingsService._internal();

  /// Получение настроек устройства с сервера
  static Future<Map<String, dynamic>?> getDeviceSettings(String token) async {
    try {
      final url = AppConfig.getApiUrl('/notifications/device-settings/$token');

      final response = await http.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['settings'];
      } else {
        print('❌ Ошибка получения настроек: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('❌ Ошибка получения настроек устройства: $e');
      return null;
    }
  }

  /// Обновление настроек устройства на сервере
  static Future<bool> updateDeviceSettings(
    String token,
    Map<String, dynamic> settings,
  ) async {
    try {
      final url = AppConfig.getApiUrl('/notifications/device-settings');

      final body = {'token': token, ...settings};

      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        print('✅ Настройки устройства обновлены');
        return true;
      } else {
        print('❌ Ошибка обновления настроек: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Ошибка обновления настроек устройства: $e');
      return false;
    }
  }

  /// Отправка тестового уведомления
  static Future<bool> sendTestNotification() async {
    try {
      final url = AppConfig.getApiUrl('/notifications/test');

      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        print('✅ Тестовое уведомление отправлено');
        return true;
      } else {
        print(
          '❌ Ошибка отправки тестового уведомления: ${response.statusCode}',
        );
        return false;
      }
    } catch (e) {
      print('❌ Ошибка отправки тестового уведомления: $e');
      return false;
    }
  }

  /// Получение статистики уведомлений
  static Future<Map<String, dynamic>?> getNotificationStats() async {
    try {
      final url = AppConfig.getApiUrl('/notifications/stats');

      final response = await http.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data;
      } else {
        print('❌ Ошибка получения статистики: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('❌ Ошибка получения статистики уведомлений: $e');
      return null;
    }
  }
}
