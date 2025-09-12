import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/theme_provider.dart';
import '../services/analytics_service.dart';
import '../utils/haptic_feedback.dart';

class ThemeSelectionScreen extends StatelessWidget {
  const ThemeSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('settings.theme'.tr()),
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? const Color(0xFF0A0A0A)
            : Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return ListView(
            children: [
              _buildThemeOption(
                context,
                'settings.light_theme'.tr(),
                'light',
                themeProvider.currentThemeKey,
                themeProvider,
                Icons.light_mode,
              ),
              _buildThemeOption(
                context,
                'settings.dark_theme'.tr(),
                'dark',
                themeProvider.currentThemeKey,
                themeProvider,
                Icons.dark_mode,
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildThemeOption(
    BuildContext context,
    String title,
    String value,
    String currentValue,
    ThemeProvider themeProvider,
    IconData icon,
  ) {
    final isSelected = currentValue == value;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListTile(
      leading: Icon(
        icon,
        color: isSelected
            ? Colors.blue
            : (isDark
                  ? Colors.grey.withOpacity(0.6)
                  : Colors.grey.withOpacity(0.7)),
      ),
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
      trailing: isSelected
          ? Icon(Icons.check, color: Colors.blue, size: 20)
          : null,
      onTap: () {
        HapticUtils.selectionChanged();

        // Логируем изменение темы
        AnalyticsService.logThemeChange(themeMode: value.toString());

        themeProvider.setTheme(value);
      },
    );
  }
}
