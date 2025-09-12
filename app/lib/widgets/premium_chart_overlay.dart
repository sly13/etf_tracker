import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:easy_localization/easy_localization.dart';
import '../screens/subscription_selection_screen.dart';
import '../providers/subscription_provider.dart';
import 'package:provider/provider.dart';

class PremiumChartOverlay extends StatelessWidget {
  final Widget child;
  final String title;
  final String description;
  final VoidCallback? onSubscribe;
  final double? lockedHeight;

  const PremiumChartOverlay({
    super.key,
    required this.child,
    required this.title,
    required this.description,
    this.onSubscribe,
    this.lockedHeight,
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

        // Если не премиум - показываем заблокированный контент с ограниченной высотой
        print('🔧 PremiumChartOverlay: Показываем заблокированный контент');
        return SizedBox(
          height:
              lockedHeight ??
              200, // Используем переданную высоту или 200 по умолчанию
          child: _buildLockedContent(context),
        );
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
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Theme.of(
                      context,
                    ).colorScheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: Theme.of(context).colorScheme.primary,
                      width: 1.5,
                    ),
                  ),
                  child: Icon(
                    Icons.lock,
                    size: 20,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),

                const SizedBox(height: 10),

                // Заголовок
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 6),

                // Описание
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    description,
                    style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(
                        context,
                      ).colorScheme.onSurface.withValues(alpha: 0.7),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),

                const SizedBox(height: 12),

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
                  icon: const Icon(Icons.star, size: 16),
                  label: Text(
                    'premium.unlock'.tr(),
                    style: const TextStyle(fontSize: 14),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
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
