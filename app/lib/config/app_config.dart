import 'dart:io';
import 'package:flutter/foundation.dart';

class AppConfig {
  static const String _defaultBackendUrl = 'https://etf-flow.vadimsemenko.ru';
  static const String _defaultLocalBackendUrl = 'http://localhost:3066';

  // Определяем, запущено ли приложение в режиме отладки
  static bool get isDebugMode => !kReleaseMode;

  // Получаем базовый URL бэкенда
  static String get backendBaseUrl {
    // В режиме отладки используем локальный URL, иначе - продакшн
    if (isDebugMode) {
      return _defaultLocalBackendUrl;
    }
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
