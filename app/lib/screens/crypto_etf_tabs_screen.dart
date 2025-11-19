import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'bitcoin_etf_screen.dart';
import 'ethereum_etf_screen.dart';
import 'solana_etf_screen.dart';
import '../providers/etf_provider.dart';

class CryptoETFTabsScreen extends StatefulWidget {
  const CryptoETFTabsScreen({super.key});

  @override
  State<CryptoETFTabsScreen> createState() => _CryptoETFTabsScreenState();
}

class _CryptoETFTabsScreenState extends State<CryptoETFTabsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    final etfProvider = Provider.of<ETFProvider>(context, listen: false);
    _tabController = TabController(
      length: 3,
      vsync: this,
      initialIndex: etfProvider.cryptoETFTabIndex,
    );
    _tabController.addListener(() {
      setState(() {}); // Обновляем состояние при изменении таба
      // Синхронизируем с провайдером
      final etfProvider = Provider.of<ETFProvider>(context, listen: false);
      if (_tabController.index != etfProvider.cryptoETFTabIndex) {
        etfProvider.switchCryptoETFTab(_tabController.index);
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final etfProvider = Provider.of<ETFProvider>(context);

    // Синхронизируем TabController с провайдером
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_tabController.index != etfProvider.cryptoETFTabIndex) {
        _tabController.animateTo(etfProvider.cryptoETFTabIndex);
      }
    });

    return Scaffold(
      body: Column(
        children: [
          // TabBar с выбором криптовалют
          Container(
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1A1A1A) : Colors.white,
              border: Border(
                bottom: BorderSide(
                  color: isDark ? Colors.grey[800]! : Colors.grey[300]!,
                  width: 0.5,
                ),
              ),
            ),
            child: SafeArea(
              bottom: false,
              child: AnimatedBuilder(
                animation: _tabController,
                builder: (context, child) {
                  return TabBar(
                    controller: _tabController,
                    indicatorColor: const Color(0xFFFF9500), // Оранжевый цвет индикатора
                    indicatorWeight: 2,
                    labelColor: const Color(0xFFFF9500), // Оранжевый для активного таба
                    unselectedLabelColor: isDark ? Colors.grey[500] : Colors.grey[600],
                    labelStyle: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                    unselectedLabelStyle: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.normal,
                    ),
                    padding: EdgeInsets.zero, // Убираем отступы
                    labelPadding: EdgeInsets.zero, // Убираем отступы у лейблов
                    isScrollable: false, // Табы занимают всю ширину равномерно
                    tabAlignment: TabAlignment.fill, // Табы заполняют всю ширину
                    tabs: [
                      _buildTab(
                        icon: 'assets/bitcoin.png',
                        label: 'BTC',
                        index: 0,
                        isDark: isDark,
                      ),
                      _buildTab(
                        icon: 'assets/ethereum.png',
                        label: 'ETH',
                        index: 1,
                        isDark: isDark,
                      ),
                      _buildTab(
                        icon: 'assets/solana.png',
                        label: 'SOL',
                        index: 2,
                        isDark: isDark,
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
          // Контент табов
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: const [
                BitcoinETFScreen(),
                EthereumETFScreen(),
                SolanaETFScreen(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab({
    required String icon,
    required String label,
    required int index,
    required bool isDark,
  }) {
    final isSelected = _tabController.index == index;
    final iconColor = isSelected
        ? const Color(0xFFFF9500)
        : (isDark ? Colors.grey[500]! : Colors.grey[600]!);

    return Tab(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            icon,
            width: 20,
            height: 20,
            color: iconColor,
          ),
          const SizedBox(width: 8),
          Text(label),
        ],
      ),
    );
  }
}

