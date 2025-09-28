import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/language_provider.dart';
import '../services/analytics_service.dart';
import '../utils/haptic_feedback.dart';

class LanguageSelectionScreen extends StatelessWidget {
  const LanguageSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('settings.language'.tr()),
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? const Color(0xFF0A0A0A)
            : Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Consumer<LanguageProvider>(
        builder: (context, languageProvider, child) {
          final currentLanguage = context.locale.languageCode;
          return ListView(
            children: [
              _buildLanguageOption(
                context,
                'settings.english'.tr(),
                'English',
                'en',
                currentLanguage,
                languageProvider,
                '🇺🇸',
              ),
              _buildLanguageOption(
                context,
                'settings.russian'.tr(),
                'Русский',
                'ru',
                currentLanguage,
                languageProvider,
                '🇷🇺',
              ),
              _buildLanguageOption(
                context,
                'Chinese',
                '中文',
                'zh',
                currentLanguage,
                languageProvider,
                '🇨🇳',
              ),
              _buildLanguageOption(
                context,
                'Japanese',
                '日本語',
                'ja',
                currentLanguage,
                languageProvider,
                '🇯🇵',
              ),
              _buildLanguageOption(
                context,
                'Portuguese',
                'Português',
                'pt',
                currentLanguage,
                languageProvider,
                '🇵🇹',
              ),
              _buildLanguageOption(
                context,
                'Spanish',
                'Español',
                'es',
                currentLanguage,
                languageProvider,
                '🇪🇸',
              ),
              _buildLanguageOption(
                context,
                'Turkish',
                'Türkçe',
                'tr',
                currentLanguage,
                languageProvider,
                '🇹🇷',
              ),
              _buildLanguageOption(
                context,
                'Vietnamese',
                'Tiếng Việt',
                'vi',
                currentLanguage,
                languageProvider,
                '🇻🇳',
              ),
              _buildLanguageOption(
                context,
                'Korean',
                '한국어',
                'ko',
                currentLanguage,
                languageProvider,
                '🇰🇷',
              ),
              _buildLanguageOption(
                context,
                'Arabic',
                'العربية',
                'ar',
                currentLanguage,
                languageProvider,
                '🇸🇦',
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildLanguageOption(
    BuildContext context,
    String title,
    String subtitle,
    String value,
    String currentValue,
    LanguageProvider languageProvider,
    String flag,
  ) {
    final isSelected = currentValue == value;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListTile(
      leading: Text(flag, style: const TextStyle(fontSize: 24)),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          color: isSelected
              ? (isDark ? Colors.white : Colors.black87)
              : (isDark
                    ? Colors.grey.withOpacity(0.8)
                    : Colors.grey.withOpacity(0.7)),
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
          fontSize: 14,
          color: isDark
              ? Colors.grey.withOpacity(0.6)
              : Colors.grey.withOpacity(0.5),
        ),
      ),
      trailing: isSelected
          ? Icon(Icons.check, color: Colors.blue, size: 20)
          : null,
      onTap: () {
        HapticUtils.selectionChanged();

        // Логируем изменение языка
        AnalyticsService.logLanguageChange(languageCode: value);

        final locale = Locale(value);
        languageProvider.setLanguage(locale);
        context.setLocale(locale);
      },
    );
  }
}
