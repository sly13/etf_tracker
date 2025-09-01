import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:vibration/vibration.dart';
import 'etf_tabs_screen.dart';
import 'fund_holdings_screen.dart';
import 'ethereum_etf_screen.dart';
import 'bitcoin_etf_screen.dart';
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
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(duration: 50);
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
    final items = [
      {'icon': Icons.trending_up, 'label': 'ETF Потоки'},
      {'icon': Icons.currency_exchange, 'label': 'Ethereum ETF'},
      {'icon': Icons.currency_bitcoin, 'label': 'Bitcoin ETF'},
      {'icon': Icons.account_balance, 'label': 'Владение'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            item['icon'] as IconData,
                            color: isSelected
                                ? Theme.of(context).colorScheme.primary
                                : Colors.grey,
                            size: 24,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item['label'] as String,
                            style: TextStyle(
                              fontSize: 12,
                              color: isSelected
                                  ? Theme.of(context).colorScheme.primary
                                  : Colors.grey,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                            ),
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
