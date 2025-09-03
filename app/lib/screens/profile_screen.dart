import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:purchases_flutter/purchases_flutter.dart' show StoreProduct;
import 'package:easy_localization/easy_localization.dart';
import '../providers/auth_provider.dart';
import '../widgets/loading_screen.dart';
import '../services/subscription_service.dart';
import '../services/subscription_test.dart';
import '../config/app_config.dart';
import 'subscription_selection_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isSigningIn = false;
  bool _isCheckingSubscription = false;
  bool? _cachedSubscriptionStatus;

  @override
  void initState() {
    super.initState();
    // Обновляем статус подписки при открытии экрана
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _refreshSubscriptionStatus();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('profile.title'.tr()),
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? const Color(0xFF0A0A0A)
            : Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          if (_isSigningIn) {
            return LoadingScreen(
              message: 'auth.signing_in_apple'.tr(),
              showProgress: true,
            );
          }

          if (authProvider.isAuthenticated) {
            return _buildAuthenticatedProfile(authProvider);
          } else {
            return _buildLoginScreen(authProvider);
          }
        },
      ),
    );
  }

  Widget _buildAuthenticatedProfile(AuthProvider authProvider) {
    final user = authProvider.currentUser;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Подписка
          _buildSubscriptionCard(authProvider),
          const SizedBox(height: 16),

          // Настройки
          _buildSettingsCard(),
        ],
      ),
    );
  }

  Widget _buildSubscriptionCard(AuthProvider authProvider) {
    return FutureBuilder<bool>(
      future: _checkSubscriptionStatus(),
      builder: (context, snapshot) {
        final isPremium = snapshot.data ?? false;
        final subscription = authProvider.currentUser?.subscription;

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    if (_isCheckingSubscription)
                      const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    else
                      Icon(
                        isPremium ? Icons.star : Icons.star_border,
                        color: isPremium ? Colors.amber : Colors.grey,
                      ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'profile.subscription'.tr(),
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: _refreshSubscriptionStatus,
                      icon: const Icon(Icons.refresh),
                      tooltip: 'Обновить статус',
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'subscription.current_plan'.tr(),
                      style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                    ),
                    Text(
                      isPremium
                          ? 'subscription.premium'.tr()
                          : 'subscription.basic'.tr(),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                if (subscription?.expiresAt != null && isPremium) ...[
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'profile.expires_on'.tr(),
                        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                      ),
                      Text(
                        _formatDate(subscription!.expiresAt!),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 16),
                if (!isPremium) ...[
                  ElevatedButton(
                    onPressed: () => _showUpgradeDialog(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Colors.white,
                    ),
                    child: Text('profile.upgrade_to_premium'.tr()),
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () => _restorePurchases(),
                    child: Text('profile.restore_purchases'.tr()),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.green),
                    ),
                    child: Text(
                      'profile.active_subscription'.tr(),
                      style: const TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSettingsCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'settings.title'.tr(),
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.notifications),
              title: Text('crypto.notifications'.tr()),
              trailing: Switch(
                value: true,
                onChanged: (value) {
                  // TODO: Реализовать настройку уведомлений
                },
              ),
            ),
            ListTile(
              leading: const Icon(Icons.dark_mode),
              title: Text('crypto.dark_theme'.tr()),
              trailing: Switch(
                value: false,
                onChanged: (value) {
                  // TODO: Реализовать переключение темы
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoginScreen(AuthProvider authProvider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 40),

          // Логотип или иконка
          Icon(
            Icons.account_circle,
            size: 100,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(height: 32),

          // Заголовок
          Text(
            'profile.title'.tr(),
            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),

          // Описание
          Text(
            'crypto.sign_in_to_sync'.tr(),
            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),

          // Dev режим индикатор
          if (AppConfig.isDebugMode) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.orange),
              ),
              child: Text(
                '🔧 ' + 'common.dev'.tr() + ' режим',
                style: const TextStyle(
                  color: Colors.orange,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _runSubscriptionTest,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
              ),
              child: Text('Тест подписки'),
            ),
          ],
          const SizedBox(height: 32),

          // Карточка подписки для неавторизованных пользователей
          _buildGuestSubscriptionCard(),
          const SizedBox(height: 24),

          // Apple Sign-In кнопка
          FutureBuilder<bool>(
            future: SignInWithApple.isAvailable(),
            builder: (context, snapshot) {
              if (snapshot.hasData && snapshot.data == true) {
                return SizedBox(
                  width: double.infinity,
                  child: SignInWithAppleButton(
                    onPressed: () => _signInWithApple(authProvider),
                    style: SignInWithAppleButtonStyle.black,
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),

          const SizedBox(height: 16),

          // Кнопка восстановления покупок
          TextButton(
            onPressed: () => _restorePurchases(),
            child: Text('profile.restore_purchases'.tr()),
          ),

          const SizedBox(height: 24),

          // Дополнительная информация
          Text(
            'auth.secure_auth'.tr(),
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}';
  }

  Future<bool> _checkSubscriptionStatus() async {
    // Если статус уже кэширован и не идет проверка, возвращаем кэш
    if (_cachedSubscriptionStatus != null && !_isCheckingSubscription) {
      return _cachedSubscriptionStatus!;
    }

    setState(() {
      _isCheckingSubscription = true;
    });

    try {
      final isPremium = await SubscriptionService.isPremium();
      _cachedSubscriptionStatus = isPremium;
      print('🔧 Статус подписки: ${isPremium ? "Premium" : "Basic"}');
      return isPremium;
    } catch (e) {
      print('❌ Ошибка проверки статуса подписки: $e');
      return false;
    } finally {
      setState(() {
        _isCheckingSubscription = false;
      });
    }
  }

  // Обновление статуса подписки
  Future<void> _refreshSubscriptionStatus() async {
    setState(() {
      _isCheckingSubscription = true;
      _cachedSubscriptionStatus = null; // Сбрасываем кэш
    });

    try {
      // Принудительно обновляем статус из RevenueCat
      final isPremium = await SubscriptionService.refreshSubscriptionStatus();
      _cachedSubscriptionStatus = isPremium;

      // Обновляем статус в AuthProvider, если пользователь авторизован
      final authProvider = context.read<AuthProvider>();
      if (authProvider.isAuthenticated) {
        await authProvider.refreshSubscriptionStatus();
      }

      // Обновляем UI
      setState(() {});

      // Показываем уведомление об успешном обновлении
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Статус подписки обновлен'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      print('❌ Ошибка обновления статуса подписки: $e');

      // Показываем ошибку пользователю
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка обновления статуса: $e'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } finally {
      setState(() {
        _isCheckingSubscription = false;
      });
    }
  }

  Widget _buildGuestSubscriptionCard() {
    return FutureBuilder<bool>(
      future: _checkSubscriptionStatus(),
      builder: (context, snapshot) {
        final isPremium = snapshot.data ?? false;

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    if (_isCheckingSubscription)
                      const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    else
                      Icon(
                        isPremium ? Icons.star : Icons.star_border,
                        color: isPremium ? Colors.amber : Colors.grey,
                      ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'subscription.status'.tr(),
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: _refreshSubscriptionStatus,
                      icon: const Icon(Icons.refresh),
                      tooltip: 'Обновить статус',
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'subscription.current_plan'.tr(),
                      style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                    ),
                    Text(
                      isPremium
                          ? 'subscription.premium'.tr()
                          : 'subscription.basic'.tr(),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (!isPremium) ...[
                  ElevatedButton(
                    onPressed: () => _showUpgradeDialog(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Colors.white,
                    ),
                    child: Text('crypto.buy_subscription'.tr()),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'crypto.no_registration_required'.tr(),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                      fontStyle: FontStyle.italic,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.green),
                    ),
                    child: Text(
                      'profile.active_subscription'.tr(),
                      style: const TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'crypto.active_subscription_sync'.tr(),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                      fontStyle: FontStyle.italic,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _signInWithApple(AuthProvider authProvider) async {
    setState(() {
      _isSigningIn = true;
    });

    try {
      await authProvider.signInWithApple();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('auth.sign_in_error'.tr() + ': $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isSigningIn = false;
      });
    }
  }

  void _showUpgradeDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('crypto.upgrade_dialog_title'.tr()),
        content: Text('crypto.upgrade_dialog_content'.tr()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('common.cancel'.tr()),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _showSubscriptionOptions();
            },
            child: Text('crypto.upgrade'.tr()),
          ),
        ],
      ),
    );
  }

  Future<void> _showSubscriptionOptions() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const SubscriptionSelectionScreen(),
      ),
    );

    // Обновляем статус подписки после возврата с экрана покупки
    if (result == true) {
      _refreshSubscriptionStatus();
    }
  }

  Future<void> _purchaseSubscription(StoreProduct product) async {
    final authProvider = context.read<AuthProvider>();

    try {
      await authProvider.purchaseSubscription(product);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('subscription.success'.tr()),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('subscription.error'.tr() + ': $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _restorePurchases() async {
    final authProvider = context.read<AuthProvider>();

    try {
      await authProvider.restorePurchases();

      // Обновляем статус подписки после восстановления
      await _refreshSubscriptionStatus();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('subscription.restored'.tr()),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('subscription.restore_error'.tr() + ': $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Запуск теста подписки
  Future<void> _runSubscriptionTest() async {
    try {
      await SubscriptionTest.runFullTest();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Тест завершен. Проверьте консоль.'),
          backgroundColor: Colors.blue,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Ошибка теста: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
