import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static const String _defaultBackendUrl = 'https://etf-flow.vadimsemenko.ru';
  static const String _defaultLocalBackendUrl = 'http://localhost:3066';

  // Название приложения для регистрации в бэкенде
  static const String appName = 'etf.flow';

  // Название Telegram бота по умолчанию
  static const String _defaultTelegramBotName = 'etf_flows_bot';

  // Определяем, запущено ли приложение в режиме отладки
  static bool get isDebugMode => !kReleaseMode;

  // Получаем базовый URL бэкенда
  static String get backendBaseUrl {
    try {
      // Сначала проверяем переменную окружения
      final envBackendUrl = dotenv.env['BACKEND_URL'];
      if (envBackendUrl != null && envBackendUrl.isNotEmpty) {
        print('🔧 Используем BACKEND_URL из .env: $envBackendUrl');
        return envBackendUrl;
      }
    } catch (e) {
      print('⚠️ Ошибка получения BACKEND_URL из .env: $e');
    }

    // В режиме отладки используем локальный URL, иначе - продакшн
    if (isDebugMode) {
      print('🔧 Используем локальный URL: $_defaultLocalBackendUrl');
      return _defaultLocalBackendUrl;
    }
    print('🔧 Используем продакшн URL: $_defaultBackendUrl');
    return _defaultBackendUrl;
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

  // Получаем информацию о текущем окружении
  static String get environmentInfo {
    if (isDebugMode) {
      return 'Development (Local Backend: $_defaultLocalBackendUrl)';
    }
    return 'Production (Server Backend: $_defaultBackendUrl)';
  }
}
