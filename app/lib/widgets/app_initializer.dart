import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/onboarding_provider.dart';
import '../providers/subscription_provider.dart';
import '../screens/main_navigation_screen.dart';
import '../screens/onboarding_screen.dart';
import '../screens/subscription_selection_screen.dart';

class AppInitializer extends StatelessWidget {
  const AppInitializer({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer2<OnboardingProvider, SubscriptionProvider>(
      builder: (context, onboardingProvider, subscriptionProvider, child) {
        // Показываем загрузку пока провайдеры не инициализированы
        if (!onboardingProvider.isInitialized ||
            !subscriptionProvider.isInitialized) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

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
