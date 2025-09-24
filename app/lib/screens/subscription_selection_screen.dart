import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/subscription_plan.dart';
import '../services/subscription_service.dart';
import '../providers/subscription_provider.dart';
import '../providers/onboarding_provider.dart';
import '../widgets/loading_screen.dart';
import '../config/app_config.dart';
import '../utils/haptic_feedback.dart';
import 'main_navigation_screen.dart';

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
          : Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    const Color(0xFF1A1A2E), // Темно-синий
                    const Color(0xFF16213E), // Темно-синий с фиолетовым
                    const Color(0xFF0F3460), // Синий
                    const Color(0xFF533483), // Фиолетовый
                    const Color(0xFF7209B7), // Яркий фиолетовый
                  ],
                  stops: const [0.0, 0.3, 0.6, 0.8, 1.0],
                ),
              ),
              child: Stack(
                children: [
                  // Декоративные элементы фона
                  _buildBackgroundDecorations(),
                  _buildContent(),
                  // Верхняя панель с кнопками и заголовком
                  Positioned(
                    top: MediaQuery.of(context).padding.top + 16,
                    left: 0,
                    right: 0,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          // Кнопка восстановления покупок
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: IconButton(
                              icon: Icon(
                                Icons.restore,
                                color: Colors.white.withOpacity(0.9),
                              ),
                              onPressed: _handleRestorePurchases,
                              tooltip: 'subscription.restore_purchases'.tr(),
                            ),
                          ),

                          // Заголовок по центру
                          Expanded(
                            child: Center(
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.2),
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  'subscription.unlock_premium_today'.tr(),
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                          ),

                          // Кнопка закрытия
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: IconButton(
                              icon: _isCloseButtonLoading
                                  ? SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: AnimatedBuilder(
                                        animation:
                                            _closeButtonAnimationController,
                                        builder: (context, child) {
                                          return CircularProgressIndicator(
                                            strokeWidth: 2,
                                            valueColor:
                                                AlwaysStoppedAnimation<Color>(
                                                  Colors.white.withOpacity(0.8),
                                                ),
                                            value:
                                                _closeButtonAnimationController
                                                    .value,
                                          );
                                        },
                                      ),
                                    )
                                  : Icon(
                                      Icons.close,
                                      color: Colors.white.withOpacity(0.9),
                                    ),
                              onPressed: _isCloseButtonLoading
                                  ? null
                                  : () async {
                                      // Отмечаем paywall как пропущенный
                                      final onboardingProvider =
                                          Provider.of<OnboardingProvider>(
                                            context,
                                            listen: false,
                                          );
                                      await onboardingProvider
                                          .markPaywallAsSkipped();

                                      // Закрываем paywall и переходим к основному приложению
                                      if (mounted) {
                                        Navigator.of(context).pushReplacement(
                                          MaterialPageRoute(
                                            builder: (context) =>
                                                const MainNavigationScreen(),
                                          ),
                                        );
                                      }
                                    },
                              tooltip: 'subscription.skip_subscription'.tr(),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildBackgroundDecorations() {
    return Stack(
      children: [
        // Большие декоративные круги
        Positioned(
          top: -100,
          right: -100,
          child: Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [Colors.purple.withOpacity(0.1), Colors.transparent],
              ),
            ),
          ),
        ),
        Positioned(
          bottom: -150,
          left: -150,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [Colors.blue.withOpacity(0.08), Colors.transparent],
              ),
            ),
          ),
        ),
        // Средние декоративные элементы
        Positioned(
          top: 100,
          left: -50,
          child: Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.purple.withOpacity(0.05),
            ),
          ),
        ),
        Positioned(
          bottom: 200,
          right: -80,
          child: Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.blue.withOpacity(0.06),
            ),
          ),
        ),
        // Линии и формы
        Positioned(
          top: 0,
          left: 0,
          child: Container(
            width: 2,
            height: 200,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.purple.withOpacity(0.3), Colors.transparent],
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 0,
          right: 0,
          child: Container(
            width: 150,
            height: 2,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [Colors.blue.withOpacity(0.2), Colors.transparent],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildContent() {
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Column(
      children: [
        // Отступ сверху для основного контента
        SizedBox(height: MediaQuery.of(context).padding.top + 80),

        // Изображение сверху
        _buildHeroImage(),

        // Основной контент - адаптивный
        Expanded(
          child: isSmallScreen
              ? SingleChildScrollView(
                  padding: EdgeInsets.all(isSmallScreen ? 6 : 8),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Заголовок
                      _buildHeader(),
                      SizedBox(height: isSmallScreen ? 4 : 6),

                      // Преимущества
                      _buildBenefits(),
                      SizedBox(height: isSmallScreen ? 4 : 6),

                      // Планы подписок
                      _buildSubscriptionPlans(),
                      SizedBox(height: isSmallScreen ? 4 : 6),

                      // Кнопка покупки
                      _buildPurchaseButton(),
                      SizedBox(height: isSmallScreen ? 2 : 4),

                      // Ссылки на Terms of Use и Privacy Policy
                      _buildLegalLinks(),
                    ],
                  ),
                )
              : Padding(
                  padding: EdgeInsets.all(isSmallScreen ? 6 : 8),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Заголовок
                      _buildHeader(),
                      SizedBox(height: isSmallScreen ? 4 : 6),

                      // Преимущества
                      _buildBenefits(),
                      SizedBox(height: isSmallScreen ? 4 : 6),

                      // Планы подписок
                      _buildSubscriptionPlans(),
                      SizedBox(height: isSmallScreen ? 4 : 6),

                      // Кнопка покупки
                      _buildPurchaseButton(),
                      SizedBox(height: isSmallScreen ? 2 : 4),

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
    return const SizedBox.shrink();
  }

  Widget _buildHeader() {
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'subscription.whats_included'.tr(),
          style: TextStyle(
            fontSize: isSmallScreen ? 18 : 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        SizedBox(height: isSmallScreen ? 8 : 12),
        Text(
          'subscription.get_access_description'.tr(),
          style: TextStyle(
            fontSize: isSmallScreen ? 14 : 16,
            color: Colors.white.withOpacity(0.8),
          ),
        ),
      ],
    );
  }

  Widget _buildBenefits() {
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildBenefitItem(
              'subscription.advanced_analytics'.tr(),
              Icons.analytics_outlined,
              Colors.blue,
            ),
            SizedBox(height: isSmallScreen ? 8 : 12),
            _buildBenefitItem(
              'subscription.notifications_app_telegram'.tr(),
              Icons.notifications_outlined,
              Colors.green,
            ),
            SizedBox(height: isSmallScreen ? 8 : 12),
            _buildBenefitItem(
              'subscription.daily_weekly_monthly'.tr(),
              Icons.insights_outlined,
              Colors.purple,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildBenefitItem(String text, IconData icon, Color iconColor) {
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Container(
      padding: EdgeInsets.all(isSmallScreen ? 8 : 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(isSmallScreen ? 6 : 8),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: iconColor.withOpacity(0.3), width: 1),
            ),
            child: Icon(icon, color: iconColor, size: isSmallScreen ? 16 : 18),
          ),
          SizedBox(width: isSmallScreen ? 10 : 12),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: isSmallScreen ? 13 : 15,
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubscriptionPlans() {
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'subscription.choose_plan_title'.tr(),
          style: TextStyle(
            fontSize: isSmallScreen ? 18 : 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        SizedBox(height: isSmallScreen ? 12 : 16),
        if (_isLoadingPrices)
          Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          )
        else
          ..._plans.map((plan) {
            return _buildPlanCard(plan);
          }),
      ],
    );
  }

  Widget _buildPlanCard(SubscriptionPlan plan) {
    final isSelected = _selectedPlanId == plan.id;
    final isPopular = plan.isPopular;
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Container(
      margin: EdgeInsets.only(bottom: isSmallScreen ? 8 : 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected
              ? Colors.white.withOpacity(0.5)
              : Colors.white.withOpacity(0.1),
          width: isSelected ? 2 : 1,
        ),
      ),
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedPlanId = plan.id;
          });
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.all(isSmallScreen ? 12 : 16),
          child: Row(
            children: [
              // Радио кнопка
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isSelected
                        ? Colors.white
                        : Colors.white.withOpacity(0.3),
                    width: 2,
                  ),
                  color: isSelected ? Colors.white : Colors.transparent,
                ),
                child: isSelected
                    ? Icon(Icons.check, color: Colors.black, size: 14)
                    : null,
              ),
              SizedBox(width: isSmallScreen ? 10 : 12),

              // Контент плана
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            plan.id == 'yearly'
                                ? 'subscription.yearly'.tr()
                                : 'subscription.monthly'.tr(),
                            style: TextStyle(
                              fontSize: isSmallScreen ? 14 : 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        if (isPopular)
                          Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: isSmallScreen ? 6 : 8,
                              vertical: isSmallScreen ? 3 : 4,
                            ),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [Colors.pink, Colors.purple],
                              ),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              _getDiscountText(plan),
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: isSmallScreen ? 9 : 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                      ],
                    ),
                    SizedBox(height: isSmallScreen ? 4 : 6),
                    if (plan.id == 'yearly')
                      Row(
                        children: [
                          Text(
                            _getOriginalPrice(plan),
                            style: TextStyle(
                              fontSize: isSmallScreen ? 10 : 12,
                              color: Colors.white.withOpacity(0.6),
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                          SizedBox(width: isSmallScreen ? 4 : 6),
                          Text(
                            '${plan.price}/year',
                            style: TextStyle(
                              fontSize: isSmallScreen ? 12 : 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      )
                    else
                      Text(
                        '3 Days free then ${plan.price}/month',
                        style: TextStyle(
                          fontSize: isSmallScreen ? 12 : 14,
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
                  ? 'subscription.restore_success'.tr()
                  : 'subscription.restore_no_active'.tr(),
            ),
            backgroundColor: isPremium ? Colors.green : Colors.orange,
          ),
        );

        // Если покупки восстановлены и пользователь стал премиум,
        // AppInitializer автоматически покажет основное приложение
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
    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Column(
      children: [
        // Показываем разные сообщения в зависимости от выбранного плана
        Text(
          _selectedPlanId == 'monthly'
              ? 'subscription.cancel_anytime'.tr()
              : 'subscription.cancel_anytime_short'.tr(),
          style: TextStyle(
            color: Colors.white.withOpacity(0.7),
            fontSize: isSmallScreen ? 10 : 12,
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: isSmallScreen ? 6 : 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(
              onPressed: () => _openUrl(AppConfig.termsOfUseUrl),
              child: Text(
                'subscription.terms_of_use'.tr(),
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  decoration: TextDecoration.underline,
                  fontSize: isSmallScreen ? 10 : 12,
                ),
              ),
            ),
            Text(
              ' • ',
              style: TextStyle(
                color: Colors.white.withOpacity(0.5),
                fontSize: isSmallScreen ? 10 : 12,
              ),
            ),
            TextButton(
              onPressed: () => _openUrl(AppConfig.privacyPolicyUrl),
              child: Text(
                'subscription.privacy_policy'.tr(),
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  decoration: TextDecoration.underline,
                  fontSize: isSmallScreen ? 10 : 12,
                ),
              ),
            ),
          ],
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

    final screenHeight = MediaQuery.of(context).size.height;
    final isSmallScreen = screenHeight < 700;

    return Container(
      width: double.infinity,
      height: 48,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.pink, Colors.purple, Colors.blue],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.pink.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handlePurchase,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
          shadowColor: Colors.transparent,
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
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Text(
                _selectedPlanId == 'yearly'
                    ? 'subscription.continue'.tr()
                    : 'subscription.try_for_free'.tr(),
                style: TextStyle(
                  fontSize: isSmallScreen ? 14 : 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 0.5,
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
            return 'subscription.save_percent'.tr(
              namedArgs: {'percent': discount.toString()},
            );
          }
        }
      } catch (e) {
        print('Ошибка расчета скидки: $e');
      }
    }
    return 'subscription.save_percent'.tr(
      namedArgs: {'percent': '91'},
    ); // Fallback
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
        // После успешной покупки AppInitializer автоматически покажет основное приложение
        // так как пользователь теперь премиум
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('subscription.success'.tr()),
            backgroundColor: Colors.green,
          ),
        );
        print('✅ Покупка завершена, показано уведомление об успехе');
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
