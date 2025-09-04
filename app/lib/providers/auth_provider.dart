import 'package:flutter/foundation.dart';
import '../services/subscription_service.dart';

class AuthProvider extends ChangeNotifier {
  bool _isLoading = false;
  String? _error;

  // Геттеры
  bool get isAuthenticated => false; // Всегда false, так как логин убран
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Инициализация при запуске приложения
  Future<void> initialize() async {
    _setLoading(true);
    try {
      print('🔧 Инициализация AuthProvider...');

      // Инициализируем RevenueCat
      try {
        await SubscriptionService.initialize();
        print('✅ RevenueCat инициализирован');
      } catch (e) {
        print('⚠️ Ошибка инициализации RevenueCat: $e');
        // Продолжаем работу без RevenueCat
      }

      print('✅ AuthProvider инициализирован');
    } catch (e) {
      print('❌ Критическая ошибка инициализации AuthProvider: $e');
      _setError('Ошибка инициализации: $e');
    } finally {
      _setLoading(false);
    }
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
}
