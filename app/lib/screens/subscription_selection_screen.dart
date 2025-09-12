import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/subscription_plan.dart';
import '../services/subscription_service.dart';
import '../providers/subscription_provider.dart';
import '../widgets/loading_screen.dart';
import '../config/app_config.dart';
import '../utils/haptic_feedback.dart';

class SubscriptionSelectionScreen extends StatefulWidget {
  const SubscriptionSelectionScreen({super.key});

  @override
  State<SubscriptionSelectionScreen> createState() =>
      _SubscriptionSelectionScreenState();
}

class _SubscriptionSelectionScreenState
    extends State<SubscriptionSelectionScreen>
    with TickerProviderStateMixin {
  bool _isLoading = false;
  bool _isCloseButtonLoading = true; // Лоадер для кнопки закрытия
  bool _isLoadingPrices = true;
  String? _selectedPlanId = 'yearly'; // По умолчанию выбираем годовую подписку
  List<SubscriptionPlan> _plans = [];
  late AnimationController _closeButtonAnimationController;

  @override
  void initState() {
    super.initState();
    // Создаем контроллер анимации для одного оборота за 5 секунд
    _closeButtonAnimationController = AnimationController(
      duration: const Duration(seconds: 5),
      vsync: this,
    );

    // Запускаем анимацию
    _closeButtonAnimationController.forward();

    // По окончании анимации активируем кнопку
    _closeButtonAnimationController.addStatusListener((status) {
      if (status == AnimationStatus.completed && mounted) {
        setState(() {
          _isCloseButtonLoading = false;
        });
      }
    });

    // Загружаем цены из RevenueCat
    _loadPrices();
  }

  Future<void> _loadPrices() async {
    try {
      final storeProducts = await SubscriptionService.getAvailablePackages();
      final plans = SubscriptionPlan.createPlansWithStoreProducts(
        storeProducts,
      );

      if (mounted) {
        setState(() {
          _plans = plans;
          _isLoadingPrices = false;
        });
      }
    } catch (e) {
      print('Ошибка загрузки цен: $e');
      // Используем планы по умолчанию
      if (mounted) {
        setState(() {
          _plans = SubscriptionPlan.availablePlans;
          _isLoadingPrices = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _closeButtonAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
          ? LoadingScreen(
              message: 'subscription.processing'.tr(),
              showProgress: true,
            )
          : Stack(
              children: [
                _buildContent(),
                // Кнопка восстановления покупок в левом верхнем углу
                Positioned(
                  top: MediaQuery.of(context).padding.top + 16,
                  left: 16,
                  child: IconButton(
                    icon: const Icon(Icons.restore, color: Colors.white),
                    onPressed: _handleRestorePurchases,
                    tooltip: 'Restore purchases',
                  ),
                ),
                // Кнопка закрытия в правом верхнем углу
                Positioned(
                  top: MediaQuery.of(context).padding.top + 16,
                  right: 16,
                  child: IconButton(
                    icon: _isCloseButtonLoading
                        ? SizedBox(
                            width: 20,
                            height: 20,
                            child: AnimatedBuilder(
                              animation: _closeButtonAnimationController,
                              builder: (context, child) {
                                return CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.grey[400]!,
                                  ),
                                  value: _closeButtonAnimationController.value,
                                );
                              },
                            ),
                          )
                        : const Icon(Icons.close, color: Colors.white),
                    onPressed: _isCloseButtonLoading
                        ? null
                        : () => Navigator.of(context).pop(),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildContent() {
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Column(
      children: [
        // Изображение сверху
        _buildHeroImage(),

        // Основной контент
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Заголовок
                _buildHeader(),
                SizedBox(height: isSmallScreen ? 12 : 20),

                // Преимущества
                Expanded(flex: isSmallScreen ? 2 : 3, child: _buildBenefits()),
                SizedBox(height: isSmallScreen ? 12 : 20),

                // Планы подписок
                _buildSubscriptionPlans(),
                SizedBox(height: isSmallScreen ? 12 : 20),

                // Кнопка покупки
                _buildPurchaseButton(),
                SizedBox(height: isSmallScreen ? 8 : 12),

                // Ссылки на Terms of Use и Privacy Policy
                _buildLegalLinks(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeroImage() {
    final screenHeight = MediaQuery.of(context).size.height;

    // Адаптивная высота: больше на больших экранах, меньше на маленьких
    final heroHeight = screenHeight > 800
        ? 220.0
        : (screenHeight > 600 ? 180.0 : 140.0);

    return Container(
      height: heroHeight,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Theme.of(context).colorScheme.primary,
            Theme.of(context).colorScheme.primary.withOpacity(0.8),
            Theme.of(context).colorScheme.secondary,
          ],
        ),
      ),
      child: Stack(
        children: [
          // Фоновые элементы
          Positioned(
            top: 20,
            left: 20,
            child: Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(30),
              ),
              child: Icon(Icons.trending_up, color: Colors.white, size: 30),
            ),
          ),
          Positioned(
            top: 40,
            right: 30,
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(Icons.analytics, color: Colors.white, size: 20),
            ),
          ),
          Positioned(
            bottom: 30,
            left: 40,
            child: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(25),
              ),
              child: Icon(Icons.insights, color: Colors.white, size: 25),
            ),
          ),
          // Центральный текст
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.workspace_premium, color: Colors.white, size: 48),
                const SizedBox(height: 8),
                Text(
                  'Unlock Premium Today',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Unlock Premium Today',
          style: TextStyle(
            fontSize: isSmallScreen ? 20 : 24,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        SizedBox(height: isSmallScreen ? 4 : 6),
        Text(
          'Get access to all subscriber benefits',
          style: TextStyle(
            fontSize: isSmallScreen ? 14 : 16,
            color: isDark ? Colors.white.withOpacity(0.7) : Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildBenefits() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'subscription.features.title'.tr(),
          style: TextStyle(
            fontSize: isSmallScreen ? 16 : 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        SizedBox(height: isSmallScreen ? 12 : 16),
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildBenefitItem(
                'subscription.features.analytics'.tr(),
                Icons.analytics_outlined,
              ),
              _buildBenefitItem(
                'subscription.features.statistics'.tr(),
                Icons.bar_chart_outlined,
              ),
              _buildBenefitItem(
                'subscription.features.notifications'.tr(),
                Icons.notifications_outlined,
              ),
              _buildBenefitItem(
                'subscription.features.insights'.tr(),
                Icons.insights_outlined,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBenefitItem(String text, IconData icon) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.blue.shade900.withOpacity(0.3)
                  : Colors.blue.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: isDark ? Colors.blue.shade300 : Colors.blue.shade700,
              size: isSmallScreen ? 18 : 20,
            ),
          ),
          SizedBox(width: isSmallScreen ? 12 : 16),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: isSmallScreen ? 14 : 16,
                color: isDark ? Colors.white : Colors.black87,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubscriptionPlans() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Choose Plan',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
        const SizedBox(height: 12),
        if (_isLoadingPrices)
          const Center(child: CircularProgressIndicator())
        else
          ..._plans.map((plan) {
            return _buildPlanCard(plan);
          }).toList(),
      ],
    );
  }

  Widget _buildPlanCard(SubscriptionPlan plan) {
    final isSelected = _selectedPlanId == plan.id;
    final isPopular = plan.isPopular;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isSelected ? Colors.white : Colors.transparent,
          width: 2,
        ),
      ),
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedPlanId = plan.id;
          });
        },
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Радио кнопка
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.grey[400]!, width: 1),
                  color: isSelected ? Colors.white : Colors.transparent,
                ),
                child: isSelected
                    ? Icon(Icons.check, color: Colors.black, size: 14)
                    : null,
              ),
              const SizedBox(width: 12),

              // Контент плана
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            plan.id == 'yearly' ? 'Year' : 'Week',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        if (isPopular)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _getDiscountText(plan),
                              style: const TextStyle(
                                color: Colors.black,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    if (plan.id == 'yearly')
                      Row(
                        children: [
                          Text(
                            _getOriginalPrice(plan),
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[400],
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            plan.price,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      )
                    else
                      Text(
                        '3 Days free then ${plan.price}',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.white,
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

  Future<void> _handleRestorePurchases() async {
    HapticUtils.lightImpact();

    try {
      print('🔄 Начинаем восстановление покупок...');

      // Восстанавливаем покупки
      final customerInfo = await SubscriptionService.restorePurchases();
      print('✅ Покупки восстановлены');

      // Проверяем статус подписки после восстановления
      final isPremium = customerInfo.entitlements.active.containsKey('premium');
      print(
        '🔍 Статус подписки после восстановления: ${isPremium ? "Premium" : "Basic"}',
      );
      print(
        '🔍 Активные entitlements: ${customerInfo.entitlements.active.keys}',
      );

      // Обновляем статус в SubscriptionProvider
      final subscriptionProvider = Provider.of<SubscriptionProvider>(
        context,
        listen: false,
      );
      subscriptionProvider.setPremiumStatus(isPremium);

      // Принудительно обновляем статус из RevenueCat
      await subscriptionProvider.refreshSubscriptionStatus();
      print('✅ Статус подписки обновлен в провайдере');

      // Синхронизируем с бэкендом
      await SubscriptionService.syncSubscriptions();
      print('✅ Синхронизация с бэкендом завершена');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isPremium
                  ? 'Покупки восстановлены! Премиум активирован.'
                  : 'Покупки восстановлены, но активных подписок не найдено.',
            ),
            backgroundColor: isPremium ? Colors.green : Colors.orange,
          ),
        );
      }
    } catch (e) {
      print('❌ Ошибка восстановления покупок: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('subscription.restore_error'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildLegalLinks() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        TextButton(
          onPressed: () => _openUrl(AppConfig.termsOfUseUrl),
          child: Text(
            'Terms of Use',
            style: TextStyle(
              color: isDark ? Colors.white.withOpacity(0.7) : Colors.grey[600],
              decoration: TextDecoration.underline,
              fontSize: isSmallScreen ? 12 : 14,
            ),
          ),
        ),
        Text(
          ' • ',
          style: TextStyle(
            color: isDark ? Colors.white.withOpacity(0.5) : Colors.grey[500],
            fontSize: isSmallScreen ? 12 : 14,
          ),
        ),
        TextButton(
          onPressed: () => _openUrl(AppConfig.privacyPolicyUrl),
          child: Text(
            'Privacy Policy',
            style: TextStyle(
              color: isDark ? Colors.white.withOpacity(0.7) : Colors.grey[600],
              decoration: TextDecoration.underline,
              fontSize: isSmallScreen ? 12 : 14,
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _openUrl(String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Не удалось открыть ссылку'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка открытия ссылки: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildPurchaseButton() {
    if (_plans.isEmpty) {
      return const SizedBox.shrink();
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handlePurchase,
        style: ElevatedButton.styleFrom(
          backgroundColor: isDark ? Colors.white : Colors.black,
          foregroundColor: isDark ? Colors.black : Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
        child: _isLoading
            ? SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    isDark ? Colors.black : Colors.white,
                  ),
                ),
              )
            : Text(
                _selectedPlanId == 'yearly' ? 'Continue' : 'Try for Free',
                style: TextStyle(
                  fontSize: isSmallScreen ? 14 : 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.black : Colors.white,
                ),
              ),
      ),
    );
  }

  String _getDiscountText(SubscriptionPlan plan) {
    if (plan.id == 'yearly' && _plans.length >= 2) {
      try {
        final monthlyPlan = _plans.firstWhere((p) => p.id == 'monthly');

        if (plan.storeProduct != null && monthlyPlan.storeProduct != null) {
          final yearlyPrice = _extractPriceValue(plan.price);
          final monthlyPrice = _extractPriceValue(monthlyPlan.price);

          if (yearlyPrice != null && monthlyPrice != null) {
            final originalPrice = monthlyPrice * 12;
            final discount =
                ((originalPrice - yearlyPrice) / originalPrice * 100).round();
            return 'SAVE ${discount}%';
          }
        }
      } catch (e) {
        print('Ошибка расчета скидки: $e');
      }
    }
    return 'SAVE 91%'; // Fallback
  }

  String _getOriginalPrice(SubscriptionPlan plan) {
    if (plan.id == 'yearly' && _plans.length >= 2) {
      try {
        final monthlyPlan = _plans.firstWhere((p) => p.id == 'monthly');

        if (monthlyPlan.storeProduct != null) {
          final monthlyPrice = _extractPriceValue(monthlyPlan.price);

          if (monthlyPrice != null) {
            final originalValue = monthlyPrice * 12;
            return _formatPrice(originalValue, monthlyPlan.price);
          }
        }
      } catch (e) {
        print('Ошибка расчета оригинальной цены: $e');
      }
    }
    return 'Rp 4.640.714'; // Fallback для примера
  }

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

  Future<void> _handlePurchase() async {
    if (_selectedPlanId == null || _plans.isEmpty) return;

    print('🔧 Начинаем процесс покупки подписки...');
    print('🔧 Выбранный план: $_selectedPlanId');

    setState(() {
      _isLoading = true;
    });

    try {
      final plan = _plans.firstWhere((plan) => plan.id == _selectedPlanId);
      print('🔧 Найден план: ${plan.title} (${plan.productId})');

      // Проверяем, есть ли StoreProduct
      if (plan.storeProduct == null) {
        print('❌ StoreProduct недоступен для плана: ${plan.productId}');
        throw Exception(
          'StoreProduct not available for plan: ${plan.productId}',
        );
      }

      print('🔧 StoreProduct доступен: ${plan.storeProduct!.identifier}');
      print('🔧 Цена: ${plan.storeProduct!.priceString}');

      // Покупаем подписку
      print('🔧 Вызываем SubscriptionService.purchasePackage...');
      final customerInfo = await SubscriptionService.purchasePackage(
        plan.storeProduct!,
      );
      print('✅ Покупка завершена успешно!');

      // Проверяем entitlements
      print('🔧 Проверяем entitlements после покупки...');
      print('🔧 Все entitlements: ${customerInfo.entitlements.all.keys}');
      print(
        '🔧 Активные entitlements: ${customerInfo.entitlements.active.keys}',
      );

      // Обновляем статус в провайдере
      final subscriptionProvider = Provider.of<SubscriptionProvider>(
        context,
        listen: false,
      );

      // Временная логика: если entitlements не настроены, проверяем активные покупки
      var isPremium = customerInfo.entitlements.active.containsKey('premium');

      // Если entitlements не настроены, но покупка прошла успешно
      if (customerInfo.entitlements.all.isEmpty &&
          customerInfo.activeSubscriptions.isNotEmpty) {
        print('🔧 Entitlements не настроены, но покупка прошла успешно');
        isPremium = true;
      }

      print('🔧 Статус премиум после покупки: $isPremium');
      print('🔧 Проверяем entitlement "premium"');
      print(
        '🔧 Активные entitlements: ${customerInfo.entitlements.active.keys}',
      );
      print('🔧 Активные покупки: ${customerInfo.activeSubscriptions.length}');
      print('🔧 Обновляем статус в SubscriptionProvider...');

      subscriptionProvider.setPremiumStatus(isPremium);

      print('🔧 Статус обновлен в провайдере');

      // Принудительно обновляем статус из RevenueCat
      await subscriptionProvider.refreshSubscriptionStatus();
      print('🔧 Статус принудительно обновлен из RevenueCat');

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('subscription.success'.tr()),
            backgroundColor: Colors.green,
          ),
        );
        print('✅ Экран закрыт, показано уведомление об успехе');
      }
    } catch (e) {
      print('❌ Ошибка покупки: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('subscription.purchase_error'.tr()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        print('🔧 Состояние загрузки сброшено');
      }
    }
  }
}
