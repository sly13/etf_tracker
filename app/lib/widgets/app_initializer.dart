import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/onboarding_provider.dart';
import '../providers/subscription_provider.dart';
import '../screens/main_navigation_screen.dart';
import '../screens/onboarding_screen.dart';
import '../screens/subscription_selection_screen.dart';
import '../utils/revenuecat_checker.dart';

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
    _initializeProviders();
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

      // Сначала быстро инициализируем онбординг (он обычно быстрый)
      await onboardingProvider.initialize();

      // Затем инициализируем подписку с таймаутом
      try {
        await subscriptionProvider.initialize().timeout(
          const Duration(seconds: 5),
          onTimeout: () {
            print(
              '⚠️ Таймаут инициализации SubscriptionProvider, используем кэш',
            );
            // Если таймаут, используем кэшированные данные
            return;
          },
        );
      } catch (e) {
        print('⚠️ Ошибка инициализации SubscriptionProvider: $e');
        // Продолжаем работу даже если подписка не инициализировалась
      }

      if (mounted) {
        setState(() {
          _isInitializing = false;
        });
        
        // Запускаем диагностику RevenueCat после запуска приложения
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (kDebugMode) {
            RevenueCatChecker.printDiagnostics();
          }
        });
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

  @override
  Widget build(BuildContext context) {
    // Показываем загрузку пока провайдеры не инициализированы
    if (_isInitializing) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Показываем логотип или иконку приложения
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.trending_up,
                  color: Colors.white,
                  size: 40,
                ),
              ),
              const SizedBox(height: 24),
              CircularProgressIndicator(color: Theme.of(context).primaryColor),
              const SizedBox(height: 16),
              Text(
                'common.loading'.tr(),
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Theme.of(
                    context,
                  ).textTheme.bodyLarge?.color?.withOpacity(0.7),
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
