import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'notification_service.dart';

class UserCheckService {
  static const Duration _timeout = Duration(seconds: 10);

  /// Проверяет существование пользователя и создает его при необходимости
  static Future<bool> ensureUserExists() async {
    try {
      print('👤 === ПРОВЕРКА СУЩЕСТВОВАНИЯ ПОЛЬЗОВАТЕЛЯ ===');

      // Получаем deviceId
      final deviceId = await NotificationService.getDeviceId();
      print('📱 Device ID: $deviceId');

      if (deviceId == null || deviceId.isEmpty) {
        print('❌ Device ID не получен');
        return false;
      }

      // Проверяем/создаем пользователя на сервере
      final url = AppConfig.getApiUrl('/subscription/check-or-create-user');

      final response = await http
          .post(
            Uri.parse(url),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'deviceId': deviceId,
              'userId': 'user_${DateTime.now().millisecondsSinceEpoch}',
            }),
          )
          .timeout(_timeout);

      print('📡 Ответ сервера: ${response.statusCode}');
      print('📦 Тело ответа: ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = json.decode(response.body);

        if (data['success'] == true) {
          if (data['created'] == true) {
            print('✅ Пользователь создан успешно');
          } else {
            print('✅ Пользователь уже существует');
          }
          return true;
        } else {
          print('❌ Ошибка на сервере: ${data['error']}');
          return false;
        }
      } else {
        print('❌ HTTP ошибка: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Ошибка проверки пользователя: $e');
      return false;
    }
  }

  /// Проверяет существование пользователя перед покупкой
  static Future<bool> checkUserBeforePurchase() async {
    try {
      print('💳 === ПРОВЕРКА ПОЛЬЗОВАТЕЛЯ ПЕРЕД ПОКУПКОЙ ===');

      final userExists = await ensureUserExists();

      if (userExists) {
        print('✅ Пользователь готов к покупке');
        return true;
      } else {
        print('❌ Пользователь не готов к покупке');
        return false;
      }
    } catch (e) {
      print('❌ Ошибка проверки пользователя перед покупкой: $e');
      return false;
    }
  }

  /// Регистрирует устройство с полными данными
  static Future<bool> registerDeviceWithFullData() async {
    try {
      print('📱 === ПОЛНАЯ РЕГИСТРАЦИЯ УСТРОЙСТВА ===');

      // Получаем FCM токен
      final fcmToken = NotificationService.fcmToken;
      if (fcmToken == null) {
        print('❌ FCM токен не получен');
        return false;
      }

      // Получаем deviceId
      final deviceId = await NotificationService.getDeviceId();
      if (deviceId == null) {
        print('❌ Device ID не получен');
        return false;
      }

      print('🔑 FCM Token: ${fcmToken.substring(0, 20)}...');
      print('📱 Device ID: $deviceId');

      // Регистрируем устройство через NotificationService
      final url = AppConfig.getApiUrl('/notifications/register-device');

      final deviceInfo = {
        'token': fcmToken,
        'appName': AppConfig.appName,
        'deviceId': deviceId,
        'deviceType': Platform.operatingSystem,
        'appVersion': '1.0.0',
        'osVersion': Platform.operatingSystemVersion,
        'language': 'ru',
        'timezone': DateTime.now().timeZoneName,
        'deviceName': 'ETF Tracker Device',
        'firstName': 'Пользователь',
        'lastName': 'ETF',
        'email': 'user@etftracker.com',
      };

      final response = await http
          .post(
            Uri.parse(url),
            headers: {'Content-Type': 'application/json'},
            body: json.encode(deviceInfo),
          )
          .timeout(_timeout);

      print('📡 Ответ регистрации: ${response.statusCode}');
      print('📦 Тело ответа: ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        print('✅ Устройство зарегистрировано успешно');
        return true;
      } else {
        print('❌ Ошибка регистрации устройства: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Ошибка регистрации устройства: $e');
      return false;
    }
  }
}
