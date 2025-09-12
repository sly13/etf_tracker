import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../services/notification_service.dart';
import '../services/device_settings_service.dart';

class NotificationProvider extends ChangeNotifier {
  bool _notificationsEnabled = true;
  bool _isInitialized = false;
  String? _fcmToken;

  // Детальные настройки уведомлений
  bool _enableETFUpdates = true;
  bool _enableSignificantFlow = true;
  bool _enableTestNotifications = false;
  double _minFlowThreshold = 0.1;
  double _significantChangePercent = 20.0;
  bool _enableFlowAmount = false;
  double _flowAmountThreshold = 10.0;
  String? _quietHoursStart;
  String? _quietHoursEnd;
  int _notificationCount = 0;
  DateTime? _lastNotificationSent;

  // Getters
  bool get notificationsEnabled => _notificationsEnabled;
  bool get isInitialized => _isInitialized;
  String? get fcmToken => _fcmToken;
  bool get enableETFUpdates => _enableETFUpdates;
  bool get enableSignificantFlow => _enableSignificantFlow;
  bool get enableTestNotifications => _enableTestNotifications;
  double get minFlowThreshold => _minFlowThreshold;
  double get significantChangePercent => _significantChangePercent;
  bool get enableFlowAmount => _enableFlowAmount;
  double get flowAmountThreshold => _flowAmountThreshold;
  String? get quietHoursStart => _quietHoursStart;
  String? get quietHoursEnd => _quietHoursEnd;
  int get notificationCount => _notificationCount;
  DateTime? get lastNotificationSent => _lastNotificationSent;

  /// Инициализация провайдера уведомлений
  Future<void> initialize() async {
    try {
      debugPrint('🔔 NotificationProvider: Инициализация...');

      // Инициализируем сервис уведомлений
      await NotificationService.initialize();

      // Устанавливаем callback для обработки нажатий на уведомления
      NotificationService.onNotificationTap = _handleNotificationTap;

      _isInitialized = NotificationService.isInitialized;
      _fcmToken = NotificationService.fcmToken;

      // Подписываемся на топик для всех пользователей
      if (_isInitialized) {
        await NotificationService.subscribeToTopic('etf_updates');

        // Загружаем настройки с сервера
        await _loadDeviceSettings();
      }

      debugPrint('✅ NotificationProvider: Инициализация завершена');
      notifyListeners();
    } catch (e) {
      debugPrint('❌ NotificationProvider: Ошибка инициализации: $e');
    }
  }

  /// Переключение уведомлений
  Future<void> toggleNotifications(bool enabled) async {
    debugPrint('🔍 NotificationProvider: Переключаем уведомления на: $enabled');

    _notificationsEnabled = enabled;

    if (enabled && _isInitialized) {
      // Подписываемся на топик
      await NotificationService.subscribeToTopic('etf_updates');
    } else if (!enabled && _isInitialized) {
      // Отписываемся от топика
      await NotificationService.unsubscribeFromTopic('etf_updates');
    }

    // Сохраняем настройку на сервере
    if (_fcmToken != null) {
      debugPrint(
        '🔍 NotificationProvider: Сохраняем enableETFUpdates на сервере: $enabled',
      );
      await updateDeviceSettings({'enableETFUpdates': enabled});
    }

    notifyListeners();
  }

  /// Обработка нажатия на уведомление
  void _handleNotificationTap(Map<String, dynamic> data) {
    debugPrint(
      '📱 NotificationProvider: Обработка нажатия на уведомление: $data',
    );

    // Здесь можно добавить логику для навигации в приложении
    // Например, открыть определенный экран или обновить данные

    // Уведомляем слушателей о нажатии на уведомление
    notifyListeners();
  }

  /// Обновить FCM токен
  Future<void> refreshToken() async {
    if (_isInitialized) {
      await NotificationService.refreshToken();
      _fcmToken = NotificationService.fcmToken;
      notifyListeners();
    }
  }

  /// Загрузка настроек устройства с сервера
  Future<void> _loadDeviceSettings() async {
    if (_fcmToken == null) {
      debugPrint(
        '❌ NotificationProvider: FCM токен отсутствует, пропускаем загрузку настроек',
      );
      return;
    }

    debugPrint(
      '🔍 NotificationProvider: Загружаем настройки для токена: ${_fcmToken!.substring(0, 20)}...',
    );

    try {
      final settings = await DeviceSettingsService.getDeviceSettings(
        _fcmToken!,
      );
      if (settings != null) {
        debugPrint(
          '✅ NotificationProvider: Настройки получены с сервера: $settings',
        );

        _enableETFUpdates = settings['enableETFUpdates'] ?? true;
        _enableSignificantFlow = settings['enableSignificantFlow'] ?? true;
        _enableTestNotifications = settings['enableTestNotifications'] ?? false;
        _minFlowThreshold = (settings['minFlowThreshold'] ?? 0.1).toDouble();
        _significantChangePercent =
            (settings['significantChangePercent'] ?? 20.0).toDouble();
        _enableFlowAmount = settings['enableFlowAmount'] ?? false;
        _flowAmountThreshold = (settings['flowAmountThreshold'] ?? 10.0)
            .toDouble();
        _quietHoursStart = settings['quietHoursStart'];
        _quietHoursEnd = settings['quietHoursEnd'];
        _notificationCount = settings['notificationCount'] ?? 0;
        _lastNotificationSent = settings['lastNotificationSent'] != null
            ? DateTime.parse(settings['lastNotificationSent'])
            : null;

        debugPrint(
          '✅ NotificationProvider: Настройки устройства загружены с сервера',
        );
        debugPrint(
          '📊 NotificationProvider: enableETFUpdates: $_enableETFUpdates',
        );
        debugPrint(
          '📊 NotificationProvider: enableFlowAmount: $_enableFlowAmount',
        );
        debugPrint(
          '📊 NotificationProvider: flowAmountThreshold: $_flowAmountThreshold',
        );
        notifyListeners();
      } else {
        debugPrint(
          '⚠️ NotificationProvider: Настройки не найдены на сервере, используем значения по умолчанию',
        );
      }
    } catch (e) {
      debugPrint(
        '❌ NotificationProvider: Ошибка загрузки настроек устройства: $e',
      );
    }
  }

