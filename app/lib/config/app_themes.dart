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
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: Colors.black87),
        bodyMedium: TextStyle(color: Colors.black87),
        titleLarge: TextStyle(color: Colors.black87),
        titleMedium: TextStyle(color: Colors.black87),
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
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: Colors.white),
        bodyMedium: TextStyle(color: Colors.white),
        titleLarge: TextStyle(color: Colors.white),
        titleMedium: TextStyle(color: Colors.white),
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
