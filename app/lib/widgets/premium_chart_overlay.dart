import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:easy_localization/easy_localization.dart';
import '../services/subscription_service.dart';
import '../screens/subscription_selection_screen.dart';
import '../providers/subscription_provider.dart';
import 'package:provider/provider.dart';

class PremiumChartOverlay extends StatelessWidget {
  final Widget child;
  final String title;
  final String description;
  final VoidCallback? onSubscribe;

  const PremiumChartOverlay({
    super.key,
    required this.child,
    required this.title,
    required this.description,
    this.onSubscribe,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<SubscriptionProvider>(
      builder: (context, subscriptionProvider, child) {
        // Используем быстрый доступ к статусу
        final isPremium = subscriptionProvider.isPremiumFast;

        print('🔧 PremiumChartOverlay: isPremium = $isPremium');
        print('🔧 PremiumChartOverlay: title = $title');
        print(
          '🔧 PremiumChartOverlay: subscriptionProvider.isPremium = ${subscriptionProvider.isPremium}',
        );

        if (isPremium) {
          // Если премиум - показываем обычный контент
          print('🔧 PremiumChartOverlay: Показываем разблокированный контент');
          return this.child;
        }

        // Если не премиум - показываем заблокированный контент
        print('🔧 PremiumChartOverlay: Показываем заблокированный контент');
        return _buildLockedContent(context);
      },
    );
  }

  Widget _buildLockedContent(BuildContext context) {
    return Stack(
      children: [
        // Размытый контент
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: ImageFiltered(
            imageFilter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
            child: Opacity(opacity: 0.3, child: child),
          ),
        ),

        // Overlay с замком и кнопкой
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: Colors.black.withValues(alpha: 0.1),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Иконка замка
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Theme.of(
                      context,
                    ).colorScheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(
                      color: Theme.of(context).colorScheme.primary,
                      width: 2,
                    ),
                  ),
                  child: Icon(
                    Icons.lock,
                    size: 30,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),

                const SizedBox(height: 16),

                // Заголовок
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 8),

                // Описание
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Text(
                    description,
                    style: TextStyle(
                      fontSize: 14,
                      color: Theme.of(
                        context,
                      ).colorScheme.onSurface.withValues(alpha: 0.7),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),

                const SizedBox(height: 20),

                // Кнопка подписки
                ElevatedButton.icon(
                  onPressed:
                      onSubscribe ??
                      () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                const SubscriptionSelectionScreen(),
                          ),
                        );
                      },
                  icon: const Icon(Icons.star),
                  label: Text('premium.unlock'.tr()),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
