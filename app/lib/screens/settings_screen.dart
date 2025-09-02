import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/theme_provider.dart';
import '../providers/language_provider.dart';
import '../config/app_themes.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('settings.title'.tr()),
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? const Color(0xFF0A0A0A)
            : Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Consumer2<ThemeProvider, LanguageProvider>(
        builder: (context, themeProvider, languageProvider, child) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildSectionHeader('settings.appearance'.tr()),
              const SizedBox(height: 8),
              _buildThemeSelector(context, themeProvider),
              const SizedBox(height: 16),
              _buildLanguageSelector(context, languageProvider),
              const SizedBox(height: 24),
              _buildSectionHeader('settings.about'.tr()),
              const SizedBox(height: 8),
              _buildAboutCard(context),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildThemeSelector(
    BuildContext context,
    ThemeProvider themeProvider,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'settings.theme'.tr(),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            ...AppThemes.availableThemes.map((themeKey) {
              return RadioListTile<String>(
                title: Text(AppThemes.getThemeDisplayName(themeKey)),
                value: themeKey,
                groupValue: themeProvider.currentThemeKey,
                onChanged: (value) {
                  if (value != null) {
                    themeProvider.setTheme(value);
                  }
                },
                activeColor: Theme.of(context).colorScheme.primary,
                contentPadding: EdgeInsets.zero,
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageSelector(
    BuildContext context,
    LanguageProvider languageProvider,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'settings.language'.tr(),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            ...languageProvider.availableLanguages.map((language) {
              return RadioListTile<String>(
                title: Text(language['native']!),
                subtitle: Text(language['name']!),
                value: language['code']!,
                groupValue: languageProvider.currentLocale.languageCode,
                onChanged: (value) async {
                  if (value != null) {
                    print('🔧 Переключение языка на: $value');
                    final locale = value == 'en'
                        ? const Locale('en')
                        : const Locale('ru');
                    print('🔧 Создана локаль: ${locale.languageCode}');
                    context.setLocale(locale);
                    print('🔧 EasyLocalization обновлен');

                    // Перезагружаем экран для применения изменений
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const SettingsScreen(),
                      ),
                    );
                  }
                },
                activeColor: Theme.of(context).colorScheme.primary,
                contentPadding: EdgeInsets.zero,
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildAboutCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'app.title'.tr(),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(
              'settings.version'.tr() + ' 1.0.0',
              style: const TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 8),
            Text('app.description'.tr(), style: const TextStyle(fontSize: 14)),
          ],
        ),
      ),
    );
  }
}
