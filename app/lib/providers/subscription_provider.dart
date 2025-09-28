import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../services/subscription_service.dart';
import '../services/subscription_status_service.dart';

class SubscriptionProvider extends ChangeNotifier {
  bool _isPremium = false;
  bool _isLoading = false;
  bool _isInitialized = false;
  bool _statusSetFromSync =
      false; // Флаг для отслеживания установки статуса из синхронизации
  String? _error;
  static const String _premiumStatusKey = 'premium_status';
  static const String _lastCheckKey = 'last_status_check';

  // Getters
  bool get isPremium => _isPremium;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  String? get error => _error;

  // Инициализация провайдера
  Future<void> initialize() async {
    if (_isInitialized) return;

    _setLoading(true);
    _clearError();

    try {
      // Сначала получаем правдивые данные из RevenueCat
      final revenueCatStatus = await SubscriptionService.isPremium();
      _isPremium = revenueCatStatus;

      // Уведомляем слушателей о статусе из RevenueCat
      notifyListeners();

      // Затем синхронизируем с бэкендом и получаем актуальный статус
      final syncedStatus =
          await SubscriptionStatusService.syncSubscriptionStatus();

      // Обновляем статус если он изменился после синхронизации
      if (syncedStatus != _isPremium) {
        _isPremium = syncedStatus;
        notifyListeners();

        if (kDebugMode) {
          print(
            '🔧 SubscriptionProvider: Статус обновлен после синхронизации: $_isPremium',
          );
        }
      }

      // Сохраняем актуальный статус в кэш
      await _saveCachedStatus();

      _isInitialized = true;

      if (kDebugMode) {
        print(
          '🔧 SubscriptionProvider: Инициализирован со статусом из RevenueCat: $_isPremium',
        );
      }
    } catch (e) {
      _setError('Ошибка инициализации подписки: $e');
      if (kDebugMode) {
        print('❌ SubscriptionProvider: Ошибка инициализации: $e');
      }
    } finally {
      _setLoading(false);
    }
  }

  // Загрузка кэшированного статуса
  Future<void> _loadCachedStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedStatus = prefs.getBool(_premiumStatusKey);
      final lastCheck = prefs.getString(_lastCheckKey);

      // Если статус уже установлен из синхронизации, не перезаписываем его кэшем
      if (_isPremium != false) {
        if (kDebugMode) {
          print(
            '🔧 SubscriptionProvider: Статус уже установлен из синхронизации ($_isPremium), пропускаем кэш',
          );
        }
        return;
      }

      if (cachedStatus != null && lastCheck != null) {
        final lastCheckTime = DateTime.parse(lastCheck);
        final now = DateTime.now();

        // Если кэш не старше 1 часа, используем его
        if (now.difference(lastCheckTime).inHours < 1) {
          _isPremium = cachedStatus;
          if (kDebugMode) {
            print(
              '🔧 SubscriptionProvider: Используем кэшированный статус: $_isPremium',
            );
          }
          return;
        }
      }

      // Если кэш устарел или отсутствует, и статус не установлен из RevenueCat
      if (_isPremium == false) {
        await _refreshSubscriptionStatus();
      }
    } catch (e) {
      if (kDebugMode) {
        print('⚠️ SubscriptionProvider: Ошибка загрузки кэша: $e');
      }
      // Продолжаем с загрузкой актуального статуса только если статус не установлен из RevenueCat
      if (_isPremium == false) {
        await _refreshSubscriptionStatus();
      }
    }
  }

  // Сохранение статуса в кэш
  Future<void> _saveCachedStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_premiumStatusKey, _isPremium);
      await prefs.setString(_lastCheckKey, DateTime.now().toIso8601String());
    } catch (e) {
      if (kDebugMode) {
        print('⚠️ SubscriptionProvider: Ошибка сохранения кэша: $e');
      }
    }
  }

  // Обновление статуса подписки
  Future<void> _refreshSubscriptionStatus() async {
    try {
      // Используем SubscriptionStatusService для получения актуального статуса
      // Он сначала проверяет бэкенд, потом RevenueCat как fallback
      final isPremium =
          await SubscriptionStatusService.getCurrentSubscriptionStatus();
      _isPremium = isPremium;

      // Сохраняем в кэш
      await _saveCachedStatus();

      if (kDebugMode) {
        print('🔧 SubscriptionProvider: Статус премиум обновлен: $isPremium');
      }
    } catch (e) {
      _setError('Ошибка обновления статуса подписки: $e');
      if (kDebugMode) {
        print('❌ SubscriptionProvider: Ошибка обновления статуса: $e');
      }
    }
  }

  // Принудительное обновление статуса (публичный метод)
  Future<void> refreshSubscriptionStatus() async {
    _setLoading(true);
    await _refreshSubscriptionStatus();
    _setLoading(false);
  }

  // Установка премиум статуса (после успешной покупки)
  void setPremiumStatus(bool isPremium) {
    print('🔧 SubscriptionProvider.setPremiumStatus() вызван');
    print('🔧 Текущий статус: $_isPremium');
    print('🔧 Новый статус: $isPremium');

    _isPremium = isPremium;

    // Сохраняем в кэш
    _saveCachedStatus();

    if (kDebugMode) {
      print('🔧 SubscriptionProvider: Установлен премиум статус: $isPremium');
    }

    print('🔧 Вызываем notifyListeners()');
    notifyListeners();
    print('🔧 notifyListeners() завершен');
  }

  // Быстрая проверка статуса (без загрузки)
  bool get isPremiumFast => _isPremium;

  // Установка состояния загрузки
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Установка ошибки
  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  // Очистка ошибки
  void _clearError() {
    _error = null;
    notifyListeners();
  }

  // Очистка ошибки (публичный метод)
  void clearError() {
    _clearError();
  }

  // Получение сохраненной информации о подписке
  Future<Map<String, dynamic>?> getSavedCustomerInfo() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final customerInfoString = prefs.getString('customer_info');

      if (customerInfoString != null) {
        // Парсим JSON строку
        final customerInfo =
            json.decode(customerInfoString) as Map<String, dynamic>;

        if (kDebugMode) {
          print(
            '🔧 SubscriptionProvider: Загружена сохраненная информация о подписке',
          );
        }

        return customerInfo;
      }

      return null;
    } catch (e) {
      if (kDebugMode) {
        print(
          '⚠️ SubscriptionProvider: Ошибка загрузки информации о подписке: $e',
        );
      }
      return null;
    }
  }

  // Получение активных entitlements
  Future<List<String>> getActiveEntitlements() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final entitlements = prefs.getStringList('active_entitlements') ?? [];

      if (kDebugMode) {
        print('🔧 SubscriptionProvider: Активные entitlements: $entitlements');
      }

      return entitlements;
    } catch (e) {
      if (kDebugMode) {
        print('⚠️ SubscriptionProvider: Ошибка загрузки entitlements: $e');
      }
      return [];
    }
  }

  // Проверка, есть ли активные подписки
  Future<bool> hasActiveSubscriptions() async {
    try {
      final entitlements = await getActiveEntitlements();
      return entitlements.isNotEmpty;
    } catch (e) {
      if (kDebugMode) {
        print('⚠️ SubscriptionProvider: Ошибка проверки активных подписок: $e');
      }
      return false;
    }
  }
}
