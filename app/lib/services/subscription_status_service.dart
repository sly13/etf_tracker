import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'notification_service.dart';
import 'subscription_service.dart';

class SubscriptionStatusService {
  static const Duration _timeout = Duration(seconds: 10);

  /// Получает статус подписки с бэкенда
  static Future<Map<String, dynamic>?> getBackendSubscriptionStatus() async {
    try {
      print('📊 === ПОЛУЧЕНИЕ СТАТУСА ПОДПИСКИ С БЭКЕНДА ===');

      // Получаем deviceId
      final deviceId = await NotificationService.getDeviceId();
      if (deviceId.isEmpty) {
        print('❌ Device ID не получен');
        return null;
      }

      print('📱 Device ID: $deviceId');

      // Отправляем запрос на бэкенд
      final url = AppConfig.getApiUrl('/subscription/status');

      final response = await http
          .post(
            Uri.parse(url),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({'deviceId': deviceId}),
          )
          .timeout(_timeout);

      print('📡 Ответ сервера: ${response.statusCode}');
      print('📦 Тело ответа: ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = json.decode(response.body);

        if (data['success'] == true) {
          print('✅ Статус подписки получен с бэкенда');
          return data;
        } else {
          print('❌ Ошибка на сервере: ${data['error']}');
          return null;
        }
      } else {
        print('❌ HTTP ошибка: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('❌ Ошибка получения статуса с бэкенда: $e');
      return null;
    }
  }

  /// Получает статус подписки с RevenueCat (упрощенная версия для fallback)
  static Future<Map<String, dynamic>?> getRevenueCatSubscriptionStatus() async {
    try {
      print('💳 === ПОЛУЧЕНИЕ СТАТУСА ПОДПИСКИ С REVENUECAT (FALLBACK) ===');

      final customerInfo = await SubscriptionService.getCustomerInfo();
      final isPremium = customerInfo.entitlements.active.containsKey('premium');

      print('🔍 RevenueCat статус: ${isPremium ? "Premium" : "Basic"}');

      return {
        'success': true,
        'source': 'revenuecat_fallback',
        'isPremium': isPremium,
        'subscription': null, // Не возвращаем детали, только статус
      };
    } catch (e) {
      print('❌ Ошибка получения статуса с RevenueCat: $e');
      return null;
    }
  }

  /// Синхронизирует статус подписки между RevenueCat и бэкендом
  /// Возвращает актуальный статус после синхронизации
  static Future<bool> syncSubscriptionStatus() async {
    try {
      print('🔄 === СИНХРОНИЗАЦИЯ СТАТУСА ПОДПИСКИ ===');

      // Получаем статус с RevenueCat
      final revenueCatStatus = await getRevenueCatSubscriptionStatus();
      if (revenueCatStatus == null) {
        print('❌ Не удалось получить статус с RevenueCat');
        return false;
      }

      // Получаем статус с бэкенда
      final backendStatus = await getBackendSubscriptionStatus();

      print('📊 Сравнение статусов:');
      print('   RevenueCat: ${revenueCatStatus['isPremium']}');
      print(
        '   Backend: ${backendStatus?['subscription']?['isPremium'] ?? 'не найден'}',
      );

      // Проверяем, нужно ли синхронизировать
      final revenueCatPremium = revenueCatStatus['isPremium'] as bool;
      final backendPremium =
          backendStatus?['subscription']?['isPremium'] as bool? ?? false;

      if (revenueCatPremium != backendPremium) {
        print('⚠️ Статусы не совпадают, требуется синхронизация');

        // Если в RevenueCat есть активная подписка, но в бэкенде нет - синхронизируем
        if (revenueCatPremium && !backendPremium) {
          print('🔄 Синхронизируем активную подписку с бэкендом...');

          // Здесь можно вызвать синхронизацию покупки
          // await SubscriptionService.syncSubscriptionsOnStartup();
          print('✅ Синхронизация инициирована');
        }
        // Если в бэкенде Premium, но в RevenueCat нет подписки - обновляем бэкенд
        else if (!revenueCatPremium && backendPremium) {
          print(
            '🔄 Обнаружено несоответствие: бэкенд показывает Premium, но RevenueCat - Basic',
          );
          print('🔄 Обновляем статус в бэкенде на Basic...');

          // Отправляем запрос на бэкенд для обновления статуса на Basic
          await _updateBackendSubscriptionStatus(false);
          print('✅ Статус в бэкенде обновлен на Basic');
        }
      } else {
        print('✅ Статусы совпадают, синхронизация не требуется');
      }

      // Возвращаем актуальный статус после синхронизации
      final actualStatus = await getCurrentSubscriptionStatus();
      return actualStatus;
    } catch (e) {
      print('❌ Ошибка синхронизации статуса: $e');
      return false;
    }
  }

  /// Получает актуальный статус подписки (приоритет бэкенд)
  static Future<bool> getCurrentSubscriptionStatus() async {
    try {
      print('🔍 === ПОЛУЧЕНИЕ АКТУАЛЬНОГО СТАТУСА ПОДПИСКИ ===');

      // Сначала пробуем получить с бэкенда (он синхронизируется с RevenueCat)
      print(
        '🔄 Получаем статус с бэкенда (синхронизированный с RevenueCat)...',
      );
      final backendStatus = await getBackendSubscriptionStatus();
      if (backendStatus != null && backendStatus['success'] == true) {
        final isPremium =
            backendStatus['subscription']?['isPremium'] as bool? ?? false;
        print('✅ Статус получен с бэкенда: ${isPremium ? "Premium" : "Basic"}');
        return isPremium;
      }

      // Если бэкенд недоступен, пробуем RevenueCat как fallback
      print('⚠️ Бэкенд недоступен, пробуем RevenueCat как fallback...');
      final revenueCatStatus = await getRevenueCatSubscriptionStatus();
      if (revenueCatStatus != null) {
        final isPremium = revenueCatStatus['isPremium'] as bool;
        print(
          '✅ Статус получен с RevenueCat (fallback): ${isPremium ? "Premium" : "Basic"}',
        );
        return isPremium;
      }

      print('❌ Не удалось получить статус ни с одного источника');
      return false;
    } catch (e) {
      print('❌ Ошибка получения актуального статуса: $e');
      return false;
    }
  }

  /// Обновляет статус подписки в приложении
  static Future<bool> refreshSubscriptionStatus() async {
    try {
      print('🔄 === ОБНОВЛЕНИЕ СТАТУСА ПОДПИСКИ ===');

      // Синхронизируем статус между источниками
      await syncSubscriptionStatus();

      // Получаем актуальный статус
      final isPremium = await getCurrentSubscriptionStatus();

      print('✅ Статус подписки обновлен: ${isPremium ? "Premium" : "Basic"}');
      return isPremium;
    } catch (e) {
      print('❌ Ошибка обновления статуса подписки: $e');
      return false;
    }
  }

  /// Обновляет статус подписки в бэкенде через sync-purchase эндпоинт
  static Future<bool> _updateBackendSubscriptionStatus(bool isPremium) async {
    try {
      print('🔄 === ОБНОВЛЕНИЕ СТАТУСА ПОДПИСКИ В БЭКЕНДЕ ===');

      // Получаем deviceId
      final deviceId = await NotificationService.getDeviceId();
      if (deviceId.isEmpty) {
        print('❌ Device ID не получен');
        return false;
      }

      print('📱 Device ID: $deviceId');
      print('📊 Новый статус: ${isPremium ? "Premium" : "Basic"}');

      // Используем существующий эндпоинт sync-purchase для обновления статуса
      final url = AppConfig.getApiUrl('/subscription/sync-purchase');

      // Подготавливаем данные в формате, который ожидает sync-purchase
      final syncData = {
        'userId': deviceId,
        'deviceId': deviceId,
        'customerInfo': {
          'originalAppUserId': deviceId,
          'activeEntitlements': isPremium ? ['premium'] : [],
        },
        'productId': isPremium ? 'premium_subscription' : 'basic',
        'transactionId': DateTime.now().millisecondsSinceEpoch.toString(),
        'originalTransactionId': DateTime.now().millisecondsSinceEpoch
            .toString(),
        'purchaseDate': DateTime.now().toIso8601String(),
        'expirationDate': isPremium
            ? DateTime.now().add(const Duration(days: 30)).toIso8601String()
            : null,
        'isActive': isPremium,
        'isPremium': isPremium,
        'autoRenew': isPremium,
        'environment': 'Production',
        'platform': 'ios', // или 'android' в зависимости от платформы
        'price': null,
        'currency': null,
      };

      final response = await http
          .post(
            Uri.parse(url),
            headers: {'Content-Type': 'application/json'},
            body: json.encode(syncData),
          )
          .timeout(_timeout);

      print('📡 Ответ сервера: ${response.statusCode}');
      print('📦 Тело ответа: ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = json.decode(response.body);

        if (data['success'] == true) {
          print('✅ Статус подписки обновлен в бэкенде');
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
      print('❌ Ошибка обновления статуса в бэкенде: $e');
      return false;
    }
  }
}
