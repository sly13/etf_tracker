import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../providers/theme_provider.dart';
import '../../utils/haptic_feedback.dart';
import '../../screens/theme_selection_screen.dart';

class AppearanceSection extends StatelessWidget {
  const AppearanceSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final currentTheme = themeProvider.currentThemeKey;

        return Container(
          margin: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1C1C1E) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDark
                  ? Colors.grey.withOpacity(0.2)
                  : Colors.grey.withOpacity(0.3),
              width: 0.5,
            ),
          ),
          child: ListTile(
            leading: Icon(
              Icons.palette_outlined,
              color: isDark ? Colors.white : Colors.black87,
            ),
            title: Text(
              'settings.theme'.tr(),
              style: TextStyle(
                fontSize: 16,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            subtitle: Text(
              currentTheme == 'light'
                  ? 'settings.light_theme'.tr()
                  : 'settings.dark_theme'.tr(),
              style: TextStyle(
                fontSize: 14,
                color: isDark
                    ? Colors.grey.withOpacity(0.6)
                    : Colors.grey.withOpacity(0.5),
              ),
            ),
            trailing: Icon(
              Icons.chevron_right,
              color: isDark
                  ? Colors.grey.withOpacity(0.6)
                  : Colors.grey.withOpacity(0.7),
              size: 20,
            ),
            onTap: () {
              HapticUtils.lightImpact();
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ThemeSelectionScreen(),
                ),
              );
            },
          ),
        );
      },
    );
  }
}

