import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:vibration/vibration.dart';
import 'package:easy_localization/easy_localization.dart';
import 'etf_tabs_screen.dart';
import 'fund_holdings_screen.dart';
import 'ethereum_etf_screen.dart';
import 'bitcoin_etf_screen.dart';
import 'profile_screen.dart';
import '../providers/etf_provider.dart';
import '../widgets/loading_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  late PageController _pageController;

  final List<Widget> _screens = [
    const ETFTabsScreen(),
    const EthereumETFScreen(),
    const BitcoinETFScreen(),
    const FundHoldingsScreen(),
    const ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _currentIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  // Метод для вибрации при переключении страниц
  void _vibrateOnPageChange() async {
    try {
      if (await Vibration.hasVibrator() ?? false) {
        Vibration.vibrate(duration: 15); // Очень короткая вибрация
      }
    } catch (e) {
      // Игнорируем ошибки вибрации
      debugPrint('Ошибка вибрации: $e');
    }
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
          return const LoadingScreen(
            message: 'Инициализация приложения...',
            showProgress: true,
            showDetailedProgress: true,
          );
        }

        // Показываем экран загрузки если данные еще не готовы
        if (!etfProvider.isDataReady) {
          debugPrint(
            'MainNavigationScreen: Данные не готовы, показываем экран загрузки',
          );
          String loadingMessage = 'Загрузка данных...';

          if (etfProvider.error != null) {
            debugPrint('MainNavigationScreen: Показываем экран ошибки');
            return LoadingScreen(
              message: 'Ошибка загрузки данных',
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
            loadingMessage = 'Загрузка данных Bitcoin ETF...';
          } else if (!etfProvider.isEthereumLoaded &&
              etfProvider.isBitcoinLoaded) {
            loadingMessage = 'Загрузка данных Ethereum ETF...';
          } else if (!etfProvider.isEthereumLoaded &&
              !etfProvider.isBitcoinLoaded) {
            loadingMessage = 'Загрузка данных ETF...';
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
        return Scaffold(
          body: PageView(
            controller: _pageController,
            physics: const NeverScrollableScrollPhysics(), // Отключаем свайп
            children: _screens,
          ),
          bottomNavigationBar: _buildCustomBottomNavigationBar(),
        );
      },
    );
  }

  // Кастомный BottomNavigationBar без анимаций
  Widget _buildCustomBottomNavigationBar() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final items = [
      {'icon': Icons.trending_up, 'label': 'navigation.etf_flows'.tr()},
      {
        'icon': Icons.currency_exchange,
        'label': 'navigation.ethereum_etf'.tr(),
      },
      {'icon': Icons.currency_bitcoin, 'label': 'navigation.bitcoin_etf'.tr()},
      {'icon': Icons.account_balance, 'label': 'navigation.holdings'.tr()},
      {'icon': Icons.person, 'label': 'navigation.profile'.tr()},
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
              final isSelected = _currentIndex == index;

              return Expanded(
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      // Добавляем вибрацию при переключении страниц
                      _vibrateOnPageChange();
                      setState(() {
                        _currentIndex = index;
                      });
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
                          Icon(
                            item['icon'] as IconData,
                            color: isSelected
                                ? (isDark ? Colors.blue[300] : Colors.blue[600])
                                : (isDark
                                      ? Colors.grey[500]
                                      : Colors.grey[600]),
                            size: 24,
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
  }
}
