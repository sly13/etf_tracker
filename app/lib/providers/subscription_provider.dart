import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/subscription_service.dart';

class SubscriptionProvider extends ChangeNotifier {
  bool _isPremium = false;
  bool _isLoading = false;
  bool _isInitialized = false;
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
      // Сначала загружаем кэшированный статус для мгновенного отображения
      await _loadCachedStatus();

      // Затем проверяем актуальный статус в фоне
      _checkActualStatusInBackground();

      _isInitialized = true;

      if (kDebugMode) {
        print(
          '🔧 SubscriptionProvider: Инициализирован с кэшированным статусом: $_isPremium',
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

      // Если кэш устарел или отсутствует, загружаем актуальный статус
      await _refreshSubscriptionStatus();
    } catch (e) {
      if (kDebugMode) {
        print('⚠️ SubscriptionProvider: Ошибка загрузки кэша: $e');
      }
      // Продолжаем с загрузкой актуального статуса
      await _refreshSubscriptionStatus();
    }
  }

  // Проверка актуального статуса в фоне
  Future<void> _checkActualStatusInBackground() async {
    try {
      final actualIsPremium = await SubscriptionService.isPremium();

      // Обновляем статус только если он изменился
      if (actualIsPremium != _isPremium) {
        _isPremium = actualIsPremium;
        await _saveCachedStatus();
        notifyListeners();

        if (kDebugMode) {
          print('🔧 SubscriptionProvider: Статус обновлен в фоне: $_isPremium');
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('⚠️ SubscriptionProvider: Ошибка фоновой проверки: $e');
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
      final isPremium = await SubscriptionService.isPremium();
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
}
