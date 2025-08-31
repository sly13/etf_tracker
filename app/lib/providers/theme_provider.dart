import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_themes.dart';

class ThemeProvider with ChangeNotifier {
  static const String _themeKey = 'selected_theme';

  String _currentThemeKey = AppThemes.defaultTheme;

  String get currentThemeKey => _currentThemeKey;
  ThemeData get currentTheme => AppThemes.getTheme(_currentThemeKey);

  ThemeProvider() {
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedTheme = prefs.getString(_themeKey);
      if (savedTheme != null &&
          AppThemes.availableThemes.contains(savedTheme)) {
        _currentThemeKey = savedTheme;
        notifyListeners();
      }
    } catch (e) {
      // Используем тему по умолчанию при ошибке
      _currentThemeKey = AppThemes.defaultTheme;
    }
  }

  Future<void> setTheme(String themeKey) async {
    if (!AppThemes.availableThemes.contains(themeKey)) {
      return;
    }

    _currentThemeKey = themeKey;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_themeKey, themeKey);
    } catch (e) {
      // Игнорируем ошибки сохранения
    }
  }

  void toggleTheme() {
    final newTheme = _currentThemeKey == AppThemes.availableThemes[0]
        ? AppThemes.availableThemes[1]
        : AppThemes.availableThemes[0];
    setTheme(newTheme);
  }
}
