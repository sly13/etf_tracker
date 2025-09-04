import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/subscription_provider.dart';

class SubscriptionStatusWidget extends StatelessWidget {
  const SubscriptionStatusWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<SubscriptionProvider>(
      builder: (context, subscriptionProvider, child) {
        if (subscriptionProvider.isLoading) {
          return const SizedBox.shrink();
        }

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: subscriptionProvider.isPremium
                ? Colors.green
                : Colors.orange,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                subscriptionProvider.isPremium ? Icons.star : Icons.lock,
                color: Colors.white,
                size: 16,
              ),
              const SizedBox(width: 4),
              Text(
                subscriptionProvider.isPremium
                    ? 'subscription.premium'.tr()
                    : 'subscription.basic'.tr(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
