import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/notification_provider.dart';
import 'subscription_selection_screen.dart';

class NotificationSettingsScreen extends StatelessWidget {
  const NotificationSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('notifications.settings_title'.tr()),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Consumer<NotificationProvider>(
        builder: (context, notificationProvider, child) {
          final status = notificationProvider.getNotificationStatus();

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Премиум функция
                _buildPremiumFeatureCard(context),

                const SizedBox(height: 16),

                // Основной переключатель уведомлений
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'notifications.etf_notifications'.tr(),
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            Text(
                              'notifications.etf_description'.tr(),
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                        Switch(
                          value: status['enabled'],
                          onChanged: status['initialized']
                              ? (value) => notificationProvider
                                    .toggleNotifications(value)
                              : null,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Настройка уведомлений о сумме потоков
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SwitchListTile(
                          secondary: const Icon(Icons.account_balance_wallet),
                          title: Text(
                            'notifications.flow_amount_notifications'.tr(),
                          ),
                          subtitle: Text('notifications.flow_amount_desc'.tr()),
                          value: status['enableFlowAmount'] ?? false,
                          onChanged: (value) async {
                            await notificationProvider.updateDeviceSettings({
                              'enableFlowAmount': value,
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                // Настройки суммы потока (показывается только если включены уведомления о сумме потоков)
                if (status['enableFlowAmount'] == true) ...[
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'notifications.flow_amount_threshold'.tr(),
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'notifications.flow_amount_threshold_desc'.tr(),
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          const SizedBox(height: 16),
                          ListTile(
                            title: Text('notifications.flow_amount_value'.tr()),
                            subtitle: Text(
                              '${status['flowAmountThreshold'] ?? 10.0}M\$',
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.edit),
                              onPressed: () => _showFlowAmountDialog(
                                context,
                                notificationProvider,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 16),

                // Кнопки действий
                if (status['initialized']) ...[
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            await notificationProvider.refreshToken();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('FCM токен обновлен'),
                              ),
                            );
                          },
                          icon: const Icon(Icons.refresh),
                          label: const Text('Обновить токен'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            final success = await notificationProvider
                                .sendTestNotification();
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  success
                                      ? 'Тестовое уведомление отправлено'
                                      : 'Ошибка отправки тестового уведомления',
                                ),
                                backgroundColor: success
                                    ? Colors.green
                                    : Colors.red,
                              ),
                            );
                          },
                          icon: const Icon(Icons.notifications),
                          label: const Text('Тест'),
                        ),
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 20),

                // Информация о разрешениях
                Card(
                  color: Theme.of(context).brightness == Brightness.dark
                      ? const Color(0xFF1C1C1E)
                      : Colors.blue.shade50,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.info,
                              color:
                                  Theme.of(context).brightness ==
                                      Brightness.dark
                                  ? Colors.blue.shade300
                                  : Colors.blue.shade700,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'notifications.info_title'.tr(),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color:
                                    Theme.of(context).brightness ==
                                        Brightness.dark
                                    ? Colors.blue.shade300
                                    : Colors.blue.shade700,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'notifications.info_description'.tr(),
                          style: TextStyle(
                            color:
                                Theme.of(context).brightness == Brightness.dark
                                ? Colors.blue.shade300
                                : Colors.blue.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  /// Диалог настройки суммы потока
  static void _showFlowAmountDialog(
    BuildContext context,
    NotificationProvider provider,
  ) {
    final currentValue = provider.flowAmountThreshold;
    final controller = TextEditingController(text: currentValue.toString());

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('notifications.flow_amount_threshold'.tr()),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            labelText: 'notifications.flow_amount_threshold_desc'.tr(),
            suffixText: 'M\$',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('notifications.cancel'.tr()),
          ),
          TextButton(
            onPressed: () async {
              final value = double.tryParse(controller.text);
              if (value != null && value >= 0) {
                await provider.updateDeviceSettings({
                  'flowAmountThreshold': value,
                });
                Navigator.pop(context);
              }
            },
            child: Text('notifications.save'.tr()),
          ),
        ],
      ),
    );
  }

  Widget _buildPremiumFeatureCard(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      elevation: 4,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: isDark ? const Color(0xFF1C1C1E) : Colors.white,
          border: Border.all(
            color: isDark
                ? Colors.blue.withOpacity(0.3)
                : Colors.blue.withOpacity(0.2),
            width: 1,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.star,
                    color: isDark ? Colors.blue.shade300 : Colors.blue.shade700,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'notifications.premium_feature'.tr(),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark
                          ? Colors.blue.shade300
                          : Colors.blue.shade700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                'notifications.premium_description'.tr(),
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.grey[300] : Colors.grey[600],
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'notifications.premium_benefits'.tr(),
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              _buildBenefitItem('notifications.benefit_analytics'.tr(), isDark),
              _buildBenefitItem('notifications.benefit_telegram'.tr(), isDark),
              _buildBenefitItem('notifications.benefit_mobile'.tr(), isDark),
              _buildBenefitItem('notifications.benefit_reports'.tr(), isDark),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            const SubscriptionSelectionScreen(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text('notifications.unlock_notifications'.tr()),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBenefitItem(String text, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 14,
          color: isDark ? Colors.grey[300] : Colors.grey[600],
        ),
      ),
    );
  }
}
