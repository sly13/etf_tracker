import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import '../config/app_config.dart';

class AuthService {
  static const Duration _timeout = Duration(seconds: 10);

  // Mock пользователь для dev режима
  User _getMockUser() {
    return User(
      id: 'dev_user_001',
      name: 'Тестовый Пользователь',
      email: 'test@example.com',
      appleId: 'dev_apple_id_001',
      subscription: Subscription(
        plan: 'free',
        expiresAt: null,
        autoRenew: false,
      ),
      preferences: UserPreferences(
        notifications: true,
        theme: 'system',
        favoriteETFs: ['ARKB', 'IBIT'],
      ),
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
      lastLoginAt: DateTime.now(),
    );
  }

  // Выход из аккаунта
  Future<void> signOut() async {
    try {
      final response = await http
          .post(Uri.parse(AppConfig.getApiUrl('/auth/logout')))
          .timeout(_timeout);

      if (response.statusCode != 200) {
        throw Exception('Ошибка выхода: ${response.statusCode}');
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('Превышено время ожидания ответа от сервера');
      }
      throw Exception('Ошибка выхода: $e');
    }
  }

  // Проверка валидности токена
  Future<User> validateToken(String token) async {
    try {
      // Проверяем, находимся ли мы в dev режиме
      if (AppConfig.isDebugMode) {
        print('🔧 Dev режим: Используем mock данные для validateToken');
        return _getMockUser();
      }

      final response = await http
          .get(
            Uri.parse(AppConfig.getApiUrl('/auth/validate')),
            headers: {'Authorization': 'Bearer $token'},
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return User.fromJson(data['user']);
      } else {
        throw Exception('Недействительный токен: ${response.statusCode}');
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('Превышено время ожидания ответа от сервера');
      }
      throw Exception('Ошибка проверки токена: $e');
    }
  }

  // Обновление профиля пользователя
  Future<User> updateProfile({
    required String userId,
    String? name,
    UserPreferences? preferences,
  }) async {
    try {
      final response = await http
          .put(
            Uri.parse(AppConfig.getApiUrl('/auth/profile')),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'userId': userId,
              if (name != null) 'name': name,
              if (preferences != null) 'preferences': preferences.toJson(),
            }),
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return User.fromJson(data['user']);
      } else {
        throw Exception('Ошибка обновления профиля: ${response.statusCode}');
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('Превышено время ожидания ответа от сервера');
      }
      throw Exception('Ошибка обновления профиля: $e');
    }
  }

  // Обновление подписки
  Future<User> updateSubscription({
    required String userId,
    required Subscription subscription,
  }) async {
    try {
      final response = await http
          .put(
            Uri.parse(AppConfig.getApiUrl('/auth/subscription')),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'userId': userId,
              'subscription': subscription.toJson(),
            }),
          )
          .timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return User.fromJson(data['user']);
      } else {
        throw Exception('Ошибка обновления подписки: ${response.statusCode}');
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('Превышено время ожидания ответа от сервера');
      }
      throw Exception('Ошибка обновления подписки: $e');
    }
  }

  // Регистрация устройства для push-уведомлений
  Future<void> registerDevice({
    required String userId,
    required String deviceToken,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse(AppConfig.getApiUrl('/auth/device')),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'userId': userId,
              'deviceToken': deviceToken,
              'platform': 'ios', // или 'android'
            }),
          )
          .timeout(_timeout);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw Exception(
          'Ошибка регистрации устройства: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is TimeoutException) {
        throw Exception('Превышено время ожидания ответа от сервера');
      }
      throw Exception('Ошибка регистрации устройства: $e');
    }
  }
}