  /// Обновление настроек устройства на сервере
  Future<bool> updateDeviceSettings(Map<String, dynamic> settings) async {
    if (_fcmToken == null) {
      debugPrint(
        '❌ NotificationProvider: FCM токен отсутствует, не можем обновить настройки',
      );
      return false;
    }

    debugPrint('🔍 NotificationProvider: Обновляем настройки: $settings');
    debugPrint(
      '🔍 NotificationProvider: Токен: ${_fcmToken!.substring(0, 20)}...',
    );

    try {
      final success = await DeviceSettingsService.updateDeviceSettings(
        _fcmToken!,
        settings,
      );
      if (success) {
        debugPrint(
          '✅ NotificationProvider: Настройки успешно обновлены на сервере',
        );

        // Обновляем локальные настройки
        if (settings.containsKey('enableETFUpdates')) {
          _enableETFUpdates = settings['enableETFUpdates'];
          debugPrint(
            '📊 NotificationProvider: enableETFUpdates обновлен: $_enableETFUpdates',
          );
        }
        if (settings.containsKey('enableSignificantFlow')) {
          _enableSignificantFlow = settings['enableSignificantFlow'];
          debugPrint(
            '📊 NotificationProvider: enableSignificantFlow обновлен: $_enableSignificantFlow',
          );
        }
        if (settings.containsKey('enableTestNotifications')) {
          _enableTestNotifications = settings['enableTestNotifications'];
          debugPrint(
            '📊 NotificationProvider: enableTestNotifications обновлен: $_enableTestNotifications',
          );
        }
        if (settings.containsKey('minFlowThreshold')) {
          _minFlowThreshold = settings['minFlowThreshold'].toDouble();
          debugPrint(
            '📊 NotificationProvider: minFlowThreshold обновлен: $_minFlowThreshold',
          );
        }
        if (settings.containsKey('significantChangePercent')) {
          _significantChangePercent = settings['significantChangePercent']
              .toDouble();
          debugPrint(
            '📊 NotificationProvider: significantChangePercent обновлен: $_significantChangePercent',
          );
        }
        if (settings.containsKey('enableFlowAmount')) {
          _enableFlowAmount = settings['enableFlowAmount'];
          debugPrint(
            '📊 NotificationProvider: enableFlowAmount обновлен: $_enableFlowAmount',
          );
        }
        if (settings.containsKey('flowAmountThreshold')) {
          _flowAmountThreshold = settings['flowAmountThreshold'].toDouble();
          debugPrint(
            '📊 NotificationProvider: flowAmountThreshold обновлен: $_flowAmountThreshold',
          );
        }
        if (settings.containsKey('quietHoursStart')) {
          _quietHoursStart = settings['quietHoursStart'];
          debugPrint(
            '📊 NotificationProvider: quietHoursStart обновлен: $_quietHoursStart',
          );
        }
        if (settings.containsKey('quietHoursEnd')) {
          _quietHoursEnd = settings['quietHoursEnd'];
          debugPrint(
            '📊 NotificationProvider: quietHoursEnd обновлен: $_quietHoursEnd',
          );
        }

        notifyListeners();
        debugPrint(
          '✅ NotificationProvider: Локальные настройки обновлены и уведомлены слушатели',
        );
      } else {
        debugPrint(
          '❌ NotificationProvider: Не удалось обновить настройки на сервере',
        );
      }
      return success;
    } catch (e) {
      debugPrint(
        '❌ NotificationProvider: Ошибка обновления настроек устройства: $e',
      );
      return false;
    }
  }

  /// Отправка тестового уведомления
  Future<bool> sendTestNotification() async {
    try {
      final success = await DeviceSettingsService.sendTestNotification();
      if (success) {
        debugPrint('✅ Тестовое уведомление отправлено');
      }
      return success;
    } catch (e) {
      debugPrint('❌ Ошибка отправки тестового уведомления: $e');
      return false;
    }
  }

  /// Получение статистики уведомлений
  Future<Map<String, dynamic>?> getNotificationStats() async {
    try {
      return await DeviceSettingsService.getNotificationStats();
    } catch (e) {
      debugPrint('❌ Ошибка получения статистики: $e');
      return null;
    }
  }

  /// Получить информацию о состоянии уведомлений
  Map<String, dynamic> getNotificationStatus() {
    return {
      'enabled': _notificationsEnabled,
      'initialized': _isInitialized,
      'fcmToken': _fcmToken,
      'hasToken': _fcmToken != null && _fcmToken!.isNotEmpty,
      'enableETFUpdates': _enableETFUpdates,
      'enableSignificantFlow': _enableSignificantFlow,
      'enableTestNotifications': _enableTestNotifications,
      'minFlowThreshold': _minFlowThreshold,
      'significantChangePercent': _significantChangePercent,
      'enableFlowAmount': _enableFlowAmount,
      'flowAmountThreshold': _flowAmountThreshold,
      'quietHoursStart': _quietHoursStart,
      'quietHoursEnd': _quietHoursEnd,
      'notificationCount': _notificationCount,
      'lastNotificationSent': _lastNotificationSent?.toIso8601String(),
    };
  }
}
