import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

class AppThemes {
  static const String _lightThemeKey = 'light';
  static const String _darkThemeKey = 'dark';

  static const String defaultTheme = _darkThemeKey;

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blue,
        brightness: Brightness.light,
      ),
      useMaterial3: true,
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
      ),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        color: Colors.white,
      ),
      scaffoldBackgroundColor: Colors.grey[50],
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        elevation: 0, // Убираем тень
        showUnselectedLabels: true,
      ),
      textTheme: const TextTheme(
        // Используем адаптивные размеры шрифтов
        displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w400),
        displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w400),
        displaySmall: TextStyle(fontSize: 24, fontWeight: FontWeight.w400),
        headlineLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.w400),
        headlineMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w400),
        headlineSmall: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        titleLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        titleMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
        titleSmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
        bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
        bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
        bodySmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
        labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
        labelMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
        labelSmall: TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      colorScheme: ColorScheme.dark(
        primary: Colors.blue[300]!,
        surface: const Color(0xFF0A0A0A),
        onSurface: Colors.white,
        outline: Colors.grey[800]!,
      ),
      useMaterial3: true,
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
        backgroundColor: Color(0xFF0A0A0A),
        foregroundColor: Colors.white,
        surfaceTintColor: Color(0xFF0A0A0A), // Явно указываем цвет поверхности
      ),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        color: const Color(0xFF1A1A1A),
      ),
      scaffoldBackgroundColor: const Color(0xFF0A0A0A),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        selectedItemColor: Colors.blue[300],
        unselectedItemColor: Colors.grey[500],
        type: BottomNavigationBarType.fixed,
        backgroundColor: const Color(0xFF1A1A1A),
        elevation: 0, // Убираем тень
        showUnselectedLabels: true,
      ),
      textTheme: const TextTheme(
        // Используем адаптивные размеры шрифтов для темной темы
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w400,
          color: Colors.white,
        ),
        displayMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w400,
          color: Colors.white,
        ),
        displaySmall: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w400,
          color: Colors.white,
        ),
        headlineLarge: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w400,
          color: Colors.white,
        ),
        headlineMedium: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w400,
          color: Colors.white,
        ),
        headlineSmall: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w400,
          color: Colors.white,
        ),
        titleLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: Colors.white,
        ),
        titleMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Colors.white,
        ),
        titleSmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: Colors.white,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: Colors.white,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: Colors.white,
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: Colors.white,
        ),
        labelLarge: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Colors.white,
        ),
        labelMedium: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: Colors.white,
        ),
        labelSmall: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: Colors.white,
        ),
      ),
    );
  }

  static ThemeData getTheme(String themeKey) {
    switch (themeKey) {
      case _darkThemeKey:
        return darkTheme;
      case _lightThemeKey:
      default:
        return lightTheme;
    }
  }

  static String getThemeKey(ThemeData theme) {
    if (theme.brightness == Brightness.dark) {
      return _darkThemeKey;
    }
    return _lightThemeKey;
  }

  static List<String> get availableThemes {
    return [_lightThemeKey, _darkThemeKey];
  }

  static String getThemeDisplayName(String themeKey) {
    switch (themeKey) {
      case _lightThemeKey:
        return 'settings.light_theme'.tr();
      case _darkThemeKey:
        return 'settings.dark_theme'.tr();
      default:
        return 'settings.light_theme'.tr();
    }
  }
}
