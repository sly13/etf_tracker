import 'dart:io';

class PlatformUtils {
  /// Проверяет, запущено ли приложение на iOS
  static bool get isIOS => Platform.isIOS;

  /// Проверяет, запущено ли приложение на macOS
  static bool get isMacOS => Platform.isMacOS;

  /// Проверяет, запущено ли приложение на Android
  static bool get isAndroid => Platform.isAndroid;

  /// Проверяет, запущено ли приложение на мобильном устройстве
  static bool get isMobile => Platform.isIOS || Platform.isAndroid;

  /// Проверяет, запущено ли приложение на десктопе
  static bool get isDesktop =>
      Platform.isMacOS || Platform.isWindows || Platform.isLinux;

  /// Возвращает название платформы для отладки
  static String get platformName {
    if (isIOS) return 'iOS';
    if (isMacOS) return 'macOS';
    if (isAndroid) return 'Android';
    if (Platform.isWindows) return 'Windows';
    if (Platform.isLinux) return 'Linux';
    return 'Unknown';
  }

  /// Проверяет, поддерживается ли виджет на текущей платформе
  static bool get supportsWidgets {
    return isIOS || isMacOS;
  }

  /// Возвращает размеры для адаптивного дизайна
  static Map<String, double> get adaptiveSizes {
    if (isMacOS) {
      return {
        'padding': 24.0,
        'borderRadius': 12.0,
        'iconSize': 24.0,
        'fontSize': 16.0,
        'buttonHeight': 48.0,
        'cardSpacing': 16.0,
      };
    } else if (isIOS) {
      return {
        'padding': 16.0,
        'borderRadius': 8.0,
        'iconSize': 20.0,
        'fontSize': 14.0,
        'buttonHeight': 44.0,
        'cardSpacing': 12.0,
      };
    } else {
      return {
        'padding': 16.0,
        'borderRadius': 8.0,
        'iconSize': 20.0,
        'fontSize': 14.0,
        'buttonHeight': 44.0,
        'cardSpacing': 12.0,
      };
    }
  }
}




