import 'package:firebase_analytics/firebase_analytics.dart';

/// Сервис для работы с Firebase Analytics
class AnalyticsService {
  static final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;

  /// Отправляет событие просмотра экрана
  static Future<void> logScreenView({
    required String screenName,
    String? screenClass,
  }) async {
    try {
      await _analytics.logScreenView(
        screenName: screenName,
        screenClass: screenClass,
      );
      print('📊 Analytics: Screen view logged - $screenName');
    } catch (e) {
      print('❌ Analytics error: Failed to log screen view - $e');
    }
  }

  /// Отправляет событие нажатия кнопки
  static Future<void> logButtonClick({
    required String buttonName,
    String? screenName,
    Map<String, dynamic>? parameters,
  }) async {
    try {
      final eventParams = <String, dynamic>{
        'button_name': buttonName,
        if (screenName != null) 'screen_name': screenName,
        ...?parameters,
      };

      await _analytics.logEvent(
        name: 'button_click',
        parameters: eventParams.cast<String, Object>(),
      );
      print('📊 Analytics: Button click logged - $buttonName');
    } catch (e) {
      print('❌ Analytics error: Failed to log button click - $e');
    }
  }

  /// Отправляет событие просмотра ETF данных
  static Future<void> logETFDataView({
    required String etfType, // 'bitcoin' или 'ethereum'
    String? fundName,
    Map<String, dynamic>? additionalParams,
  }) async {
    try {
      final eventParams = <String, dynamic>{
        'etf_type': etfType,
        if (fundName != null) 'fund_name': fundName,
        ...?additionalParams,
      };

      await _analytics.logEvent(
        name: 'etf_data_view',
        parameters: eventParams.cast<String, Object>(),
      );
      print('📊 Analytics: ETF data view logged - $etfType');
    } catch (e) {
      print('❌ Analytics error: Failed to log ETF data view - $e');
    }
  }

  /// Отправляет событие обновления данных
  static Future<void> logDataRefresh({
    required String dataType, // 'etf_flows', 'crypto_prices'
    bool success = true,
    String? errorMessage,
  }) async {
    try {
      final eventParams = <String, dynamic>{
        'data_type': dataType,
        'success': success,
        if (errorMessage != null) 'error_message': errorMessage,
      };

      await _analytics.logEvent(
        name: 'data_refresh',
        parameters: eventParams.cast<String, Object>(),
      );
      print(
        '📊 Analytics: Data refresh logged - $dataType (success: $success)',
      );
    } catch (e) {
      print('❌ Analytics error: Failed to log data refresh - $e');
    }
  }

  /// Отправляет событие изменения темы
  static Future<void> logThemeChange({
    required String themeMode, // 'light', 'dark', 'system'
  }) async {
    try {
      await _analytics.logEvent(
        name: 'theme_change',
        parameters: {'theme_mode': themeMode},
      );
      print('📊 Analytics: Theme change logged - $themeMode');
    } catch (e) {
      print('❌ Analytics error: Failed to log theme change - $e');
    }
  }

  /// Отправляет событие изменения языка
  static Future<void> logLanguageChange({
    required String languageCode, // 'en', 'ru'
  }) async {
    try {
      await _analytics.logEvent(
        name: 'language_change',
        parameters: {'language_code': languageCode},
      );
      print('📊 Analytics: Language change logged - $languageCode');
    } catch (e) {
      print('❌ Analytics error: Failed to log language change - $e');
    }
  }

  /// Отправляет событие подписки
  static Future<void> logSubscriptionEvent({
    required String eventType, // 'started', 'completed', 'cancelled', 'failed'
    String? packageName,
    String? productId,
    Map<String, dynamic>? additionalParams,
  }) async {
    try {
      final eventParams = <String, dynamic>{
        'event_type': eventType,
        if (packageName != null) 'package_name': packageName,
        if (productId != null) 'product_id': productId,
        ...?additionalParams,
      };

      await _analytics.logEvent(
        name: 'subscription_event',
        parameters: eventParams.cast<String, Object>(),
      );
      print('📊 Analytics: Subscription event logged - $eventType');
    } catch (e) {
      print('❌ Analytics error: Failed to log subscription event - $e');
    }
  }

  /// Отправляет событие ошибки
  static Future<void> logError({
    required String errorType,
    required String errorMessage,
    String? screenName,
    Map<String, dynamic>? additionalParams,
  }) async {
    try {
      final eventParams = <String, dynamic>{
        'error_type': errorType,
        'error_message': errorMessage,
        if (screenName != null) 'screen_name': screenName,
        ...?additionalParams,
      };

      await _analytics.logEvent(
        name: 'app_error',
        parameters: eventParams.cast<String, Object>(),
      );
      print('📊 Analytics: Error logged - $errorType');
    } catch (e) {
      print('❌ Analytics error: Failed to log error - $e');
    }
  }

  /// Отправляет событие времени сессии
  static Future<void> logSessionDuration({
    required int durationInSeconds,
    String? screenName,
  }) async {
    try {
      await _analytics.logEvent(
        name: 'session_duration',
        parameters: {
          'duration_seconds': durationInSeconds,
          if (screenName != null) 'screen_name': screenName,
        },
      );
      print('📊 Analytics: Session duration logged - ${durationInSeconds}s');
    } catch (e) {
      print('❌ Analytics error: Failed to log session duration - $e');
    }
  }

  /// Устанавливает пользовательские свойства
  static Future<void> setUserProperty({
    required String name,
    required String value,
  }) async {
    try {
      await _analytics.setUserProperty(name: name, value: value);
      print('📊 Analytics: User property set - $name: $value');
    } catch (e) {
      print('❌ Analytics error: Failed to set user property - $e');
    }
  }

  /// Получает экземпляр FirebaseAnalytics для прямого использования
  static FirebaseAnalytics get instance => _analytics;
}
