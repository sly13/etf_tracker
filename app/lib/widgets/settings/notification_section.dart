import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../utils/haptic_feedback.dart';
import '../../screens/notification_settings_screen.dart';
import '../../services/notification_service.dart';
import '../../services/device_settings_service.dart';
import '../../config/app_config.dart';

class NotificationSection extends StatefulWidget {
  const NotificationSection({super.key});

  @override
  State<NotificationSection> createState() => _NotificationSectionState();
}

class _NotificationSectionState extends State<NotificationSection> {
  bool _isTestingNotifications = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        Container(
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
        ),
        // Кнопка "Проверить уведомления" (только в debug режиме)
        if (kDebugMode)
          Container(
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
                Icons.notifications_active,
                color: isDark ? Colors.blue : Colors.blue,
              ),
              title: Text(
                'notifications.test_check'.tr(),
                style: TextStyle(
                  fontSize: 16,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              subtitle: Text(
                'notifications.test_send_etf'.tr(),
                style: TextStyle(
                  fontSize: 14,
                  color: isDark
                      ? Colors.grey.withOpacity(0.6)
                      : Colors.grey.withOpacity(0.5),
                ),
              ),
              trailing: _isTestingNotifications
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                      ),
                    )
                  : Icon(
                      Icons.send,
                      color: isDark ? Colors.blue : Colors.blue,
                      size: 20,
                    ),
              onTap: _isTestingNotifications
                  ? null
                  : () async {
                      HapticUtils.lightImpact();
                      await _testETFNotification();
                    },
            ),
          ),
      ],
    );
  }

  Future<void> _testETFNotification() async {
    if (!mounted) return;

    setState(() {
      _isTestingNotifications = true;
    });

    try {
      // Получаем deviceId
      final deviceId = await NotificationService.getDeviceId();

      // Вызываем сервис для тестирования уведомлений
      final result = await DeviceSettingsService.testETFNotification(
        appName: AppConfig.appName,
        deviceId: deviceId,
      );

      if (mounted) {
        if (result != null && result['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(result['message'] ?? 'notifications.test_sent'.tr()),
                  ),
                ],
              ),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 3),
              behavior: SnackBarBehavior.floating,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.error, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      result?['error'] ?? 'notifications.test_error'.tr(),
                    ),
                  ),
                ],
              ),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 3),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${'common.error'.tr()}: $e'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isTestingNotifications = false;
        });
      }
    }
  }
}

