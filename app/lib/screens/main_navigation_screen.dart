import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../utils/haptic_feedback.dart';
import '../services/analytics_service.dart';
import 'etf_tabs_screen.dart';
import 'fund_holdings_screen.dart';
import 'settings_screen.dart';
import 'crypto_etf_tabs_screen.dart';
import '../providers/etf_provider.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  late PageController _pageController;

  final List<Widget> _screens = [
    const ETFTabsScreen(),
    const CryptoETFTabsScreen(), // Новая страница с табами BTC/ETH/SOL
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
        // Показываем основной интерфейс сразу, загрузка данных происходит в фоне
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
            'icon': Icons.account_balance_wallet,
            'label': 'Crypto ETF',
            'type': 'icon',
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

        // Цвета для активного и неактивного состояния
        final activeColor = const Color(0xFFFF9500); // Оранжевый цвет как на скриншоте
        final inactiveColor = isDark ? Colors.grey[500]! : Colors.grey[600]!;

        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1A1A1A) : Colors.white,
            border: Border(
              top: BorderSide(
                color: isDark ? Colors.grey[800]! : Colors.grey[300]!,
                width: 0.5,
              ),
            ),
            // Убираем тени для плоского дизайна
          ),
          child: SafeArea(
            top: false,
            bottom: true,
            child: Padding(
              padding: const EdgeInsets.only(
                left: 12,
                right: 12,
                top: 8,
                bottom: 4, // Уменьшен нижний отступ
              ),
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
                          _vibrateOnPageChange();

                          final screenNames = [
                            'analytics.screen_names.etf_tabs'.tr(),
                            'Crypto ETF',
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

                          etfProvider.switchNavigationTab(index);
                          _pageController.jumpToPage(index);
                        },
                        splashColor: Colors.transparent,
                        highlightColor: Colors.transparent,
                        child: Container(
                          padding: const EdgeInsets.only(
                            top: 8,
                            bottom: 4, // Уменьшен нижний отступ у элементов
                            left: 4,
                            right: 4,
                          ),
                          // Убираем фон у активного элемента - только цвет иконки и текста
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (item['type'] == 'icon')
                                Icon(
                                  item['icon'] as IconData,
                                  color: isSelected ? activeColor : inactiveColor,
                                  size: 24,
                                )
                              else if (item['type'] == 'image')
                                Image.asset(
                                  item['icon'] as String,
                                  width: 24,
                                  height: 24,
                                  color: isSelected ? activeColor : inactiveColor,
                                ),
                              const SizedBox(height: 6),
                              Text(
                                item['label'] as String,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: isSelected ? activeColor : inactiveColor,
                                  fontWeight: FontWeight.normal,
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
