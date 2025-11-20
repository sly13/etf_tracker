import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../providers/subscription_provider.dart';
import '../../services/subscription_service.dart';
import '../../utils/haptic_feedback.dart';
import '../../screens/subscription_selection_screen.dart';

class SubscriptionSection extends StatefulWidget {
  const SubscriptionSection({super.key});

  @override
  State<SubscriptionSection> createState() => SubscriptionSectionState();
}

class SubscriptionSectionState extends State<SubscriptionSection> {
  bool _isCheckingSubscription = false;
  bool? _cachedSubscriptionStatus;

  @override
  void initState() {
    super.initState();
    // Загружаем статус из SubscriptionProvider при инициализации
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadSubscriptionStatusFromProvider();
    });
  }

  void _loadSubscriptionStatusFromProvider() {
    if (!mounted) return;
    
    final subscriptionProvider = Provider.of<SubscriptionProvider>(
      context,
      listen: false,
    );
    
    // Загружаем статус из провайдера, если он уже инициализирован
    // Consumer автоматически обновит UI, когда провайдер инициализируется
    if (subscriptionProvider.isInitialized) {
      setState(() {
        _cachedSubscriptionStatus = subscriptionProvider.isPremium;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Используем Consumer для автоматического обновления при изменении статуса
    return Consumer<SubscriptionProvider>(
      builder: (context, subscriptionProvider, child) {
        // Используем статус из провайдера, если он инициализирован
        final currentStatus = subscriptionProvider.isInitialized 
            ? subscriptionProvider.isPremium 
            : _cachedSubscriptionStatus;
        
        // Обновляем локальный кэш для совместимости
        if (subscriptionProvider.isInitialized && 
            _cachedSubscriptionStatus != subscriptionProvider.isPremium) {
          _cachedSubscriptionStatus = subscriptionProvider.isPremium;
        }
        
        return _buildContent(isDark, currentStatus);
      },
    );
  }

  Widget _buildContent(bool isDark, bool? subscriptionStatus) {

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        Text(
          'subscription.status'.tr(),
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1C1C1E) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDark
                  ? Colors.grey.withOpacity(0.2)
                  : Colors.grey.withOpacity(0.3),
              width: 0.5,
            ),
            boxShadow: isDark
                ? null
                : [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: Colors.grey.withOpacity(0.2),
                      width: 0.5,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      subscriptionStatus == true
                          ? Icons.star
                          : Icons.lock_outline,
                      color: subscriptionStatus == true
                          ? Colors.green
                          : Colors.grey,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'subscription.current_plan'.tr(),
                            style: TextStyle(
                              fontSize: 16,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            subscriptionStatus == true
                                ? 'subscription.premium'.tr()
                                : 'subscription.basic'.tr(),
                            style: TextStyle(
                              fontSize: 14,
                              color: subscriptionStatus == true
                                  ? Colors.green
                                  : Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (_isCheckingSubscription)
                      const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.blue,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              // Pro Button
              GestureDetector(
                onTap: () {
                  HapticUtils.lightImpact();
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) =>
                          const SubscriptionSelectionScreen(),
                      transitionsBuilder:
                          (context, animation, secondaryAnimation, child) {
                        const begin = Offset(0.0, 1.0);
                        const end = Offset.zero;
                        const curve = Curves.easeOutCubic;

                        var tween = Tween(
                          begin: begin,
                          end: end,
                        ).chain(CurveTween(curve: curve));

                        return SlideTransition(
                          position: animation.drive(tween),
                          child: child,
                        );
                      },
                      transitionDuration: const Duration(milliseconds: 400),
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                        color: Colors.grey.withOpacity(0.2),
                        width: 0.5,
                      ),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFFFF6B35), Color(0xFFFFD23F)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.workspace_premium,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'subscription.upgrade_to_pro'.tr(),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.orange,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Разделитель
              Container(height: 0.5, color: Colors.grey.withOpacity(0.2)),
              GestureDetector(
                onTap: _isCheckingSubscription
                    ? null
                    : () async {
                        HapticUtils.lightImpact();
                        await _refreshSubscriptionStatus();
                      },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.refresh, color: Colors.blue, size: 20),
                      const SizedBox(width: 12),
                      Text(
                        'subscription.refresh_status'.tr(),
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.blue,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Restore Purchases Button
              GestureDetector(
                onTap: _isCheckingSubscription
                    ? null
                    : () async {
                        HapticUtils.lightImpact();
                        await _handleRestorePurchases();
                      },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                        color: Colors.grey.withOpacity(0.2),
                        width: 0.5,
                      ),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.restore, color: Colors.green, size: 20),
                      const SizedBox(width: 12),
                      Text(
                        'subscription.restore_purchases'.tr(),
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _refreshSubscriptionStatus() async {
    if (!mounted) return;

    setState(() {
      _isCheckingSubscription = true;
      _cachedSubscriptionStatus = null;
    });

    try {
      await SubscriptionService.initialize();
      final isPremium = await SubscriptionService.refreshSubscriptionStatus();
      _cachedSubscriptionStatus = isPremium;

      // Обновляем статус в SubscriptionProvider для обновления ProButton в хэдере
      final subscriptionProvider = Provider.of<SubscriptionProvider>(
        context,
        listen: false,
      );
      subscriptionProvider.setPremiumStatus(isPremium);

      // Принудительно обновляем статус из RevenueCat
      await subscriptionProvider.refreshSubscriptionStatus();

      if (mounted) {
        setState(() {});
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${'errors.subscription_status_error'.tr()}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isCheckingSubscription = false;
        });
      }
    }
  }

  Future<void> _handleRestorePurchases() async {
    if (!mounted) return;

    setState(() {
      _isCheckingSubscription = true;
    });

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

      // Обновляем локальный кэш
      _cachedSubscriptionStatus = isPremium;

      if (mounted) {
        setState(() {});
      }

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
    } finally {
      if (mounted) {
        setState(() {
          _isCheckingSubscription = false;
        });
      }
    }
  }

  /// Метод для обновления статуса подписки извне (вызывается из SettingsScreen)
  void refreshStatus() {
    _refreshSubscriptionStatus();
  }

  /// Метод для получения текущего статуса подписки
  bool? getSubscriptionStatus() {
    return _cachedSubscriptionStatus;
  }
}

