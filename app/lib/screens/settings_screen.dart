import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../services/analytics_service.dart';
import '../utils/card_style_utils.dart';
import '../utils/adaptive_text_utils.dart';
import '../widgets/settings/appearance_section.dart';
import '../widgets/settings/language_section.dart';
import '../widgets/settings/notification_section.dart';
import '../widgets/settings/subscription_section.dart';
import '../widgets/settings/about_section.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  void initState() {
    super.initState();

    // Логируем просмотр экрана настроек
    AnalyticsService.logScreenView(screenName: 'settings');

    // Статус подписки загружается из store автоматически через Consumer в SubscriptionSection
    // Запрос к серверу выполняется только при клике на кнопку "Refresh Status"
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: AdaptiveTextUtils.getContentPadding(context),
          children: [
            // Заголовок как в Fund Holdings
            Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: Text(
                'settings.title'.tr(),
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: CardStyleUtils.getTitleColor(context),
                ),
              ),
            ),
            // Внешний вид
            const AppearanceSection(),

            // Язык
            const LanguageSection(),

            // Уведомления
            const NotificationSection(),

            // Подписка
            const SubscriptionSection(),

            // О приложении
            const AboutSection(),
          ],
        ),
      ),
    );
  }
}
