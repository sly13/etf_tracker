import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:device_info_plus/device_info_plus.dart';
import '../config/app_config.dart';
import '../firebase_options.dart';
import 'package:http/http.dart' as http;

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  static FirebaseMessaging? _firebaseMessaging;
  static FlutterLocalNotificationsPlugin? _localNotifications;
  static String? _fcmToken;
  static bool _isInitialized = false;

  // Callback для обработки нажатий на уведомления
  static Function(Map<String, dynamic>)? onNotificationTap;

  /// Инициализация сервиса уведомлений
  static Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // Инициализируем Firebase
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      _firebaseMessaging = FirebaseMessaging.instance;

      // Инициализируем локальные уведомления
      _localNotifications = FlutterLocalNotificationsPlugin();

      const androidSettings = AndroidInitializationSettings(
        '@mipmap/ic_launcher',
      );
      const iosSettings = DarwinInitializationSettings(
        requestAlertPermission: false, // Не запрашиваем разрешения сразу
        requestBadgePermission: false,
        requestSoundPermission: false,
      );

      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      );

      await _localNotifications!.initialize(
        initSettings,
        onDidReceiveNotificationResponse: _onNotificationTap,
      );

      // Создаем канал уведомлений для Android
      await _createNotificationChannel();

      // Настраиваем обработчики Firebase Messaging
      await _setupFirebaseHandlers();

      // Получаем FCM токен (без разрешений)
      await _getFCMToken();

      _isInitialized = true;
      debugPrint(
        '✅ NotificationService инициализирован (без запроса разрешений)',
      );
    } catch (e) {
      debugPrint('❌ Ошибка инициализации NotificationService: $e');
    }
  }

  /// Настройка обработчиков Firebase Messaging
  static Future<void> _setupFirebaseHandlers() async {
    if (_firebaseMessaging == null) return;

    // Обработка уведомлений когда приложение в foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('📱 ===== ПОЛУЧЕНО УВЕДОМЛЕНИЕ В FOREGROUND =====');
      debugPrint('📱 Заголовок: ${message.notification?.title}');
      debugPrint('📱 Текст: ${message.notification?.body}');
      debugPrint('📱 Данные: ${message.data}');
      debugPrint('📱 Message ID: ${message.messageId}');
      debugPrint('📱 От: ${message.from}');
      debugPrint('📱 ============================================');
      _showLocalNotification(message);
    });

    // Обработка нажатий на уведомления когда приложение в background
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('📱 Нажатие на уведомление (background): ${message.data}');
      _handleNotificationTap(message.data);
    });

    // Обработка уведомлений когда приложение полностью закрыто
    RemoteMessage? initialMessage = await _firebaseMessaging!
        .getInitialMessage();
    if (initialMessage != null) {
      debugPrint(
        '📱 Нажатие на уведомление (terminated): ${initialMessage.data}',
      );
      _handleNotificationTap(initialMessage.data);
    }
  }

  /// Получение FCM токена
  static Future<void> _getFCMToken() async {
    try {
      debugPrint('🔑 Пытаемся получить FCM токен...');
      _fcmToken = await _firebaseMessaging!.getToken();
      
      if (_fcmToken == null) {
        debugPrint('⚠️ FCM токен не получен (возможно, симулятор или нет разрешений)');
        // На симуляторе FCM может не работать, но продолжаем работу
        return;
      }
      
      debugPrint('🔑 FCM Token получен: ${_fcmToken!.substring(0, 20)}...');

      // Сохраняем токен в SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('fcm_token', _fcmToken ?? '');

      // Отправляем токен на сервер
      await _sendTokenToServer(_fcmToken);
    } catch (e) {
      debugPrint('❌ Ошибка получения FCM токена: $e');
      debugPrint('⚠️ Продолжаем работу без FCM токена (возможно, симулятор)');
    }
  }

  /// Отправка токена на сервер
  static Future<void> _sendTokenToServer(String? token) async {
    if (token == null) {
      debugPrint('⚠️ Пропускаем регистрацию: FCM токен отсутствует');
      return;
    }

    try {
      final url = AppConfig.getApiUrl('/notifications/register-device');
      debugPrint('📡 Регистрируем устройство на сервере: $url');

      // Собираем информацию об устройстве
      final deviceId = await getDeviceId();
      final deviceInfo = {
        'token': token,
        'appName': AppConfig.appName, // Добавляем название приложения
        'deviceId': deviceId, // Добавляем deviceId
        'deviceType': _getDeviceType(),
        'appVersion': await _getAppVersion(),
        'osVersion': await _getOSVersion(),
        'language': _getLanguage(),
        'timezone': _getTimezone(),
        'deviceName': await _getDeviceName(),
      };

      debugPrint('📦 Данные регистрации: deviceId=$deviceId, appName=${AppConfig.appName}');

      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(deviceInfo),
      );

      debugPrint('📡 Ответ сервера: ${response.statusCode}');
      debugPrint('📦 Тело ответа: ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        debugPrint('✅ Устройство зарегистрировано на сервере');
      } else {
        debugPrint('❌ Ошибка регистрации устройства: ${response.statusCode}');
        debugPrint('❌ Тело ошибки: ${response.body}');
      }
    } catch (e, stackTrace) {
      debugPrint('❌ Ошибка регистрации устройства на сервере: $e');
      debugPrint('❌ Stack trace: $stackTrace');
    }
  }

  /// Получение типа устройства
  static String _getDeviceType() {
    if (kIsWeb) return 'web';
    // В реальном приложении можно использовать device_info_plus
    return 'mobile';
  }

  /// Получение deviceId устройства
  static Future<String> getDeviceId() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String? deviceId = prefs.getString('deviceId');

      if (deviceId == null) {
        // Генерируем новый deviceId
        final deviceInfo = DeviceInfoPlugin();
        String deviceIdentifier;

        if (Platform.isAndroid) {
          final androidInfo = await deviceInfo.androidInfo;
          deviceIdentifier = androidInfo.id;
        } else if (Platform.isIOS) {
          final iosInfo = await deviceInfo.iosInfo;
          deviceIdentifier = iosInfo.identifierForVendor ?? 'unknown';
        } else {
          deviceIdentifier = 'unknown';
        }

        deviceId =
            '${Platform.operatingSystem}_${deviceIdentifier}_${DateTime.now().millisecondsSinceEpoch}';
        await prefs.setString('deviceId', deviceId);
      }

      return deviceId;
    } catch (e) {
      // В случае ошибки возвращаем fallback deviceId
      return '${Platform.operatingSystem}_fallback_${DateTime.now().millisecondsSinceEpoch}';
    }
  }

  /// Получение версии приложения
  static Future<String> _getAppVersion() async {
    // В реальном приложении можно использовать package_info_plus
    return '1.0.0';
  }

  /// Получение версии ОС
  static Future<String> _getOSVersion() async {
    // В реальном приложении можно использовать device_info_plus
    return 'unknown';
  }

  /// Получение языка устройства
  static String _getLanguage() {
    return 'ru'; // или получить из локализации
  }

  /// Получение часового пояса
  static String _getTimezone() {
    return DateTime.now().timeZoneName;
  }

  /// Получение имени устройства
  static Future<String> _getDeviceName() async {
    // В реальном приложении можно использовать device_info_plus
    return 'ETF Flow Device';
  }

  /// Создание канала уведомлений для Android
  static Future<void> _createNotificationChannel() async {
    if (_localNotifications == null) return;

    try {
      const androidChannel = AndroidNotificationChannel(
        'etf_notifications',
        'ETF Flow Notifications',
        description: 'Уведомления о потоках ETF',
        importance: Importance.max,
        playSound: true,
        enableVibration: true,
      );

      await _localNotifications!
          .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin
          >()
          ?.createNotificationChannel(androidChannel);

      debugPrint('✅ Канал уведомлений создан');
    } catch (e) {
      debugPrint('❌ Ошибка создания канала: $e');
    }
  }

  /// Запрос разрешений на уведомления (публичный метод)
  static Future<bool> requestPermissions() async {
    try {
      debugPrint('🔔 Запрашиваем разрешения на уведомления...');

      bool iosGranted = false;
      bool androidGranted = false;

      // Для iOS - запрашиваем через локальные уведомления
      if (Platform.isIOS && _localNotifications != null) {
        final iosImplementation = _localNotifications!
            .resolvePlatformSpecificImplementation<
                IOSFlutterLocalNotificationsPlugin>();
        if (iosImplementation != null) {
          final result = await iosImplementation.requestPermissions(
            alert: true,
            badge: true,
            sound: true,
          );
          iosGranted = result ?? false;
          debugPrint('📱 iOS локальные уведомления: ${iosGranted ? "разрешены" : "отклонены"}');
        }

        // Также запрашиваем через Firebase для push-уведомлений
        if (_firebaseMessaging != null) {
          final iosSettings = await _firebaseMessaging!.requestPermission(
            alert: true,
            badge: true,
            sound: true,
            provisional: false,
          );
          debugPrint('📱 iOS Firebase статус: ${iosSettings.authorizationStatus}');
        }
      }

      // Для Android
      if (Platform.isAndroid && _localNotifications != null) {
        androidGranted = await _localNotifications!
                .resolvePlatformSpecificImplementation<
                    AndroidFlutterLocalNotificationsPlugin>()
                ?.requestNotificationsPermission() ?? false;
        debugPrint('📱 Android разрешение: $androidGranted');
      }

      final isGranted = Platform.isIOS ? iosGranted : androidGranted;

      debugPrint(
        '✅ Разрешения на уведомления: ${isGranted ? "предоставлены" : "отклонены"}',
      );

      return isGranted;
    } catch (e) {
      debugPrint('❌ Ошибка запроса разрешений: $e');
      return false;
    }
  }

  /// Проверка статуса разрешений на уведомления
  static Future<bool> checkPermissions() async {
    try {
      // Для iOS используем Firebase для проверки статуса
      if (Platform.isIOS && _firebaseMessaging != null) {
        final settings = await _firebaseMessaging!.getNotificationSettings();
        final isAuthorized = settings.authorizationStatus == AuthorizationStatus.authorized;
        debugPrint('📱 iOS статус разрешений: ${settings.authorizationStatus}');
        return isAuthorized;
      }

      // Для Android
      if (Platform.isAndroid && _localNotifications != null) {
        final androidImplementation = _localNotifications!
            .resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin>();
        if (androidImplementation != null) {
          final result = await androidImplementation.areNotificationsEnabled();
          debugPrint('📱 Android статус разрешений: $result');
          return result ?? false;
        }
      }

      return false;
    } catch (e) {
      debugPrint('❌ Ошибка проверки разрешений: $e');
      return false;
    }
  }

  /// Показ локального уведомления
  static Future<void> _showLocalNotification(RemoteMessage message) async {
    debugPrint('🔔 ===== ПОКАЗ ЛОКАЛЬНОГО УВЕДОМЛЕНИЯ =====');
    
    if (_localNotifications == null) {
      debugPrint('❌ _localNotifications is null - уведомление не может быть показано');
      return;
    }

    debugPrint('🔔 Заголовок: ${message.notification?.title ?? "НЕТ"}');
    debugPrint('🔔 Текст: ${message.notification?.body ?? "НЕТ"}');
    debugPrint('🔔 Данные: ${message.data}');

    const androidDetails = AndroidNotificationDetails(
      'etf_notifications',
      'ETF Flow Notifications',
      channelDescription: 'Уведомления о потоках ETF',
      importance: Importance.max,
      priority: Priority.max,
      icon: '@mipmap/ic_launcher',
      showWhen: true,
      enableVibration: true,
      playSound: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      sound: 'default',
      badgeNumber: 1,
      interruptionLevel: InterruptionLevel.active,
    );

    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    try {
      final notificationId = message.hashCode;
      final title = message.notification?.title ?? 'ETF Flow Update';
      final body = message.notification?.body ?? 'Новые данные о потоках ETF';
      
      debugPrint('🔔 Показываем уведомление:');
      debugPrint('   ID: $notificationId');
      debugPrint('   Заголовок: $title');
      debugPrint('   Текст: $body');
      
      await _localNotifications!.show(
        notificationId,
        title,
        body,
        notificationDetails,
        payload: json.encode(message.data),
      );

      debugPrint('✅ Локальное уведомление показано успешно');
      debugPrint('🔔 ============================================');
    } catch (e, stackTrace) {
      debugPrint('❌ Ошибка показа локального уведомления: $e');
      debugPrint('❌ Stack trace: $stackTrace');
      debugPrint('🔔 ============================================');
    }
  }

  /// Обработка нажатия на уведомление
  static void _onNotificationTap(NotificationResponse response) {
    if (response.payload != null) {
      try {
        final data = json.decode(response.payload!);
        _handleNotificationTap(data);
      } catch (e) {
        debugPrint('❌ Ошибка парсинга данных уведомления: $e');
      }
    }
  }

  /// Обработка нажатия на уведомление
  static void _handleNotificationTap(Map<String, dynamic> data) {
    debugPrint('📱 Обработка нажатия на уведомление: $data');

    // Вызываем callback если он установлен
    if (onNotificationTap != null) {
      onNotificationTap!(data);
    }
  }

  /// Получить текущий FCM токен
  static String? get fcmToken => _fcmToken;

  /// Проверить, инициализирован ли сервис
  static bool get isInitialized => _isInitialized;

  /// Обновить FCM токен (вызывается при обновлении токена)
  static Future<void> refreshToken() async {
    await _getFCMToken();
  }

  /// Подписаться на топик
  static Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging!.subscribeToTopic(topic);
      debugPrint('✅ Подписались на топик: $topic');
    } catch (e) {
      debugPrint('❌ Ошибка подписки на топик $topic: $e');
    }
  }

  /// Отписаться от топика
  static Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging!.unsubscribeFromTopic(topic);
      debugPrint('✅ Отписались от топика: $topic');
    } catch (e) {
      debugPrint('❌ Ошибка отписки от топика $topic: $e');
    }
  }

  /// Показать тестовое локальное уведомление (для симулятора)
  static Future<void> showTestNotification({
    String title = 'Тестовое уведомление',
    String body = 'Это тестовое уведомление для проверки работы на симуляторе',
  }) async {
    debugPrint('🔔 Начинаем показ тестового уведомления...');
    
    if (_localNotifications == null) {
      debugPrint('❌ _localNotifications is null, инициализируем сервис...');
      await initialize();
      if (_localNotifications == null) {
        debugPrint('❌ Не удалось инициализировать сервис уведомлений');
        return;
      }
    }

    // Проверяем и запрашиваем разрешения для iOS
    if (Platform.isIOS) {
      debugPrint('📱 Проверяем разрешения для iOS...');
      final hasPermissions = await checkPermissions();
      debugPrint('📱 Текущий статус разрешений: $hasPermissions');
      
      if (!hasPermissions) {
        debugPrint('🔔 Разрешения не предоставлены, запрашиваем...');
        final granted = await requestPermissions();
        debugPrint('📱 Результат запроса разрешений: $granted');
        
        if (!granted) {
          debugPrint('❌ Разрешения на уведомления не предоставлены');
          // Пробуем показать уведомление в любом случае (на симуляторе может работать)
          debugPrint('⚠️ Пробуем показать уведомление без разрешений...');
        }
      } else {
        debugPrint('✅ Разрешения уже предоставлены');
      }
    }

    debugPrint('🔔 Показываем тестовое уведомление: $title');
    debugPrint('🔔 Тело уведомления: $body');

    const androidDetails = AndroidNotificationDetails(
      'etf_notifications',
      'ETF Flow Notifications',
      channelDescription: 'Уведомления о потоках ETF',
      importance: Importance.max,
      priority: Priority.max,
      icon: '@mipmap/ic_launcher',
      showWhen: true,
      enableVibration: true,
      playSound: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      sound: 'default',
      badgeNumber: 1,
      interruptionLevel: InterruptionLevel.active,
    );

    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    try {
      final notificationId = DateTime.now().millisecondsSinceEpoch % 100000;
      debugPrint('🔔 ID уведомления: $notificationId');
      debugPrint('🔔 Детали уведомления: $notificationDetails');
      
      await _localNotifications!.show(
        notificationId,
        title,
        body,
        notificationDetails,
        payload: json.encode({'type': 'test', 'timestamp': DateTime.now().toIso8601String()}),
      );

      debugPrint('✅ Тестовое уведомление показано успешно');
      debugPrint('📱 Платформа: ${Platform.operatingSystem}');
      debugPrint('📱 Версия iOS: ${Platform.operatingSystemVersion}');
    } catch (e, stackTrace) {
      debugPrint('❌ Ошибка при показе тестового уведомления: $e');
      debugPrint('❌ Stack trace: $stackTrace');
      rethrow;
    }
  }
}
