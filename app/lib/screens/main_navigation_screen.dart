import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../utils/haptic_feedback.dart';
import '../services/analytics_service.dart';
import 'etf_tabs_screen.dart';
import 'fund_holdings_screen.dart';
import 'ethereum_etf_screen.dart';
import 'bitcoin_etf_screen.dart';
import 'settings_screen.dart';
import '../providers/etf_provider.dart';
import '../widgets/loading_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  late PageController _pageController;

  final List<Widget> _screens = [
    const ETFTabsScreen(),
    const BitcoinETFScreen(),
    const EthereumETFScreen(),
    const FundHoldingsScreen(),
    const SettingsScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  // Метод для вибрации при переключении страниц
  void _vibrateOnPageChange() {
    HapticUtils.lightImpact();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ETFProvider>(
      builder: (context, etfProvider, child) {
        // Отладочная информация
        debugPrint(
          'MainNavigationScreen: isInitializing: ${etfProvider.isInitializing}',
        );
        debugPrint(
          'MainNavigationScreen: isDataReady: ${etfProvider.isDataReady}',
        );
        debugPrint(
          'MainNavigationScreen: isEthereumLoaded: ${etfProvider.isEthereumLoaded}',
        );
        debugPrint(
          'MainNavigationScreen: isBitcoinLoaded: ${etfProvider.isBitcoinLoaded}',
        );
        debugPrint('MainNavigationScreen: error: ${etfProvider.error}');
        debugPrint(
          'MainNavigationScreen: ethereumData.length: ${etfProvider.ethereumData.length}',
        );
        debugPrint(
          'MainNavigationScreen: bitcoinData.length: ${etfProvider.bitcoinData.length}',
        );

        // Показываем экран загрузки во время инициализации
        if (etfProvider.isInitializing) {
          debugPrint('MainNavigationScreen: Показываем экран инициализации');
          return LoadingScreen(
            message: 'loading.initializing_app'.tr(),
            showProgress: true,
            showDetailedProgress: true,
          );
        }

        // Показываем экран загрузки если данные еще не готовы
        if (!etfProvider.isDataReady) {
          debugPrint(
            'MainNavigationScreen: Данные не готовы, показываем экран загрузки',
          );
          String loadingMessage = 'loading.loading_data'.tr();

          if (etfProvider.error != null) {
            debugPrint('MainNavigationScreen: Показываем экран ошибки');
            return LoadingScreen(
              message: 'loading.error_loading_data'.tr(),
              showProgress: false,
              error: etfProvider.error,
              showDetailedProgress: true,
              onRetry: () {
                etfProvider.resetLoadingState();
                etfProvider.initializeData();
              },
            );
          }

          // Показываем прогресс загрузки с детальной информацией
          if (etfProvider.isEthereumLoaded && !etfProvider.isBitcoinLoaded) {
            loadingMessage = 'loading.loading_bitcoin_etf'.tr();
          } else if (!etfProvider.isEthereumLoaded &&
              etfProvider.isBitcoinLoaded) {
            loadingMessage = 'loading.loading_ethereum_etf'.tr();
          } else if (!etfProvider.isEthereumLoaded &&
              !etfProvider.isBitcoinLoaded) {
            loadingMessage = 'loading.loading_etf'.tr();
          }

          debugPrint(
            'MainNavigationScreen: Показываем экран загрузки с сообщением: $loadingMessage',
          );
          return LoadingScreen(
            message: loadingMessage,
            showProgress: true,
            showDetailedProgress: true,
          );
        }

        // Основной интерфейс приложения - показываем только когда данные готовы
        debugPrint(
          'MainNavigationScreen: Данные готовы, показываем основной интерфейс',
        );
        return Consumer<ETFProvider>(
          builder: (context, etfProvider, child) {
            // Синхронизируем PageController с navigationTabIndex
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (_pageController.hasClients &&
                  _pageController.page?.round() !=
                      etfProvider.navigationTabIndex) {
                _pageController.jumpToPage(etfProvider.navigationTabIndex);
              }
            });

            return Scaffold(
              body: PageView(
                controller: _pageController,
                physics:
                    const NeverScrollableScrollPhysics(), // Отключаем свайп
                children: _screens,
              ),
              bottomNavigationBar: _buildCustomBottomNavigationBar(),
            );
          },
        );
      },
    );
  }

  // Кастомный BottomNavigationBar без анимаций
  Widget _buildCustomBottomNavigationBar() {
    return Consumer<ETFProvider>(
      builder: (context, etfProvider, child) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final items = [
          {
            'icon': Icons.trending_up,
            'label': 'navigation.etf_flows'.tr(),
            'type': 'icon',
          },
          {
            'icon': 'assets/bitcoin.png',
            'label': 'navigation.bitcoin_etf'.tr(),
            'type': 'image',
          },
          {
            'icon': 'assets/ethereum.png',
            'label': 'navigation.ethereum_etf'.tr(),
            'type': 'image',
          },
          {
            'icon': Icons.account_balance,
            'label': 'navigation.holdings'.tr(),
            'type': 'icon',
          },
          {
            'icon': Icons.settings,
            'label': 'settings.title'.tr(),
            'type': 'icon',
          },
        ];

        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1A1A1A) : Colors.white,
            border: Border(
              top: BorderSide(
                color: isDark ? Colors.grey[800]! : Colors.grey[300]!,
                width: 0.5,
              ),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: items.asMap().entries.map((entry) {
                  final index = entry.key;
                  final item = entry.value;
                  final isSelected = etfProvider.navigationTabIndex == index;

                  return Expanded(
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          // Добавляем вибрацию при переключении страниц
                          _vibrateOnPageChange();

                          // Логируем событие переключения страницы
                          final screenNames = [
                            'analytics.screen_names.etf_tabs'.tr(),
                            'analytics.screen_names.bitcoin_etf'.tr(),
                            'analytics.screen_names.ethereum_etf'.tr(),
                            'analytics.screen_names.fund_holdings'.tr(),
                            'analytics.screen_names.settings'.tr(),
                          ];
                          AnalyticsService.logButtonClick(
                            buttonName: 'navigation_tab',
                            screenName: 'main_navigation',
                            parameters: {
                              'tab_index': index,
                              'tab_name': screenNames[index],
                            },
                          );

                          // Обновляем индекс в Provider
                          etfProvider.switchNavigationTab(index);
                          // Переходим к странице без анимации
                          _pageController.jumpToPage(index);
                        },
                        splashColor: Colors.transparent,
                        highlightColor: Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            vertical: 8,
                            horizontal: 4,
                          ),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            color: isSelected
                                ? (isDark
                                      ? Colors.blue.withOpacity(0.2)
                                      : Colors.blue.withOpacity(0.1))
                                : Colors.transparent,
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (item['type'] == 'icon')
                                Icon(
                                  item['icon'] as IconData,
                                  color: isSelected
                                      ? (isDark
                                            ? Colors.blue[300]
                                            : Colors.blue[600])
                                      : (isDark
                                            ? Colors.grey[500]
                                            : Colors.grey[600]),
                                  size: 24,
                                )
                              else if (item['type'] == 'image')
                                Image.asset(
                                  item['icon'] as String,
                                  width: 24,
                                  height: 24,
                                  color: isSelected
                                      ? (isDark
                                            ? Colors.blue[300]
                                            : Colors.blue[600])
                                      : (isDark
                                            ? Colors.grey[500]
                                            : Colors.grey[600]),
                                ),
                              const SizedBox(height: 6),
                              Text(
                                item['label'] as String,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: isSelected
                                      ? (isDark
                                            ? Colors.blue[300]
                                            : Colors.blue[600])
                                      : (isDark
                                            ? Colors.grey[500]
                                            : Colors.grey[600]),
                                  fontWeight: isSelected
                                      ? FontWeight.w600
                                      : FontWeight.normal,
                                ),
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        );
      },
    );
  }
}
