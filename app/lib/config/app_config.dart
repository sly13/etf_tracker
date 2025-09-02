import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static const String _defaultBackendUrl = 'https://etf-flow.vadimsemenko.ru';
  static const String _defaultLocalBackendUrl = 'http://192.168.100.94:3066';

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
    return '$backendBaseUrl$endpoint';
  }

  // Метод для принудительного переключения на локальный бэкенд
  static String getLocalBackendUrl(String endpoint) {
    return '$_defaultLocalBackendUrl$endpoint';
  }

  // Метод для принудительного переключения на продакшн бэкенд
  static String getProductionBackendUrl(String endpoint) {
    return '$_defaultBackendUrl$endpoint';
  }

  // Получаем информацию о текущем окружении
  static String get environmentInfo {
    if (isDebugMode) {
      return 'Development (Local Backend: $_defaultLocalBackendUrl)';
    }
    return 'Production (Server Backend: $_defaultBackendUrl)';
  }
}
