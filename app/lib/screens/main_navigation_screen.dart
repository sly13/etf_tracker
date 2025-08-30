import 'package:flutter/material.dart';
import 'etf_tabs_screen.dart';
import 'etf_list_screen.dart';
import 'fund_holdings_screen.dart';
import '../config/app_config.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const ETFTabsScreen(),
    const FundHoldingsScreen(),
    const ETFListScreen(),
  ];

  @override
  Widget build(BuildContext context) {
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
            icon: Icon(Icons.account_balance),
            label: 'Владение',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.list), label: 'Портфель'),
        ],
      ),
    );
  }
}
