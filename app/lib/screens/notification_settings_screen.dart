import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/notification_provider.dart';

class NotificationSettingsScreen extends StatelessWidget {
  const NotificationSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Настройки уведомлений'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Consumer<NotificationProvider>(
        builder: (context, notificationProvider, child) {
          final status = notificationProvider.getNotificationStatus();

          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Статус уведомлений
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Статус уведомлений',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              status['initialized']
                                  ? Icons.check_circle
                                  : Icons.error,
                              color: status['initialized']
                                  ? Colors.green
                                  : Colors.red,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              status['initialized']
                                  ? 'Уведомления активны'
                                  : 'Уведомления не настроены',
                              style: TextStyle(
                                color: status['initialized']
                                    ? Colors.green
                                    : Colors.red,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        if (status['hasToken']) ...[
                          const SizedBox(height: 8),
                          Text(
                            'FCM токен: ${status['fcmToken'].toString().substring(0, 20)}...',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Основной переключатель уведомлений
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'ETF уведомления',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            Text(
                              'Получать уведомления о новых данных ETF',
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

                // Детальные настройки уведомлений
                if (status['initialized']) ...[
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Детальные настройки',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 16),

                          // ETF обновления
                          SwitchListTile(
                            title: const Text('Обновления потоков ETF'),
                            subtitle: const Text(
                              'Ежечасные уведомления о новых данных',
                            ),
                            value: status['enableETFUpdates'] ?? true,
                            onChanged: (value) async {
                              await notificationProvider.updateDeviceSettings({
                                'enableETFUpdates': value,
                              });
                            },
                          ),

                          // Значительные изменения
                          SwitchListTile(
                            title: const Text('Значительные изменения'),
                            subtitle: const Text(
                              'Уведомления при больших изменениях потоков',
                            ),
                            value: status['enableSignificantFlow'] ?? true,
                            onChanged: (value) async {
                              await notificationProvider.updateDeviceSettings({
                                'enableSignificantFlow': value,
                              });
                            },
                          ),

                          // Тестовые уведомления
                          SwitchListTile(
                            title: const Text('Тестовые уведомления'),
                            subtitle: const Text(
                              'Разрешить отправку тестовых уведомлений',
                            ),
                            value: status['enableTestNotifications'] ?? false,
                            onChanged: (value) async {
                              await notificationProvider.updateDeviceSettings({
                                'enableTestNotifications': value,
                              });
                            },
                          ),

                          const Divider(),

                          // Минимальный порог
                          ListTile(
                            title: const Text('Минимальный порог'),
                            subtitle: Text(
                              '${status['minFlowThreshold'] ?? 0.1}M\$',
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.edit),
                              onPressed: () => _showThresholdDialog(
                                context,
                                notificationProvider,
                              ),
                            ),
                          ),

                          // Процент значительного изменения
                          ListTile(
                            title: const Text(
                              'Процент значительного изменения',
                            ),
                            subtitle: Text(
                              '${status['significantChangePercent'] ?? 20.0}%',
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.edit),
                              onPressed: () => _showChangePercentDialog(
                                context,
                                notificationProvider,
                              ),
                            ),
                          ),

                          // Тихие часы
                          ListTile(
                            title: const Text('Тихие часы'),
                            subtitle: Text(
                              _formatQuietHours(
                                status['quietHoursStart'],
                                status['quietHoursEnd'],
                              ),
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.edit),
                              onPressed: () => _showQuietHoursDialog(
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

                // Информация о типах уведомлений
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Типы уведомлений',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        const ListTile(
                          leading: Icon(Icons.trending_up),
                          title: Text('Обновления потоков ETF'),
                          subtitle: Text(
                            'Ежечасные обновления данных о притоках и оттоках',
                          ),
                        ),
                        const ListTile(
                          leading: Icon(Icons.notifications_active),
                          title: Text('Значительные изменения'),
                          subtitle: Text(
                            'Уведомления при изменении потоков более чем на 20%',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

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

                const Spacer(),

                // Информация о разрешениях
                Card(
                  color: Colors.blue.shade50,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.info, color: Colors.blue.shade700),
                            const SizedBox(width: 8),
                            Text(
                              'Информация',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.blue.shade700,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Уведомления отправляются автоматически при получении новых данных ETF с сервера. Для корректной работы убедитесь, что разрешения на уведомления включены в настройках устройства.',
                          style: TextStyle(color: Colors.blue.shade700),
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

  /// Форматирование тихих часов
  static String _formatQuietHours(String? start, String? end) {
    if (start == null || end == null) {
      return 'Не настроено';
    }
    return '$start - $end';
  }

  /// Диалог настройки минимального порога
  static void _showThresholdDialog(
    BuildContext context,
    NotificationProvider provider,
  ) {
    final currentValue = provider.minFlowThreshold;
    final controller = TextEditingController(text: currentValue.toString());

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Минимальный порог'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Порог в миллионах долларов',
            suffixText: 'M\$',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () async {
              final value = double.tryParse(controller.text);
              if (value != null && value >= 0) {
                await provider.updateDeviceSettings({
                  'minFlowThreshold': value,
                });
                Navigator.pop(context);
              }
            },
            child: const Text('Сохранить'),
          ),
        ],
      ),
    );
  }

  /// Диалог настройки процента значительного изменения
  static void _showChangePercentDialog(
    BuildContext context,
    NotificationProvider provider,
  ) {
    final currentValue = provider.significantChangePercent;
    final controller = TextEditingController(text: currentValue.toString());

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Процент значительного изменения'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Процент изменения',
            suffixText: '%',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () async {
              final value = double.tryParse(controller.text);
              if (value != null && value >= 0 && value <= 100) {
                await provider.updateDeviceSettings({
                  'significantChangePercent': value,
                });
                Navigator.pop(context);
              }
            },
            child: const Text('Сохранить'),
          ),
        ],
      ),
    );
  }

  /// Диалог настройки тихих часов
  static void _showQuietHoursDialog(
    BuildContext context,
    NotificationProvider provider,
  ) {
    final currentStart = provider.quietHoursStart ?? '22:00';
    final currentEnd = provider.quietHoursEnd ?? '08:00';

    String selectedStart = currentStart;
    String selectedEnd = currentEnd;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Тихие часы'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Начало'),
              subtitle: Text(selectedStart),
              trailing: const Icon(Icons.access_time),
              onTap: () async {
                final time = await showTimePicker(
                  context: context,
                  initialTime: TimeOfDay(
                    hour: int.parse(selectedStart.split(':')[0]),
                    minute: int.parse(selectedStart.split(':')[1]),
                  ),
                );
                if (time != null) {
                  selectedStart =
                      '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
                }
              },
            ),
            ListTile(
              title: const Text('Конец'),
              subtitle: Text(selectedEnd),
              trailing: const Icon(Icons.access_time),
              onTap: () async {
                final time = await showTimePicker(
                  context: context,
                  initialTime: TimeOfDay(
                    hour: int.parse(selectedEnd.split(':')[0]),
                    minute: int.parse(selectedEnd.split(':')[1]),
                  ),
                );
                if (time != null) {
                  selectedEnd =
                      '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
                }
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () async {
              await provider.updateDeviceSettings({
                'quietHoursStart': selectedStart,
                'quietHoursEnd': selectedEnd,
              });
              Navigator.pop(context);
            },
            child: const Text('Сохранить'),
          ),
        ],
      ),
    );
  }
}
