import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:io';

class AppConfig {
  static const String _defaultBackendUrl = 'https://api-etf.vadimsemenko.ru';
  // Для iOS симулятора используем IP адрес Mac, для других платформ - localhost
  // IP адрес можно переопределить через LOCAL_BACKEND_HOST в .env
  static String get _defaultLocalBackendUrl {
    // Проверяем, указан ли хост в .env
    try {
      final localHost = dotenv.env['LOCAL_BACKEND_HOST'];
      if (localHost != null && localHost.isNotEmpty) {
        return 'http://$localHost:3066';
      }
    } catch (e) {
      // Игнорируем ошибки
    }

    // На iOS симуляторе используем IP адрес Mac (можно указать в .env)
    // Для других платформ используем localhost
    if (Platform.isIOS) {
      // По умолчанию для iOS используем IP адрес Mac
      // Можно указать LOCAL_BACKEND_HOST=192.168.10.244 в .env
      return 'http://192.168.10.244:3066';
    }

    // Для Android и других платформ используем localhost
    return 'http://127.0.0.1:3066';
  }

  // Название приложения для регистрации в бэкенде
  static const String appName = 'etf.flow';

  // Название Telegram бота по умолчанию
  static const String _defaultTelegramBotName = 'etf_flows_bot';

  // URL-адреса для юридических документов
  static const String _defaultTermsOfUseUrl =
      'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
  static const String _defaultPrivacyPolicyUrl =
      'https://www.privacypolicies.com/live/2e0d5b0f-786f-45a6-be4e-e7bc311d30d6';

  // Определяем, запущено ли приложение в режиме отладки
  static bool get isDebugMode => !kReleaseMode;

  // Проверяем, нужно ли использовать продакшн бэкенд из .env
  // Переменная USE_PRODUCTION_BACKEND=true принудительно включает продакшн URL
  // Если не установлена, в debug режиме используется локальный URL, в release - продакшн
  static bool get _shouldUseProductionBackend {
    try {
      final useProduction = dotenv.env['USE_PRODUCTION_BACKEND'];
      if (useProduction != null && useProduction.isNotEmpty) {
        final isProduction =
            useProduction.toLowerCase() == 'true' ||
            useProduction.toLowerCase() == '1';
        return isProduction;
      }
    } catch (e) {
      // Игнорируем ошибки
    }

    // Если переменная не установлена, используем логику по умолчанию:
    // в debug режиме - локальный, в release - продакшн
    return !isDebugMode;
  }

  // Получаем базовый URL бэкенда
  // Управляется через переменную USE_PRODUCTION_BACKEND в .env
  // Если USE_PRODUCTION_BACKEND=true - используется BACKEND_API_URL
  // Если USE_PRODUCTION_BACKEND=false - используется локальный URL
  // Если не установлена - используется логика по умолчанию (debug=локальный, release=продакшн)
  static String get backendBaseUrl {
    // Проверяем, нужно ли использовать продакшн бэкенд
    if (_shouldUseProductionBackend) {
      // Используем продакшн URL из .env или дефолтный
      try {
        final envBackendUrl = dotenv.env['BACKEND_API_URL'];
        if (envBackendUrl != null && envBackendUrl.isNotEmpty) {
          // Убираем /api из конца, если есть (добавляется в getApiUrl)
          final cleanUrl = envBackendUrl.endsWith('/api')
              ? envBackendUrl.substring(0, envBackendUrl.length - 4)
              : envBackendUrl;
          print('🔧 Используем продакшн URL из BACKEND_API_URL: $cleanUrl');
          return cleanUrl;
        }
      } catch (e) {
        print('⚠️ Ошибка получения BACKEND_API_URL из .env: $e');
      }

      // Если переменной окружения нет, используем продакшн URL по умолчанию
      print('🔧 Используем продакшн URL по умолчанию: $_defaultBackendUrl');
      return _defaultBackendUrl;
    }

    // Используем локальный URL
    print('🔧 Используем локальный URL: $_defaultLocalBackendUrl');
    return _defaultLocalBackendUrl;
  }

  // Получаем полный URL для API
  static String getApiUrl(String endpoint) {
    return '$backendBaseUrl/api$endpoint';
  }

  // Метод для принудительного переключения на локальный бэкенд
  static String getLocalBackendUrl(String endpoint) {
    return '$_defaultLocalBackendUrl$endpoint';
  }

  // Метод для принудительного переключения на продакшн бэкенд
  static String getProductionBackendUrl(String endpoint) {
    return '$_defaultBackendUrl$endpoint';
  }

  // Получаем название Telegram бота
  static String get telegramBotName {
    try {
      // Сначала проверяем переменную окружения
      final envBotName = dotenv.env['TELEGRAM_BOT_NAME'];
      if (envBotName != null && envBotName.isNotEmpty) {
        print('🔧 Используем TELEGRAM_BOT_NAME из .env: $envBotName');
        return envBotName;
      }
    } catch (e) {
      print('⚠️ Ошибка получения TELEGRAM_BOT_NAME из .env: $e');
    }

    // Используем название по умолчанию
    print('🔧 Используем название бота по умолчанию: $_defaultTelegramBotName');
    return _defaultTelegramBotName;
  }

  // Получаем URL для Terms of Use
  static String get termsOfUseUrl {
    try {
      final envTermsUrl = dotenv.env['TERMS_OF_USE_URL'];
      if (envTermsUrl != null && envTermsUrl.isNotEmpty) {
        return envTermsUrl;
      }
    } catch (e) {
      print('⚠️ Ошибка получения TERMS_OF_USE_URL из .env: $e');
    }
    return _defaultTermsOfUseUrl;
  }

  // Получаем URL для Privacy Policy
  static String get privacyPolicyUrl {
    try {
      final envPrivacyUrl = dotenv.env['PRIVACY_POLICY_URL'];
      if (envPrivacyUrl != null && envPrivacyUrl.isNotEmpty) {
        return envPrivacyUrl;
      }
    } catch (e) {
      print('⚠️ Ошибка получения PRIVACY_POLICY_URL из .env: $e');
    }
    return _defaultPrivacyPolicyUrl;
  }

  // Получаем информацию о текущем окружении
  static String get environmentInfo {
    final backendUrl = backendBaseUrl;
    final buildMode = isDebugMode ? 'Debug' : 'Release';
    final envMode = _shouldUseProductionBackend ? 'Production' : 'Development';
    return '$buildMode | $envMode Backend: $backendUrl';
  }
}
