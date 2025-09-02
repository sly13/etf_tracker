import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:easy_localization/easy_localization.dart';

class LanguageProvider with ChangeNotifier {
  static const String _languageKey = 'selected_language';

  Locale _currentLocale = const Locale('en');

  Locale get currentLocale => _currentLocale;

  LanguageProvider() {
    _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedLanguage = prefs.getString(_languageKey);
      if (savedLanguage != null) {
        _currentLocale = Locale(savedLanguage);
        notifyListeners();
      }
    } catch (e) {
      // Используем язык по умолчанию при ошибке
      _currentLocale = const Locale('en');
    }
  }

  Future<void> setLanguage(Locale locale) async {
    _currentLocale = locale;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_languageKey, locale.languageCode);
    } catch (e) {
      // Игнорируем ошибки сохранения
    }
  }

  String getLanguageDisplayName(String languageCode) {
    switch (languageCode) {
      case 'en':
        return 'English';
      case 'ru':
        return 'Русский';
      default:
        return 'English';
    }
  }

  List<Map<String, String>> get availableLanguages {
    return [
      {'code': 'en', 'name': 'English', 'native': 'English'},
      {'code': 'ru', 'name': 'Russian', 'native': 'Русский'},
    ];
  }
}
