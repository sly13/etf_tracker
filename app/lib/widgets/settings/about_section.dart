import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../providers/onboarding_provider.dart';

class AboutSection extends StatefulWidget {
  const AboutSection({super.key});

  @override
  State<AboutSection> createState() => _AboutSectionState();
}

class _AboutSectionState extends State<AboutSection> {
  int _versionTapCount = 0;
  String _appVersion = '1.0.0'; // Версия по умолчанию

  @override
  void initState() {
    super.initState();
    _loadAppVersion();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        Text(
          'settings.about'.tr(),
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1C1C1E) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDark
                  ? Colors.grey.withOpacity(0.2)
                  : Colors.grey.withOpacity(0.3),
              width: 0.5,
            ),
            boxShadow: isDark
                ? null
                : [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'app.title'.tr(),
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 4),
                    GestureDetector(
                      onTap: _onVersionTap,
                      child: Text(
                        '${'settings.version'.tr()} $_appVersion',
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark
                              ? Colors.grey.withOpacity(0.6)
                              : Colors.grey.withOpacity(0.5),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  'app.description'.tr(),
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark
                        ? Colors.grey.withOpacity(0.8)
                        : Colors.grey.withOpacity(0.6),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _loadAppVersion() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      if (mounted) {
        setState(() {
          _appVersion = packageInfo.version;
        });
      }
    } catch (e) {
      // Если не удалось загрузить версию, оставляем значение по умолчанию
      print('Ошибка загрузки версии приложения: $e');
    }
  }

  Future<void> _onVersionTap() async {
    setState(() {
      _versionTapCount++;
    });

    if (_versionTapCount >= 5) {
      // Сбрасываем счетчик
      _versionTapCount = 0;

      // Сбрасываем онбординг
      final onboardingProvider = Provider.of<OnboardingProvider>(
        context,
        listen: false,
      );
      await onboardingProvider.resetOnboarding();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Онбординг сброшен. Перезапустите приложение.'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }
}

