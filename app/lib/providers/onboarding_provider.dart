import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OnboardingProvider extends ChangeNotifier {
  static const String _onboardingCompletedKey = 'onboarding_completed';
  static const String _onboardingShownKey = 'onboarding_shown';
  static const String _paywallSkippedKey = 'paywall_skipped';

  bool _isOnboardingCompleted = false;
  bool _isOnboardingShown = false;
  bool _isPaywallSkipped = false;
  bool _isInitialized = false;

  // Getters
  bool get isOnboardingCompleted => _isOnboardingCompleted;
  bool get isOnboardingShown => _isOnboardingShown;
  bool get isPaywallSkipped => _isPaywallSkipped;
  bool get isInitialized => _isInitialized;
  bool get shouldShowOnboarding =>
      !_isOnboardingCompleted && !_isOnboardingShown;
  bool get shouldShowPaywall => _isOnboardingCompleted && !_isPaywallSkipped;

  /// Инициализация провайдера
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      final prefs = await SharedPreferences.getInstance();

      _isOnboardingCompleted = prefs.getBool(_onboardingCompletedKey) ?? false;
      _isOnboardingShown = prefs.getBool(_onboardingShownKey) ?? false;
      _isPaywallSkipped = prefs.getBool(_paywallSkippedKey) ?? false;

      _isInitialized = true;

      if (kDebugMode) {
        print('🔧 OnboardingProvider: Инициализирован');
        print('   - Онбординг завершен: $_isOnboardingCompleted');
        print('   - Онбординг показан: $_isOnboardingShown');
        print('   - Paywall пропущен: $_isPaywallSkipped');
        print('   - Нужно показать онбординг: $shouldShowOnboarding');
        print('   - Нужно показать paywall: $shouldShowPaywall');
      }

      notifyListeners();
    } catch (e) {
      if (kDebugMode) {
        print('❌ OnboardingProvider: Ошибка инициализации: $e');
      }
    }
  }

  /// Отметить, что онбординг был показан
  Future<void> markOnboardingAsShown() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_onboardingShownKey, true);

      _isOnboardingShown = true;

      if (kDebugMode) {
        print('✅ OnboardingProvider: Онбординг отмечен как показанный');
      }

      notifyListeners();
    } catch (e) {
      if (kDebugMode) {
        print('❌ OnboardingProvider: Ошибка сохранения статуса показа: $e');
      }
    }
  }

  /// Отметить, что онбординг завершен
  Future<void> markOnboardingAsCompleted() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_onboardingCompletedKey, true);
      await prefs.setBool(_onboardingShownKey, true);

      _isOnboardingCompleted = true;
      _isOnboardingShown = true;

      if (kDebugMode) {
        print('✅ OnboardingProvider: Онбординг отмечен как завершенный');
      }

      notifyListeners();
    } catch (e) {
      if (kDebugMode) {
        print('❌ OnboardingProvider: Ошибка сохранения статуса завершения: $e');
      }
    }
  }

  /// Отметить, что paywall был пропущен
  Future<void> markPaywallAsSkipped() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_paywallSkippedKey, true);

      _isPaywallSkipped = true;

      if (kDebugMode) {
        print('✅ OnboardingProvider: Paywall отмечен как пропущенный');
      }

      notifyListeners();
    } catch (e) {
      if (kDebugMode) {
        print('❌ OnboardingProvider: Ошибка сохранения статуса пропуска: $e');
      }
    }
  }

  /// Сбросить статус онбординга (для тестирования)
  Future<void> resetOnboarding() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_onboardingCompletedKey);
      await prefs.remove(_onboardingShownKey);
      await prefs.remove(_paywallSkippedKey);

      _isOnboardingCompleted = false;
      _isOnboardingShown = false;
      _isPaywallSkipped = false;

      if (kDebugMode) {
        print('🔄 OnboardingProvider: Статус онбординга сброшен');
      }

      notifyListeners();
    } catch (e) {
      if (kDebugMode) {
        print('❌ OnboardingProvider: Ошибка сброса статуса: $e');
      }
    }
  }
}
