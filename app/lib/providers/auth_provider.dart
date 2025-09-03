import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:purchases_flutter/purchases_flutter.dart' show StoreProduct;
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/subscription_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  String? _error;
  final AuthService _authService = AuthService();

  // Геттеры
  User? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Инициализация при запуске приложения
  Future<void> initialize() async {
    _setLoading(true);
    try {
      // Инициализируем RevenueCat
      await SubscriptionService.initialize();

      // Проверяем сохраненный токен
      final token = await _getStoredToken();
      if (token != null) {
        // Проверяем валидность токена на сервере
        await _validateToken(token);
      }
    } catch (e) {
      _setError('Ошибка инициализации: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Вход через Apple
  Future<void> signInWithApple() async {
    _setLoading(true);
    _clearError();

    try {
      final user = await _authService.signInWithApple();
      _setCurrentUser(user);
      await _storeToken(user.id); // Сохраняем токен

      // Устанавливаем пользователя в RevenueCat
      await SubscriptionService.setUser(user.id);

      // Синхронизируем подписку с RevenueCat
      await _syncSubscriptionWithRevenueCat(user);

      notifyListeners();
    } catch (e) {
      _setError('Ошибка входа через Apple: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  // Выход из аккаунта
  Future<void> signOut() async {
    _setLoading(true);
    try {
      await _authService.signOut();
      _setCurrentUser(null);
      await _clearStoredToken();
      notifyListeners();
    } catch (e) {
      _setError('Ошибка выхода: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Обновление профиля пользователя
  Future<void> updateProfile({
    String? name,
    UserPreferences? preferences,
  }) async {
    if (_currentUser == null) return;

    _setLoading(true);
    try {
      final updatedUser = await _authService.updateProfile(
        userId: _currentUser!.id,
        name: name,
        preferences: preferences,
      );
      _setCurrentUser(updatedUser);
      notifyListeners();
    } catch (e) {
      _setError('Ошибка обновления профиля: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Обновление подписки
  Future<void> updateSubscription(Subscription subscription) async {
    if (_currentUser == null) return;

    _setLoading(true);
    try {
      final updatedUser = await _authService.updateSubscription(
        userId: _currentUser!.id,
        subscription: subscription,
      );
      _setCurrentUser(updatedUser);
      notifyListeners();
    } catch (e) {
      _setError('Ошибка обновления подписки: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Проверка валидности токена
  Future<void> _validateToken(String token) async {
    try {
      final user = await _authService.validateToken(token);
      _setCurrentUser(user);
    } catch (e) {
      // Токен недействителен, очищаем его
      await _clearStoredToken();
      _setCurrentUser(null);
    }
  }

  // Сохранение токена в локальное хранилище
  Future<void> _storeToken(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);
    } catch (e) {
      debugPrint('Ошибка сохранения токена: $e');
    }
  }

  // Получение токена из локального хранилища
  Future<String?> _getStoredToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString('auth_token');
    } catch (e) {
      debugPrint('Ошибка получения токена: $e');
      return null;
    }
  }

  // Очистка токена из локального хранилища
  Future<void> _clearStoredToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
    } catch (e) {
      debugPrint('Ошибка очистки токена: $e');
    }
  }

  // Установка текущего пользователя
  void _setCurrentUser(User? user) {
    _currentUser = user;
  }

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

  // Синхронизация подписки с RevenueCat
  Future<void> _syncSubscriptionWithRevenueCat(User user) async {
    try {
      final customerInfo = await SubscriptionService.getCustomerInfo();
      final updatedUser = SubscriptionService.updateUserWithSubscription(
        user,
        customerInfo,
      );
      _setCurrentUser(updatedUser);
    } catch (e) {
      print('Ошибка синхронизации подписки: $e');
    }
  }

  // Покупка подписки через RevenueCat
  Future<void> purchaseSubscription(StoreProduct product) async {
    if (_currentUser == null) return;

    _setLoading(true);
    try {
      final customerInfo = await SubscriptionService.purchasePackage(product);
      final updatedUser = SubscriptionService.updateUserWithSubscription(
        _currentUser!,
        customerInfo,
      );
      _setCurrentUser(updatedUser);

      // Обновляем подписку на сервере
      await _authService.updateSubscription(
        userId: _currentUser!.id,
        subscription: updatedUser.subscription!,
      );

      print('✅ Подписка успешно обновлена в AuthProvider');
      notifyListeners();
    } catch (e) {
      _setError('Ошибка покупки подписки: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  // Восстановление покупок
  Future<void> restorePurchases() async {
    if (_currentUser == null) return;

    _setLoading(true);
    try {
      final customerInfo = await SubscriptionService.restorePurchases();
      final updatedUser = SubscriptionService.updateUserWithSubscription(
        _currentUser!,
        customerInfo,
      );
      _setCurrentUser(updatedUser);

      // Обновляем подписку на сервере
      await _authService.updateSubscription(
        userId: _currentUser!.id,
        subscription: updatedUser.subscription!,
      );

      notifyListeners();
    } catch (e) {
      _setError('Ошибка восстановления покупок: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Принудительное обновление статуса подписки
  Future<void> refreshSubscriptionStatus() async {
    if (_currentUser == null) return;

    try {
      print(
        '🔧 Обновляем статус подписки в AuthProvider для пользователя: ${_currentUser!.id}',
      );

      final customerInfo = await SubscriptionService.getCustomerInfo();
      final updatedUser = SubscriptionService.updateUserWithSubscription(
        _currentUser!,
        customerInfo,
      );
      _setCurrentUser(updatedUser);

      // Обновляем подписку на сервере
      if (updatedUser.subscription != null) {
        await _authService.updateSubscription(
          userId: _currentUser!.id,
          subscription: updatedUser.subscription!,
        );
        print('✅ Подписка обновлена на сервере');
      } else {
        print('⚠️ Подписка не найдена в RevenueCat');
      }

      print('✅ Статус подписки обновлен в AuthProvider');
      notifyListeners();
    } catch (e) {
      print('❌ Ошибка обновления статуса подписки: $e');
      rethrow;
    }
  }
}
