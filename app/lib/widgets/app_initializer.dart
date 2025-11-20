import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import '../providers/onboarding_provider.dart';
import '../providers/subscription_provider.dart';
import '../screens/main_navigation_screen.dart';
import '../screens/onboarding_screen.dart';
import '../screens/subscription_selection_screen.dart';
import '../utils/revenuecat_checker.dart';
import '../services/subscription_service.dart';
import 'dart:async';

class AppInitializer extends StatefulWidget {
  const AppInitializer({super.key});

  @override
  State<AppInitializer> createState() => _AppInitializerState();
}

class _AppInitializerState extends State<AppInitializer> {
  bool _isInitializing = true;

  @override
  void initState() {
    super.initState();
    // Запускаем инициализацию асинхронно, не блокируя UI
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeProviders();
    });
  }

  Future<void> _initializeProviders() async {
    try {
      // Инициализируем провайдеры
      final onboardingProvider = Provider.of<OnboardingProvider>(
        context,
        listen: false,
      );
      final subscriptionProvider = Provider.of<SubscriptionProvider>(
        context,
        listen: false,
      );

      // Параллельная инициализация для ускорения загрузки
      await Future.wait([
        // Сначала быстро инициализируем онбординг (он обычно быстрый)
        onboardingProvider.initialize(),
        // Затем инициализируем подписку с таймаутом
        subscriptionProvider.initialize().timeout(
          const Duration(seconds: 3),
          onTimeout: () {
            print(
              '⚠️ Таймаут инициализации SubscriptionProvider, используем кэш',
            );
            // Если таймаут, используем кэшированные данные
            return;
          },
        ).catchError((e) {
          print('⚠️ Ошибка инициализации SubscriptionProvider: $e');
          // Продолжаем работу даже если подписка не инициализировалась
        }),
        // Предзагружаем изображения для summary
        _precacheImages(context),
      ]);

      // Минимальная задержка для плавного перехода от splash screen
      await Future.delayed(const Duration(milliseconds: 300));

      if (mounted) {
        setState(() {
          _isInitializing = false;
        });
        
        // Запускаем диагностику RevenueCat после запуска приложения
        // Ждем инициализации RevenueCat перед запуском диагностики
        _runRevenueCatDiagnostics();
      }
    } catch (e) {
      print('❌ Ошибка инициализации провайдеров: $e');
      if (mounted) {
        setState(() {
          _isInitializing = false;
        });
      }
    }
  }

  /// Предзагрузка изображений для summary
  Future<void> _precacheImages(BuildContext context) async {
    try {
      final imageAssets = [
        'assets/bitcoin.png',
        'assets/ethereum.png',
        'assets/solana.png',
      ];
      
      // Предзагружаем все изображения параллельно
      await Future.wait(
        imageAssets.map((asset) => 
          precacheImage(AssetImage(asset), context)
        ),
      );
      
      debugPrint('✅ Изображения для summary предзагружены');
    } catch (e) {
      debugPrint('⚠️ Ошибка предзагрузки изображений: $e');
      // Не критично, продолжаем работу
    }
  }

  /// Запуск диагностики RevenueCat с ожиданием инициализации
  Future<void> _runRevenueCatDiagnostics() async {
    if (!kDebugMode) return;

    // Ждем инициализации RevenueCat (максимум 5 секунд)
    int attempts = 0;
    const maxAttempts = 50; // 50 попыток по 100мс = 5 секунд
    
    while (!SubscriptionService.isInitialized && attempts < maxAttempts) {
      await Future.delayed(const Duration(milliseconds: 100));
      attempts++;
    }

    if (SubscriptionService.isInitialized) {
      // Небольшая задержка для завершения всех операций инициализации
      await Future.delayed(const Duration(milliseconds: 500));
      RevenueCatChecker.printDiagnostics();
    } else {
      print('⚠️ RevenueCat не инициализирован, пропускаем диагностику');
    }
  }

  @override
  Widget build(BuildContext context) {
    // Показываем загрузку пока провайдеры не инициализированы
    if (_isInitializing) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Показываем логотип приложения с закругленными краями
              ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Image.asset(
                  'assets/etf_tracker_logo.png',
                  width: 120,
                  height: 120,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  color: Theme.of(context).primaryColor,
                  strokeWidth: 2,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Consumer2<OnboardingProvider, SubscriptionProvider>(
      builder: (context, onboardingProvider, subscriptionProvider, child) {
        // Если онбординг не завершен, показываем онбординг
        if (onboardingProvider.shouldShowOnboarding) {
          return const OnboardingScreen();
        }

        // Если онбординг завершен, но пользователь не премиум и paywall не пропущен, показываем paywall
        if (!subscriptionProvider.isPremium &&
            onboardingProvider.shouldShowPaywall) {
          return const SubscriptionSelectionScreen();
        }

        // Если все условия выполнены, показываем основное приложение
        return const MainNavigationScreen();
      },
    );
  }
}
