import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:io';
import 'dart:convert';
import 'dart:io' show HttpClient, ContentType;
import '../providers/theme_provider.dart';
import '../providers/language_provider.dart';
import '../services/subscription_service.dart';
import '../services/analytics_service.dart';
import '../utils/haptic_feedback.dart';
import '../widgets/pro_button.dart';
import '../config/app_config.dart';
import 'notification_settings_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isCheckingSubscription = false;
  bool? _cachedSubscriptionStatus;

  @override
  void initState() {
    super.initState();

    // Логируем просмотр экрана настроек
    AnalyticsService.logScreenView(screenName: 'settings');

    // Обновляем статус подписки при открытии экрана
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          _refreshSubscriptionStatus();
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('settings.title'.tr()),
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? const Color(0xFF0A0A0A)
            : Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
        actions: [
          // Кнопка Pro
          const ProButton(),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Внешний вид
            _buildAppearanceSection(),
            const SizedBox(height: 24),

            // Язык
            _buildLanguageSection(),
            const SizedBox(height: 24),

            // Подписка
            _buildSubscriptionSection(),
            const SizedBox(height: 24),

            // Уведомления
            _buildNotificationSection(),
            const SizedBox(height: 24),

            // О приложении
            _buildAboutSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildAppearanceSection() {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        final isDark = Theme.of(context).brightness == Brightness.dark;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'settings.appearance'.tr(),
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 20),
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
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: Colors.grey.withOpacity(0.2),
                          width: 0.5,
                        ),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.palette_outlined,
                          color: isDark
                              ? Colors.grey.withOpacity(0.6)
                              : Colors.grey.withOpacity(0.7),
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'settings.theme'.tr(),
                            style: TextStyle(
                              fontSize: 16,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                        ),
                        Icon(
                          Icons.chevron_right,
                          color: isDark
                              ? Colors.grey.withOpacity(0.6)
                              : Colors.grey.withOpacity(0.7),
                          size: 20,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildThemeOption(
                          'settings.light_theme'.tr(),
                          'light',
                          themeProvider.currentThemeKey,
                          themeProvider,
                        ),
                        const SizedBox(height: 12),
                        _buildThemeOption(
                          'settings.dark_theme'.tr(),
                          'dark',
                          themeProvider.currentThemeKey,
                          themeProvider,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildThemeOption(
    String title,
    String value,
    String currentValue,
    ThemeProvider themeProvider,
  ) {
    final isSelected = currentValue == value;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        HapticUtils.selectionChanged();

        // Логируем изменение темы
        AnalyticsService.logThemeChange(themeMode: value.toString());

        themeProvider.setTheme(value);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: isSelected
              ? Colors.blue.withOpacity(isDark ? 0.1 : 0.05)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? Colors.blue
                : (isDark
                      ? Colors.grey.withOpacity(0.3)
                      : Colors.grey.withOpacity(0.4)),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
              color: isSelected
                  ? Colors.blue
                  : (isDark
                        ? Colors.grey.withOpacity(0.6)
                        : Colors.grey.withOpacity(0.7)),
              size: 20,
            ),
            const SizedBox(width: 12),
            Text(
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
          ],
        ),
      ),
    );
  }

  Widget _buildSubscriptionSection() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'subscription.status'.tr(),
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 20),
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
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: Colors.grey.withOpacity(0.2),
                      width: 0.5,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      _cachedSubscriptionStatus == true
                          ? Icons.star
                          : Icons.lock_outline,
                      color: _cachedSubscriptionStatus == true
                          ? Colors.green
                          : Colors.grey,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'subscription.current_plan'.tr(),
                            style: TextStyle(
                              fontSize: 16,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _cachedSubscriptionStatus == true
                                ? 'subscription.premium'.tr()
                                : 'subscription.basic'.tr(),
                            style: TextStyle(
                              fontSize: 14,
                              color: _cachedSubscriptionStatus == true
                                  ? Colors.green
                                  : Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (_isCheckingSubscription)
                      const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.blue,
                          ),
                        ),
                      )
                    else
                      Icon(
                        Icons.chevron_right,
                        color: Colors.grey.withOpacity(0.6),
                        size: 20,
                      ),
                  ],
                ),
              ),
              GestureDetector(
                onTap: _isCheckingSubscription
                    ? null
                    : () async {
                        HapticUtils.lightImpact();
                        await _refreshSubscriptionStatus();
                      },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.refresh, color: Colors.blue, size: 20),
                      const SizedBox(width: 12),
                      Text(
                        'subscription.refresh_status'.tr(),
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.blue,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Telegram Settings
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(
                      color: Colors.grey.withOpacity(0.2),
                      width: 0.5,
                    ),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.telegram,
                          color: const Color(0xFF0088cc),
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Получать уведомления в Telegram',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                  color: isDark ? Colors.white : Colors.black87,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Получайте обновления ETF прямо в Telegram',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: isDark
                                      ? Colors.grey.withOpacity(0.6)
                                      : Colors.grey.withOpacity(0.5),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          HapticUtils.lightImpact();
                          _openTelegramBot();
                        },
                        icon: const Icon(Icons.telegram, color: Colors.white),
                        label: const Text(
                          'Открыть Telegram бота',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0088cc),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLanguageSection() {
    return Consumer<LanguageProvider>(
      builder: (context, languageProvider, child) {
        final isDark = Theme.of(context).brightness == Brightness.dark;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'settings.language'.tr(),
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 20),
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
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: Colors.grey.withOpacity(0.2),
                          width: 0.5,
                        ),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.language,
                          color: isDark
                              ? Colors.grey.withOpacity(0.6)
                              : Colors.grey.withOpacity(0.7),
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'settings.language'.tr(),
                            style: TextStyle(
                              fontSize: 16,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                        ),
                        Icon(
                          Icons.chevron_right,
                          color: isDark
                              ? Colors.grey.withOpacity(0.6)
                              : Colors.grey.withOpacity(0.7),
                          size: 20,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildLanguageOption(
                          'settings.english'.tr(),
                          'English',
                          'en',
                          languageProvider.currentLocale.languageCode,
                          languageProvider,
                          context,
                        ),
                        const SizedBox(height: 12),
                        _buildLanguageOption(
                          'settings.russian'.tr(),
                          'Русский',
                          'ru',
                          languageProvider.currentLocale.languageCode,
                          languageProvider,
                          context,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildLanguageOption(
    String title,
    String subtitle,
    String value,
    String currentValue,
    LanguageProvider languageProvider,
    BuildContext context,
  ) {
    final isSelected = currentValue == value;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        HapticUtils.selectionChanged();

        // Логируем изменение языка
        AnalyticsService.logLanguageChange(languageCode: value);

        final locale = Locale(value);
        languageProvider.setLanguage(locale);
        context.setLocale(locale);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: isSelected
              ? Colors.blue.withOpacity(isDark ? 0.1 : 0.05)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? Colors.blue
                : (isDark
                      ? Colors.grey.withOpacity(0.3)
                      : Colors.grey.withOpacity(0.4)),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
              color: isSelected
                  ? Colors.blue
                  : (isDark
                        ? Colors.grey.withOpacity(0.6)
                        : Colors.grey.withOpacity(0.7)),
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      color: isSelected
                          ? (isDark ? Colors.white : Colors.black87)
                          : (isDark
                                ? Colors.grey.withOpacity(0.8)
                                : Colors.grey.withOpacity(0.7)),
                      fontWeight: isSelected
                          ? FontWeight.w600
                          : FontWeight.normal,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark
                          ? Colors.grey.withOpacity(0.6)
                          : Colors.grey.withOpacity(0.5),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAboutSection() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'settings.about'.tr(),
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 20),
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
                Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: isDark
                          ? Colors.grey.withOpacity(0.6)
                          : Colors.grey.withOpacity(0.7),
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
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
                          Text(
                            'settings.version'.tr() + ' 1.0.0',
                            style: TextStyle(
                              fontSize: 14,
                              color: isDark
                                  ? Colors.grey.withOpacity(0.6)
                                  : Colors.grey.withOpacity(0.5),
                            ),
                          ),
                        ],
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

  Future<void> _refreshSubscriptionStatus() async {
    setState(() {
      _isCheckingSubscription = true;
      _cachedSubscriptionStatus = null;
    });

    try {
      await SubscriptionService.initialize();
      final isPremium = await SubscriptionService.refreshSubscriptionStatus();
      _cachedSubscriptionStatus = isPremium;
      setState(() {});
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка обновления статуса: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        _isCheckingSubscription = false;
      });
    }
  }

  Future<void> _openTelegramBot() async {
    try {
      // Получаем или создаем deviceId
      final prefs = await SharedPreferences.getInstance();
      String? deviceId = prefs.getString('deviceId');

      print('🔍 === ОТЛАДКА DEVICE ID ===');
      print('   Текущий deviceId из prefs: $deviceId');

      if (deviceId == null) {
        print('   deviceId = null, генерируем новый...');
        // Генерируем новый deviceId
        final deviceInfo = DeviceInfoPlugin();
        String deviceIdentifier;

        if (Platform.isAndroid) {
          final androidInfo = await deviceInfo.androidInfo;
          deviceIdentifier = androidInfo.id;
          print('   Android ID: $deviceIdentifier');
        } else if (Platform.isIOS) {
          final iosInfo = await deviceInfo.iosInfo;
          deviceIdentifier = iosInfo.identifierForVendor ?? 'unknown';
          print('   iOS identifierForVendor: $deviceIdentifier');
        } else {
          deviceIdentifier = 'unknown';
          print('   Unknown platform, deviceIdentifier: $deviceIdentifier');
        }

        deviceId =
            '${Platform.operatingSystem}_${deviceIdentifier}_${DateTime.now().millisecondsSinceEpoch}';
        print('   Сгенерированный deviceId: $deviceId');
        await prefs.setString('deviceId', deviceId);
        print('   deviceId сохранен в prefs');
      } else {
        print('   Используем существующий deviceId: $deviceId');
      }

      print('   Финальный deviceId для регистрации: $deviceId');
      print('===============================');

      // ВСЕГДА регистрируем устройство перед генерацией ссылки
      print('🔄 Регистрируем устройство перед генерацией ссылки Telegram...');
      await _registerDevice(deviceId);

      // Определяем платформу для ссылки
      final platform = Platform.isAndroid ? 'android' : 'ios';

      // Создаем ссылку на Telegram бота с appName, deviceId и платформой
      final botUrl =
          'https://t.me/etf_flows_bot?start=etf_flow_${deviceId}_$platform';

      // Открываем URL через url_launcher
      try {
        final uri = Uri.parse(botUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Telegram откроется автоматически. Отправьте команду /start боту для привязки аккаунта.',
                ),
                backgroundColor: Colors.green,
              ),
            );
          }
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Не удалось открыть Telegram. Убедитесь, что приложение установлено.',
                ),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Ошибка: $e'), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ошибка: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _registerDevice(String deviceId) async {
    try {
      print('📱 === ОТЛАДКА РЕГИСТРАЦИИ УСТРОЙСТВА ===');
      print('   Device ID для регистрации: $deviceId');
      print(
        '   Backend URL: ${AppConfig.backendBaseUrl}/notifications/register-device',
      );

      final response = await HttpClient().postUrl(
        Uri.parse('${AppConfig.backendBaseUrl}/notifications/register-device'),
      );
      response.headers.contentType = ContentType.json;

      final requestBody = jsonEncode({
        'token': 'test_telegram_token', // Тестовый токен для Telegram
        'appName': AppConfig.appName, // Используем константу из конфигурации
        'userId':
            'user_${DateTime.now().millisecondsSinceEpoch}', // Генерируем уникальный userId
        'deviceId': deviceId,
        'deviceType': Platform.operatingSystem,
        'appVersion': '1.0.0',
        'firstName': 'Тест',
        'lastName': 'Пользователь',
        'email': 'test@example.com',
      });

      print('   Тело запроса:');
      print('   ${requestBody}');
      print('=====================================');

      response.write(requestBody);
      await response.close();

      print('✅ Устройство зарегистрировано: $deviceId');
    } catch (e) {
      print('❌ Ошибка регистрации устройства: $e');
    }
  }

  Widget _buildNotificationSection() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Уведомления',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 20),
        Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1C1C1E) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDark
                  ? Colors.grey.withOpacity(0.2)
                  : Colors.grey.withOpacity(0.3),
            ),
          ),
          child: ListTile(
            leading: Icon(
              Icons.notifications,
              color: isDark ? Colors.white : Colors.black87,
            ),
            title: Text(
              'Настройки уведомлений',
              style: TextStyle(
                color: isDark ? Colors.white : Colors.black87,
                fontWeight: FontWeight.w500,
              ),
            ),
            subtitle: Text(
              'Управление пуш-уведомлениями ETF',
              style: TextStyle(
                color: isDark ? Colors.grey[400] : Colors.grey[600],
              ),
            ),
            trailing: Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
            onTap: () {
              HapticUtils.lightImpact();
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const NotificationSettingsScreen(),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
