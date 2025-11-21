import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../utils/platform_utils.dart';

class AdaptiveNavigation extends StatelessWidget {
  final List<Widget> screens;
  final PageController pageController;
  final int currentIndex;
  final Function(int) onTap;

  const AdaptiveNavigation({
    super.key,
    required this.screens,
    required this.pageController,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    if (PlatformUtils.isMacOS) {
      return _buildMacOSLayout(context);
    } else {
      return _buildMobileLayout(context);
    }
  }

  Widget _buildMacOSLayout(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Боковая панель навигации для macOS
          Container(
            width: 250,
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              border: Border(
                right: BorderSide(
                  color: Theme.of(context).dividerColor,
                  width: 1,
                ),
              ),
            ),
            child: Column(
              children: [
                // Заголовок
                Container(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      Icon(
                        Icons.analytics,
                        color: Theme.of(context).primaryColor,
                        size: 24,
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Crypto ETF Flow',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const Divider(),
                // Навигационные элементы
                Expanded(
                  child: ListView(
                    children: [
                      _buildMacOSNavItem(
                        context,
                        icon: Icons.dashboard,
                        title: 'navigation.home'.tr(),
                        index: 0,
                      ),
                      _buildMacOSNavItem(
                        context,
                        icon: Icons.currency_bitcoin,
                        title: 'navigation.bitcoin_etf'.tr(),
                        index: 1,
                      ),
                      _buildMacOSNavItem(
                        context,
                        icon: Icons.currency_exchange,
                        title: 'navigation.ethereum_etf'.tr(),
                        index: 2,
                      ),
                      _buildMacOSNavItem(
                        context,
                        icon: Icons.account_balance,
                        title: 'navigation.holdings'.tr(),
                        index: 3,
                      ),
                      _buildMacOSNavItem(
                        context,
                        icon: Icons.settings,
                        title: 'navigation.settings'.tr(),
                        index: 4,
                      ),
                    ],
                  ),
                ),
                // Виджет кнопка
                Container(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const Divider(),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            // Логика добавления виджета
                            _showWidgetInstructions(context);
                          },
                          icon: const Icon(Icons.widgets),
                          label: Text('widget.add'.tr()),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).primaryColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Основной контент
          Expanded(
            child: PageView(controller: pageController, children: screens),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return Scaffold(
      body: PageView(controller: pageController, children: screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).primaryColor,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'navigation.home'.tr(),
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.currency_bitcoin),
            label: 'navigation.bitcoin_etf'.tr(),
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.currency_exchange),
            label: 'navigation.ethereum_etf'.tr(),
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance),
            label: 'navigation.holdings'.tr(),
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'navigation.settings'.tr(),
          ),
        ],
      ),
    );
  }

  Widget _buildMacOSNavItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required int index,
  }) {
    final isSelected = currentIndex == index;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      child: ListTile(
        leading: Icon(
          icon,
          color: isSelected
              ? Theme.of(context).primaryColor
              : Theme.of(context).iconTheme.color,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected
                ? Theme.of(context).primaryColor
                : Theme.of(context).textTheme.bodyLarge?.color,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
        selected: isSelected,
        onTap: () => onTap(index),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        selectedTileColor: Theme.of(context).primaryColor.withOpacity(0.1),
      ),
    );
  }

  void _showWidgetInstructions(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('widget.add'.tr()),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('widget.instructions.intro'.tr()),
            const SizedBox(height: 16),
            Text('widget.instructions.step1'.tr()),
            Text('widget.instructions.step2'.tr()),
            Text('widget.instructions.step3'.tr()),
            Text('widget.instructions.step4'.tr()),
            Text('widget.instructions.step5'.tr()),
            const SizedBox(height: 16),
            Text('widget.instructions.alternative'.tr()),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('common.ok'.tr()),
          ),
        ],
      ),
    );
  }
}
