import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/notification_provider.dart';
import '../providers/subscription_provider.dart';
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
      body: Consumer2<NotificationProvider, SubscriptionProvider>(
        builder: (context, notificationProvider, subscriptionProvider, child) {
          final status = notificationProvider.getNotificationStatus();
          print(
            '🔍 NotificationSettingsScreen: enableFlowAmount = ${status['enableFlowAmount']}',
          );
          print(
            '🔍 NotificationSettingsScreen: isPremium = ${subscriptionProvider.isPremium}',
          );
          print(
            '🔍 NotificationSettingsScreen: status[enabled] = ${status['enabled']}',
          );
          print(
            '🔍 NotificationSettingsScreen: UI перестроен в ${DateTime.now().millisecondsSinceEpoch}',
          );

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Основной переключатель уведомлений
                _buildNotificationCard(
                  context: context,
                  title: 'notifications.etf_notifications'.tr(),
                  description: 'notifications.etf_description'.tr(),
                  value: subscriptionProvider.isPremium
                      ? status['enabled']
                      : false,
                  onChanged: status['initialized']
                      ? (value) {
                          print(
                            '🔍 NotificationSettingsScreen: onChanged вызван с value: $value',
                          );
                          _handleETFNotificationsToggle(
                            context,
                            notificationProvider,
                            subscriptionProvider,
                            value,
                          );
                        }
                      : null,
                ),

                const SizedBox(height: 16),

                // Настройка уведомлений о сумме потоков
                _buildFlowAmountNotificationCard(
                  context: context,
                  title: 'notifications.flow_amount_notifications'.tr(),
                  description: 'notifications.flow_amount_desc'.tr(),
                  value: status['enableFlowAmount'] ?? false,
                  subscriptionProvider: subscriptionProvider,
                  onChanged: (value) async {
                    print(
                      '🔍 NotificationSettingsScreen: Переключаем enableFlowAmount на: $value',
                    );
                    final success = await notificationProvider
                        .updateDeviceSettings({'enableFlowAmount': value});
                    print(
                      '🔍 NotificationSettingsScreen: Результат обновления: $success',
                    );
                    print(
                      '🔍 NotificationSettingsScreen: Новое значение enableFlowAmount: ${notificationProvider.getNotificationStatus()['enableFlowAmount']}',
                    );

                    // UI обновится автоматически через Consumer2
                    print(
                      '🔍 NotificationSettingsScreen: UI обновится автоматически через Consumer2',
                    );
                  },
                ),

                // Настройки суммы потока (показывается только если включены уведомления о сумме потоков)
                if (status['enableFlowAmount'] == true) ...[
                  const SizedBox(height: 16),
                  _buildFlowAmountCard(context, status, notificationProvider),
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
              print(
                '🔍 NotificationSettingsScreen: Сохраняем flowAmountThreshold: $value',
              );
              if (value != null && value >= 0) {
                final success = await provider.updateDeviceSettings({
                  'flowAmountThreshold': value,
                });
                print(
                  '🔍 NotificationSettingsScreen: Результат обновления порога: $success',
                );
                Navigator.pop(context);
              } else {
                print(
                  '❌ NotificationSettingsScreen: Некорректное значение: $value',
                );
              }
            },
            child: Text('notifications.save'.tr()),
          ),
        ],
      ),
    );
  }

  Widget _buildFlowAmountCard(
    BuildContext context,
    Map<String, dynamic> status,
    NotificationProvider notificationProvider,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final threshold = status['flowAmountThreshold'] ?? 10.0;

    return Card(
      elevation: 6,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: isDark ? const Color(0xFF1C1C1E) : Colors.white,
          border: Border.all(
            color: isDark ? Colors.grey[800]! : Colors.grey[300]!,
            width: 1,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Заголовок без иконки
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'notifications.flow_amount_threshold'.tr(),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'notifications.flow_amount_threshold_desc'.tr(),
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.grey[300] : Colors.grey[600],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Блок с текущим значением
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark
                      ? Colors.grey[900]!.withOpacity(0.5)
                      : Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? Colors.grey[700]! : Colors.grey[300]!,
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'notifications.flow_amount_value'.tr(),
                            style: TextStyle(
                              fontSize: 14,
                              color: isDark
                                  ? Colors.grey[300]
                                  : Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Text(
                                '${threshold.toStringAsFixed(threshold == threshold.toInt() ? 0 : 1)}',
                                style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.white : Colors.black87,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                'M\$',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? Colors.blue.shade300
                                      : Colors.blue.shade700,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.grey[800]!.withOpacity(0.5)
                            : Colors.grey[100],
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: IconButton(
                        icon: Icon(
                          Icons.edit_rounded,
                          color: isDark ? Colors.grey[300] : Colors.grey[600],
                          size: 20,
                        ),
                        onPressed: () => _showFlowAmountDialog(
                          context,
                          notificationProvider,
                        ),
                        style: IconButton.styleFrom(
                          padding: const EdgeInsets.all(12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Информационный блок
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark
                      ? Colors.grey[800]!.withOpacity(0.3)
                      : Colors.grey[50],
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isDark
                        ? Colors.grey[700]!.withOpacity(0.5)
                        : Colors.grey[200]!,
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: isDark ? Colors.grey[400] : Colors.grey[500],
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'notifications.flow_amount_info'.tr(),
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Унифицированный метод для создания блоков уведомлений
  Widget _buildNotificationCard({
    required BuildContext context,
    required String title,
    required String description,
    required bool value,
    required ValueChanged<bool>? onChanged,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            Switch(value: value, onChanged: onChanged),
          ],
        ),
      ),
    );
  }

  /// Специальный метод для создания карточки Flow Amount Notifications с проверкой подписки
  Widget _buildFlowAmountNotificationCard({
    required BuildContext context,
    required String title,
    required String description,
    required bool value,
    required SubscriptionProvider subscriptionProvider,
    required ValueChanged<bool>? onChanged,
  }) {
    final isPremium = subscriptionProvider.isPremium;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(
                              color: isPremium ? null : Colors.grey[600],
                            ),
                      ),
                      if (!isPremium) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.blue,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'PRO',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: isPremium ? null : Colors.grey[500],
                    ),
                  ),
                ],
              ),
            ),
            Switch(
              value: value,
              onChanged: isPremium
                  ? onChanged
                  : (value) {
                      if (value) {
                        _showPremiumRequiredDialog(context);
                      }
                    },
            ),
          ],
        ),
      ),
    );
  }

  /// Обработка переключения основного переключателя ETF уведомлений
  Future<void> _handleETFNotificationsToggle(
    BuildContext context,
    NotificationProvider notificationProvider,
    SubscriptionProvider subscriptionProvider,
    bool value,
  ) async {
    print(
      '🔍 NotificationSettingsScreen: Переключаем ETF уведомления на: $value',
    );
    print(
      '🔍 NotificationSettingsScreen: Статус премиум: ${subscriptionProvider.isPremium}',
    );

    // Если пользователь не премиум и пытается включить
    if (!subscriptionProvider.isPremium && value) {
      print(
        '🔍 NotificationSettingsScreen: Показываем диалог премиум подписки',
      );
      _showPremiumRequiredDialog(context);
      // Принудительно обновляем SubscriptionProvider
      await subscriptionProvider.refreshSubscriptionStatus();
      return;
    }

    // Если пользователь премиум или выключает уведомления
    print('🔍 NotificationSettingsScreen: Сохраняем настройки на сервере');

    // Показываем индикатор загрузки при включении уведомлений
    if (value) {
      _showLoadingDialog(context);
    }

    await notificationProvider.toggleNotifications(value);

    // Закрываем диалог загрузки
    if (value && Navigator.canPop(context)) {
      Navigator.pop(context);
    }

    // UI обновится автоматически через Consumer2
    print(
      '🔍 NotificationSettingsScreen: UI обновится автоматически через Consumer2',
    );
  }

  /// Показать диалог загрузки при запросе разрешений
  void _showLoadingDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Row(
          children: [
            const CircularProgressIndicator(),
            const SizedBox(width: 16),
            Text('notifications.requesting_permissions'.tr()),
          ],
        ),
      ),
    );
  }

  /// Показать диалог о необходимости премиум подписки
  void _showPremiumRequiredDialog(BuildContext context) {
    print('🔍 NotificationSettingsScreen: Показываем диалог премиум подписки');
    showDialog(
      context: context,
      builder: (context) {
        print('🔍 NotificationSettingsScreen: Диалог построен');
        return AlertDialog(
          title: Text('notifications.premium_required'.tr()),
          content: Text('notifications.premium_required_desc'.tr()),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('notifications.cancel'.tr()),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const SubscriptionSelectionScreen(),
                  ),
                );
              },
              child: Text('notifications.upgrade'.tr()),
            ),
          ],
        );
      },
    );
  }
}
