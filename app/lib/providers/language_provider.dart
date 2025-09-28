import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:easy_localization/easy_localization.dart';

class LanguageProvider with ChangeNotifier {
  static const String _languageKey = 'selected_language';

  Locale _currentLocale = const Locale('ru');

  Locale get currentLocale => _currentLocale;

  LanguageProvider() {
    _loadLanguage();
  }

  Future<void> initialize() async {
    await _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedLanguage = prefs.getString(_languageKey);
      if (savedLanguage != null) {
        _currentLocale = Locale(savedLanguage);
        notifyListeners();
      } else {
        // Если нет сохраненного языка, используем русский по умолчанию
        _currentLocale = const Locale('ru');
        notifyListeners();
      }
    } catch (e) {
      // Используем язык по умолчанию при ошибке
      _currentLocale = const Locale('ru');
      notifyListeners();
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

  // Синхронизация с EasyLocalization
  void syncWithEasyLocalization(BuildContext context) {
    final currentLocale = context.locale;
    if (_currentLocale != currentLocale) {
      _currentLocale = currentLocale;
      notifyListeners();
    }
  }

  String getLanguageDisplayName(String languageCode) {
    switch (languageCode) {
      case 'en':
        return 'English';
      case 'ru':
        return 'Русский';
      case 'zh':
        return '中文';
      case 'ja':
        return '日本語';
      case 'pt':
        return 'Português';
      case 'es':
        return 'Español';
      case 'tr':
        return 'Türkçe';
      case 'vi':
        return 'Tiếng Việt';
      case 'ko':
        return '한국어';
      case 'ar':
        return 'العربية';
      default:
        return 'English';
    }
  }

  List<Map<String, String>> get availableLanguages {
    return [
      {'code': 'en', 'name': 'English', 'native': 'English'},
      {'code': 'ru', 'name': 'Russian', 'native': 'Русский'},
      {'code': 'zh', 'name': 'Chinese', 'native': '中文'},
      {'code': 'ja', 'name': 'Japanese', 'native': '日本語'},
      {'code': 'pt', 'name': 'Portuguese', 'native': 'Português'},
      {'code': 'es', 'name': 'Spanish', 'native': 'Español'},
      {'code': 'tr', 'name': 'Turkish', 'native': 'Türkçe'},
      {'code': 'vi', 'name': 'Vietnamese', 'native': 'Tiếng Việt'},
      {'code': 'ko', 'name': 'Korean', 'native': '한국어'},
      {'code': 'ar', 'name': 'Arabic', 'native': 'العربية'},
    ];
  }
}
