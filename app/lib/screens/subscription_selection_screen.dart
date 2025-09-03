import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../models/subscription_plan.dart';
import '../providers/auth_provider.dart';
import '../services/subscription_service.dart';
import '../widgets/loading_screen.dart';

class SubscriptionSelectionScreen extends StatefulWidget {
  const SubscriptionSelectionScreen({super.key});

  @override
  State<SubscriptionSelectionScreen> createState() =>
      _SubscriptionSelectionScreenState();
}

class _SubscriptionSelectionScreenState
    extends State<SubscriptionSelectionScreen> {
  bool _isLoading = false;
  String? _selectedPlanId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('subscription.title'.tr()),
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? const Color(0xFF0A0A0A)
            : Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? LoadingScreen(
              message: 'subscription.processing'.tr(),
              showProgress: true,
            )
          : _buildContent(),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Заголовок
          _buildHeader(),
          const SizedBox(height: 24),

          // Планы подписок
          _buildSubscriptionPlans(),
          const SizedBox(height: 24),

          // Кнопка покупки
          _buildPurchaseButton(),
          const SizedBox(height: 16),

          // Дополнительная информация
          _buildAdditionalInfo(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'subscription.header'.tr(),
          style: Theme.of(
            context,
          ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text(
          'subscription.description'.tr(),
          style: Theme.of(
            context,
          ).textTheme.bodyLarge?.copyWith(color: Colors.grey[600]),
        ),
      ],
    );
  }

  Widget _buildSubscriptionPlans() {
    return Column(
      children: SubscriptionPlan.availablePlans.map((plan) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: _buildPlanCard(plan),
        );
      }).toList(),
    );
  }

  Widget _buildPlanCard(SubscriptionPlan plan) {
    final isSelected = _selectedPlanId == plan.id;
    final isPopular = plan.isPopular;

    return Card(
      elevation: isSelected ? 8 : 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: isSelected
            ? BorderSide(color: Theme.of(context).colorScheme.primary, width: 2)
            : BorderSide.none,
      ),
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedPlanId = plan.id;
          });
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Заголовок и популярный бейдж
              Row(
                children: [
                  Expanded(
                    child: Text(
                      plan.title,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  if (isPopular)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.orange,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'subscription.popular'.tr(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),

              // Описание
              Text(
                plan.description,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
              ),
              const SizedBox(height: 16),

              // Цена и длительность
              Row(
                children: [
                  Text(
                    plan.price,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '/ ${plan.duration}',
                    style: Theme.of(
                      context,
                    ).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Функции
              Column(
                children: plan.features.map((feature) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        Icon(
                          Icons.check_circle,
                          color: Theme.of(context).colorScheme.primary,
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            feature,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),

              // Индикатор выбора
              if (isSelected)
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Row(
                    children: [
                      Icon(
                        Icons.check_circle,
                        color: Theme.of(context).colorScheme.primary,
                        size: 24,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'subscription.selected'.tr(),
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPurchaseButton() {
    final selectedPlan = SubscriptionPlan.getById(_selectedPlanId ?? '');
    final isPlanSelected = selectedPlan != null;

    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: isPlanSelected ? _purchaseSubscription : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).colorScheme.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        child: Text(
          isPlanSelected
              ? 'subscription.purchase'.tr()
              : 'subscription.select_plan'.tr(),
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildAdditionalInfo() {
    return Column(
      children: [
        const Divider(),
        const SizedBox(height: 16),
        Text(
          'subscription.features.title'.tr(),
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        _buildFeatureItem('subscription.feature_analytics'.tr()),
        _buildFeatureItem('subscription.feature_statistics'.tr()),
        _buildFeatureItem('subscription.feature_notifications'.tr()),
        _buildFeatureItem('subscription.feature_settings'.tr()),
        _buildFeatureItem('subscription.feature_favorites'.tr()),
        const SizedBox(height: 16),
        Text(
          'subscription.cancel_info'.tr(),
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildFeatureItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(
            Icons.check,
            color: Theme.of(context).colorScheme.primary,
            size: 16,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: Theme.of(context).textTheme.bodyMedium),
          ),
        ],
      ),
    );
  }

  Future<void> _purchaseSubscription() async {
    if (_selectedPlanId == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = context.read<AuthProvider>();
      final selectedPlan = SubscriptionPlan.getById(_selectedPlanId!);

      if (selectedPlan == null) {
        throw Exception('subscription.plan_not_found'.tr());
      }

      // Проверяем, что пользователь залогинен в App Store
      print('🔧 Проверяем статус входа в App Store...');
      try {
        final customerInfo = await SubscriptionService.getCustomerInfo();
        print('✅ Пользователь залогинен в App Store');
      } catch (e) {
        print('⚠️ Пользователь не залогинен в App Store: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('subscription.app_store_required'.tr()),
            backgroundColor: Colors.orange,
          ),
        );
        setState(() {
          _isLoading = false;
        });
        return;
      }

      print('🔧 Покупка подписки: ${selectedPlan.productId}');

      // Получаем доступные подписки из RevenueCat
      final availableProducts =
          await SubscriptionService.getAvailablePackages();

      // Ищем нужный продукт
      final product = availableProducts.firstWhere(
        (product) => product.identifier == selectedPlan.productId,
        orElse: () => throw Exception(
          'subscription.product_not_found'.tr() + ': ${selectedPlan.productId}',
        ),
      );

      print(
        '🔧 Найден продукт: ${product.identifier} - ${product.title} (${product.priceString})',
      );

      // Выполняем реальную покупку через RevenueCat
      final customerInfo = await SubscriptionService.purchasePackage(product);

      print('✅ Покупка успешно завершена!');
      print('🔧 Entitlements: ${customerInfo.entitlements.active.keys}');

      // Обновляем пользователя с новой подпиской через AuthProvider (если залогинен)
      if (authProvider.currentUser != null) {
        await authProvider.purchaseSubscription(product);
      } else {
        // Если пользователь не залогинен, просто сохраняем покупку локально
        print(
          'ℹ️ Пользователь не залогинен в приложении, покупка сохранена только в RevenueCat',
        );
      }

      // Принудительно обновляем статус подписки
      await SubscriptionService.refreshSubscriptionStatus();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('subscription.success'.tr()),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pop(
        context,
        true,
      ); // Возвращаем true для индикации успешной покупки
    } catch (e) {
      print('❌ Ошибка покупки: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('subscription.error'.tr() + ': $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
}
