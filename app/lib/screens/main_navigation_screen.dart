import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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

  final List<Widget> _screens = [
    const ETFTabsScreen(),
    const EthereumETFScreen(),
    const BitcoinETFScreen(),
    const FundHoldingsScreen(),
  ];

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
          body: IndexedStack(index: _currentIndex, children: _screens),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            type: BottomNavigationBarType.fixed,
            selectedItemColor: Theme.of(context).colorScheme.primary,
            unselectedItemColor: Colors.grey,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.trending_up),
                label: 'ETF Потоки',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.currency_exchange),
                label: 'Ethereum ETF',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.currency_bitcoin),
                label: 'Bitcoin ETF',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.account_balance),
                label: 'Владение',
              ),
            ],
          ),
        );
      },
    );
  }
}
