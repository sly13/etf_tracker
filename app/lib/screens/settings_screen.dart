import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
import '../services/notification_service.dart';
import '../services/analytics_service.dart';
import '../utils/haptic_feedback.dart';
import '../widgets/pro_button.dart';
import '../config/app_config.dart';
import 'notification_settings_screen.dart';
import 'theme_selection_screen.dart';
import 'language_selection_screen.dart';

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
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Внешний вид
          _buildAppearanceSection(),

          // Язык
          _buildLanguageSection(),

          // Уведомления
          _buildNotificationSection(),

          // Подписка
          _buildSubscriptionSection(),

          // Device ID
          _buildDeviceIdSection(),

          // О приложении
          _buildAboutSection(),
        ],
      ),
    );
  }

  Widget _buildAppearanceSection() {
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
                                'profile.notifications'.tr(),
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                  color: isDark ? Colors.white : Colors.black87,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'telegram.get_updates'.tr(),
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
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          HapticUtils.lightImpact();
                          _openTelegramBot();
                        },
                        icon: const Icon(Icons.telegram, color: Colors.white),
                        label: Text(
                          'telegram.open_bot'.tr(),
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
        final currentLanguage = languageProvider.currentLocale.languageCode;

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
              Icons.language,
              color: isDark ? Colors.white : Colors.black87,
            ),
            title: Text(
              'settings.language'.tr(),
              style: TextStyle(
                fontSize: 16,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            subtitle: Text(
              currentLanguage == 'en' ? 'English' : 'Русский',
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
                  builder: (context) => const LanguageSelectionScreen(),
                ),
              );
            },
          ),
        );
      },
    );
  }

  /// Функция для очистки deviceId от префикса платформы
  String _cleanDeviceId(String deviceId) {
    if (deviceId.startsWith('ios_')) {
      return deviceId.substring(4); // убираем 'ios_'
    } else if (deviceId.startsWith('android_')) {
      return deviceId.substring(8); // убираем 'android_'
    }
    return deviceId;
  }

  Widget _buildDeviceIdSection() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'telegram.device_id'.tr(),
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
                Row(
                  children: [
                    Icon(
                      Icons.fingerprint,
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
                            'telegram.device_id_title'.tr(),
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'telegram.device_id_subtitle'.tr(),
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
                    IconButton(
                      onPressed: () async {
                        try {
                          final deviceId =
                              await NotificationService.getDeviceId();
                          final cleanDeviceId = _cleanDeviceId(deviceId);
                          await Clipboard.setData(
                            ClipboardData(text: cleanDeviceId),
                          );
                          HapticUtils.lightImpact(); // Добавляем вибрацию

                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Row(
                                  children: [
                                    Icon(
                                      Icons.check,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 8),
                                    Text('telegram.device_id_copied'.tr()),
                                  ],
                                ),
                                backgroundColor: Colors.green,
                                duration: Duration(seconds: 2),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          }
                        } catch (e) {
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  'telegram.copy_error'.tr() + ': $e',
                                ),
                                backgroundColor: Colors.red,
                              ),
                            );
                          }
                        }
                      },
                      icon: Icon(Icons.copy, color: Colors.blue, size: 20),
                      tooltip: 'telegram.device_id_subtitle'.tr(),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                FutureBuilder<String>(
                  future: NotificationService.getDeviceId(),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return Container(
                        height: 20,
                        child: Center(
                          child: SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.blue,
                              ),
                            ),
                          ),
                        ),
                      );
                    }

                    final deviceId = snapshot.data ?? 'Ошибка загрузки';
                    final cleanDeviceId = _cleanDeviceId(deviceId);
                    return Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.grey.withOpacity(0.1)
                            : Colors.grey.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isDark
                              ? Colors.grey.withOpacity(0.2)
                              : Colors.grey.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              cleanDeviceId,
                              style: TextStyle(
                                fontSize: 12,
                                fontFamily: 'monospace',
                                color: isDark ? Colors.white70 : Colors.black87,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () async {
                              try {
                                await Clipboard.setData(
                                  ClipboardData(text: cleanDeviceId),
                                );
                                HapticUtils.lightImpact(); // Добавляем вибрацию

                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Row(
                                        children: [
                                          Icon(
                                            Icons.check,
                                            color: Colors.white,
                                            size: 16,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            'telegram.device_id_copied_short'
                                                .tr(),
                                          ),
                                        ],
                                      ),
                                      backgroundColor: Colors.green,
                                      duration: Duration(seconds: 2),
                                      behavior: SnackBarBehavior.floating,
                                    ),
                                  );
                                }
                              } catch (e) {
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        'telegram.copy_error'.tr() + ': $e',
                                      ),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                }
                              }
                            },
                            child: Container(
                              padding: EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: Colors.blue.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Icon(
                                Icons.copy,
                                size: 16,
                                color: Colors.blue,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
                const SizedBox(height: 16),
                Text(
                  'telegram.link_instructions'.tr(),
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark
                        ? Colors.grey.withOpacity(0.6)
                        : Colors.grey.withOpacity(0.5),
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
            content: Text('errors.subscription_status_error'.tr() + ': $e'),
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
      // Убираем префикс платформы из deviceId и добавляем его в конце
      final cleanDeviceId = deviceId.startsWith('ios_')
          ? deviceId.substring(4) // убираем 'ios_'
          : deviceId.startsWith('android_')
          ? deviceId.substring(8) // убираем 'android_'
          : deviceId;

      final botUrl =
          'https://t.me/${AppConfig.telegramBotName}?start=etf_flow_${cleanDeviceId}_$platform';

      // Логируем информацию о ссылке для отладки
      print('🔗 === ГЕНЕРАЦИЯ ССЫЛКИ НА TELEGRAM БОТА ===');
      print('📱 DeviceId: $deviceId');
      print('🖥️ Platform: $platform');
      print('🤖 Bot Name: ${AppConfig.telegramBotName}');
      print('🔗 Bot URL: $botUrl');
      print('📝 Clean DeviceId: $cleanDeviceId');
      print('📝 Start Parameter: etf_flow_${cleanDeviceId}_$platform');
      print('==========================================');

      // Открываем URL через url_launcher
      try {
        final uri = Uri.parse(botUrl);
        print('🔗 Открываем ссылку: $uri');
        print('🔗 URI scheme: ${uri.scheme}');
        print('🔗 URI host: ${uri.host}');
        print('🔗 URI path: ${uri.path}');
        print('🔗 URI query: ${uri.query}');
        print('🔗 URI fragment: ${uri.fragment}');

        if (await canLaunchUrl(uri)) {
          print('🔗 Ссылка может быть открыта, запускаем...');
          final result = await launchUrl(
            uri,
            mode: LaunchMode.externalApplication,
          );
          print('🔗 Результат открытия ссылки: $result');

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('telegram.telegram_opens'.tr()),
                backgroundColor: Colors.green,
              ),
            );
          }
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('telegram.telegram_error'.tr()),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('common.error'.tr() + ': $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('common.error'.tr() + ': $e'),
            backgroundColor: Colors.red,
          ),
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
          Icons.notifications,
          color: isDark ? Colors.white : Colors.black87,
        ),
        title: Text(
          'profile.notifications'.tr(),
          style: TextStyle(
            fontSize: 16,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        subtitle: Text(
          'telegram.notification_management'.tr(),
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
              builder: (context) => const NotificationSettingsScreen(),
            ),
          );
        },
      ),
    );
  }
}
