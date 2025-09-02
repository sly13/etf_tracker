import 'package:easy_localization/easy_localization.dart';

class SubscriptionPlan {
  final String id;
  final String title;
  final String description;
  final String price;
  final String duration;
  final String productId;
  final List<String> features;
  final bool isPopular;

  const SubscriptionPlan({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.duration,
    required this.productId,
    required this.features,
    this.isPopular = false,
  });

  // Ваши подписки
  static List<SubscriptionPlan> get availablePlans => [
    SubscriptionPlan(
      id: 'monthly',
      title: 'subscription.monthly_plan'.tr(),
      description: 'subscription.monthly_description'.tr(),
      price: '\$4.99',
      duration: 'subscription.one_month'.tr(),
      productId: 'MONTHLY_ETF_FLOW_PLAN',
      features: [
        'subscription.feature_analytics'.tr(),
        'subscription.feature_statistics'.tr(),
        'subscription.feature_notifications'.tr(),
        'subscription.feature_settings'.tr(),
        'subscription.feature_favorites'.tr(),
      ],
    ),
    SubscriptionPlan(
      id: 'yearly',
      title: 'subscription.yearly_plan'.tr(),
      description: 'subscription.yearly_description'.tr(),
      price: '\$49.9',
      duration: 'subscription.one_year'.tr(),
      productId: 'YEARLY_ETF_FLOW_PLAN',
      features: [
        'subscription.feature_analytics'.tr(),
        'subscription.feature_statistics'.tr(),
        'subscription.feature_notifications'.tr(),
        'subscription.feature_settings'.tr(),
        'subscription.feature_favorites'.tr(),
        'subscription.feature_support'.tr(),
        'subscription.feature_insights'.tr(),
      ],
      isPopular: true,
    ),
  ];

  // Получить план по ID
  static SubscriptionPlan? getById(String id) {
    try {
      return availablePlans.firstWhere((plan) => plan.id == id);
    } catch (e) {
      return null;
    }
  }

  // Получить план по Product ID
  static SubscriptionPlan? getByProductId(String productId) {
    try {
      return availablePlans.firstWhere((plan) => plan.productId == productId);
    } catch (e) {
      return null;
    }
  }
}
