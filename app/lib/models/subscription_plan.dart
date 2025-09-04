import 'package:easy_localization/easy_localization.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

class SubscriptionPlan {
  final String id;
  final String title;
  final String description;
  final String duration;
  final String productId;
  final List<String> features;
  final bool isPopular;
  final StoreProduct? storeProduct;

  const SubscriptionPlan({
    required this.id,
    required this.title,
    required this.description,
    required this.duration,
    required this.productId,
    required this.features,
    this.isPopular = false,
    this.storeProduct,
  });

  // Получить цену из StoreProduct или fallback
  String get price {
    if (storeProduct != null) {
      return storeProduct!.priceString;
    }
    // Fallback цены
    switch (id) {
      case 'yearly':
        return '\$49.9';
      case 'monthly':
        return '\$4.99';
      default:
        return '\$0.00';
    }
  }

  // Получить оригинальную цену (для годового плана)
  String? get originalPrice {
    if (id == 'yearly' && storeProduct != null) {
      // Рассчитываем оригинальную цену как 12 месяцев месячной подписки
      final monthlyPlan = SubscriptionPlan.availablePlans.firstWhere(
        (plan) => plan.id == 'monthly',
      );

      // Если есть StoreProduct для месячного плана, используем его цену
      if (monthlyPlan.storeProduct != null) {
        final monthlyPrice = monthlyPlan.storeProduct!.priceString;

        // Извлекаем числовые значения из строк цен
        final monthlyValue = _extractPriceValue(monthlyPrice);

        if (monthlyValue != null) {
          final originalValue = monthlyValue * 12;
          return _formatPrice(originalValue, monthlyPrice);
        }
      }
    }
    return null;
  }

  // Получить процент скидки
  int? get discountPercentage {
    if (id == 'yearly' && storeProduct != null && originalPrice != null) {
      final originalValue = _extractPriceValue(originalPrice!);
      final currentValue = _extractPriceValue(price);

      if (originalValue != null && currentValue != null) {
        final discount = ((originalValue - currentValue) / originalValue * 100)
            .round();
        return discount > 0 ? discount : null;
      }
    }
    return null;
  }

  // Извлечь числовое значение из строки цены
  double? _extractPriceValue(String priceString) {
    try {
      // Убираем все символы кроме цифр и точки
      final cleanString = priceString.replaceAll(RegExp(r'[^\d.,]'), '');
      // Заменяем запятую на точку для корректного парсинга
      final normalizedString = cleanString.replaceAll(',', '.');
      return double.tryParse(normalizedString);
    } catch (e) {
      return null;
    }
  }

  // Форматировать цену в том же стиле, что и оригинальная
  String _formatPrice(double value, String originalPriceString) {
    // Определяем валюту из оригинальной строки
    final currencyMatch = RegExp(
      r'[A-Z]{3}|\$|€|£|¥|₽|Rp',
    ).firstMatch(originalPriceString);
    final currency = currencyMatch?.group(0) ?? '\$';

    // Форматируем число в зависимости от валюты
    if (currency == 'Rp') {
      return 'Rp ${value.toStringAsFixed(0)}';
    } else if (currency == '\$') {
      return '\$${value.toStringAsFixed(2)}';
    } else {
      return '${value.toStringAsFixed(2)} $currency';
    }
  }

  // Ваши подписки
  static List<SubscriptionPlan> get availablePlans => [
    SubscriptionPlan(
      id: 'yearly',
      title: 'subscription.yearly_plan'.tr(),
      description: '',
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
    SubscriptionPlan(
      id: 'monthly',
      title: 'subscription.monthly_plan'.tr(),
      description: '',
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

  // Создать планы с реальными ценами из RevenueCat
  static List<SubscriptionPlan> createPlansWithStoreProducts(
    List<StoreProduct> storeProducts,
  ) {
    return availablePlans.map((plan) {
      StoreProduct? storeProduct;
      try {
        storeProduct = storeProducts.firstWhere(
          (product) => product.identifier == plan.productId,
        );
      } catch (e) {
        storeProduct = null;
      }

      return SubscriptionPlan(
        id: plan.id,
        title: plan.title,
        description: plan.description,
        duration: plan.duration,
        productId: plan.productId,
        features: plan.features,
        isPopular: plan.isPopular,
        storeProduct: storeProduct,
      );
    }).toList();
  }
}
