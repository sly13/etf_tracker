import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/etf_provider.dart';
import '../providers/crypto_price_provider.dart';
import '../config/app_config.dart';
import '../widgets/crypto_price_widget.dart';
import '../models/etf_flow_data.dart';
import 'settings_screen.dart';
import 'subscription_selection_screen.dart';
import 'package:intl/intl.dart';
import '../widgets/pro_button.dart';
import '../widgets/subscription_status_widget.dart';
import '../services/screenshot_service.dart';

class ETFTabsScreen extends StatefulWidget {
  const ETFTabsScreen({super.key});

  @override
  State<ETFTabsScreen> createState() => _ETFTabsScreenState();
}

class _ETFTabsScreenState extends State<ETFTabsScreen> {
  DateTime? _lastManualRefresh;

  @override
  void initState() {
    super.initState();
    // Data is loaded only during app initialization, not here
  }

  /// Создать скриншот с данными за последнюю доступную дату
  Future<void> _createScreenshot() async {
    _showScreenshotDialog();
  }

  /// Показать диалог с объяснением функции скриншота
  void _showScreenshotDialog() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: isDark ? const Color(0xFF1C1C1E) : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Icon(Icons.camera_alt, color: Colors.blue, size: 24),
              const SizedBox(width: 12),
              Text(
                'screenshot.title'.tr(),
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'screenshot.premium_feature'.tr(),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'screenshot.description'.tr(),
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.grey[300] : Colors.grey[600],
                ),
              ),
              const SizedBox(height: 12),
              _buildFeatureItem(
                'screenshot.feature_visualization'.tr(),
                isDark,
              ),
              _buildFeatureItem('screenshot.feature_charts'.tr(), isDark),
              _buildFeatureItem('screenshot.feature_design'.tr(), isDark),
              _buildFeatureItem('screenshot.feature_ready'.tr(), isDark),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Colors.blue.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(Icons.star, color: Colors.blue, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'screenshot.premium_available'.tr(),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.blue,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'common.cancel'.tr(),
                style: TextStyle(
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const SubscriptionSelectionScreen(),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text('premium.unlock'.tr()),
            ),
          ],
        );
      },
    );
  }

  /// Создать элемент списка функций
  Widget _buildFeatureItem(String text, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.grey[300] : Colors.grey[600],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('app.title'.tr()),
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? const Color(0xFF0A0A0A)
            : Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          // Кнопка Pro
          const ProButton(),
        ],
      ),
      body: Consumer<ETFProvider>(
        builder: (context, etfProvider, child) {
          // Показываем ошибку только если она есть
          if (etfProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'common.error'.tr() + ': ${etfProvider.error}',
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      etfProvider.clearError();
                      etfProvider.forceRefreshAllData();
                    },
                    child: Text('common.retry'.tr()),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => etfProvider.forceRefreshAllData(),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Общая сводка
                  _buildSummaryCard(etfProvider),
                  const SizedBox(height: 16),

                  // Цены криптовалют (компактный вид)
                  const CompactCryptoPriceWidget(),
                  const SizedBox(height: 24),

                  // Последние обновления
                  _buildRecentUpdates(etfProvider),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // Карточка с общей сводкой
  Widget _buildSummaryCard(ETFProvider etfProvider) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final ethereumData = etfProvider.ethereumData.isNotEmpty
        ? etfProvider.ethereumData.first
        : null;
    final bitcoinData = etfProvider.bitcoinData.isNotEmpty
        ? etfProvider.bitcoinData.first
        : null;

    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.analytics,
                  color: Theme.of(context).colorScheme.primary,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Text(
                  'etf.summary'.tr(),
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Сводка по Bitcoin
            if (bitcoinData != null) ...[
              _buildSummaryRow(
                'etf.bitcoin'.tr(),
                _calculateTotalAssetsBTC(etfProvider.bitcoinData),
                'assets/bitcoin.png',
                Colors.orange,
                'etf.total_assets'.tr(),
              ),
              const SizedBox(height: 16),
            ],

            // Сводка по Ethereum
            if (ethereumData != null) ...[
              _buildSummaryRow(
                'etf.ethereum'.tr(),
                _calculateTotalAssets(etfProvider.ethereumData),
                'assets/ethereum.png',
                Colors.blue,
                'etf.total_assets'.tr(),
              ),
            ],

            const SizedBox(height: 16),
            Text(
              'common.updated'.tr() +
                  ': ${DateFormat('dd.MM.yyyy HH:mm').format(DateTime.now())}',
              style: TextStyle(
                color: isDark ? Colors.grey[400] : Colors.grey[600],
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Функция для расчета общей суммы активов
  double _calculateTotalAssets(List<ETFFlowData> data) {
    double total = 0.0;

    for (final item in data) {
      // Используем total из базы данных вместо суммирования компаний
      if (item.total != null) {
        total += item.total!;
      }
    }

    print('=== Общая сводка ETH: $total ===');
    return total;
  }

  // Функция для расчета общей суммы активов Bitcoin
  double _calculateTotalAssetsBTC(List<BTCFlowData> data) {
    double total = 0.0;

    for (final item in data) {
      // Используем total из базы данных вместо суммирования компаний
      if (item.total != null) {
        total += item.total!;
      }
    }

    print('=== Общая сводка BTC: $total ===');
    return total;
  }

  // Функция для умного форматирования чисел
  String _formatLargeNumber(double value) {
    if (value >= 1000) {
      return '\$${(value / 1000).toStringAsFixed(1)}B';
    } else {
      return '\$${value.toStringAsFixed(1)}M';
    }
  }

  // Строка сводки
  Widget _buildSummaryRow(
    String title,
    double value,
    String imageAsset,
    Color color,
    String subtitle,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Делаем Ethereum темнее
    final adjustedColor = title.contains('Ethereum')
        ? (isDark ? Colors.blue.shade700 : Colors.blue.shade600)
        : color;

    return Row(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: adjustedColor.withOpacity(isDark ? 0.2 : 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Image.asset(
                imageAsset,
                width: 32,
                height: 32,
                color: adjustedColor,
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
        Text(
          _formatLargeNumber(value),
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: adjustedColor,
          ),
        ),
      ],
    );
  }

  // Последние обновления
  Widget _buildRecentUpdates(ETFProvider etfProvider) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'etf.recent_updates'.tr(),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            Row(
              children: [
                // Кнопка скриншота
                IconButton(
                  icon: const Icon(Icons.camera_alt),
                  onPressed: () => _createScreenshot(),
                  tooltip: 'screenshot.tooltip'.tr(),
                  color: isDark ? Colors.white : Colors.black87,
                ),
                // Кнопка обновления (показывается только если прошло больше часа)
                if (_shouldShowRefreshButton(etfProvider))
                  IconButton(
                    icon: const Icon(Icons.refresh),
                    onPressed: () {
                      _lastManualRefresh = DateTime.now();
                      context.read<ETFProvider>().forceRefreshAllData();
                    },
                    tooltip: 'etf.refresh'.tr(),
                    color: isDark ? Colors.white : Colors.black87,
                  ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),

        if (etfProvider.bitcoinData.isNotEmpty)
          _buildUpdateCard(
            'etf.bitcoin'.tr(),
            etfProvider.bitcoinData.first.date,
            etfProvider.bitcoinData.first.total ?? 0,
            Colors.orange,
          ),

        if (etfProvider.ethereumData.isNotEmpty) ...[
          const SizedBox(height: 12),
          _buildUpdateCard(
            'etf.ethereum'.tr(),
            etfProvider.ethereumData.first.date,
            etfProvider.ethereumData.first.total ?? 0,
            Colors.blue,
          ),
        ],
      ],
    );
  }

  // Карточка обновления
  Widget _buildUpdateCard(
    String title,
    String date,
    double total,
    Color color,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Делаем Ethereum темнее
    final adjustedColor = title.contains('Ethereum')
        ? (isDark ? Colors.blue.shade700 : Colors.blue.shade600)
        : color;

    // Определяем индекс таба для навигации
    int? targetTabIndex;
    if (title.contains('Bitcoin')) {
      targetTabIndex = 1; // Bitcoin ETF таб
    } else if (title.contains('Ethereum')) {
      targetTabIndex = 2; // Ethereum ETF таб
    }

    return Card(
      elevation: 2,
      child: InkWell(
        onTap: targetTabIndex != null
            ? () {
                // Переключаем таб через Provider
                context.read<ETFProvider>().switchNavigationTab(
                  targetTabIndex!,
                );
              }
            : null,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 8,
                height: 40,
                decoration: BoxDecoration(
                  color: adjustedColor,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                    Text(
                      'common.updated'.tr() +
                          ': ${DateFormat('dd.MM.yyyy').format(DateTime.parse(date))}',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  Text(
                    '\$${total.toStringAsFixed(1)}M',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: adjustedColor,
                    ),
                  ),
                  if (targetTabIndex != null) ...[
                    const SizedBox(width: 8),
                    Icon(
                      Icons.arrow_forward_ios,
                      size: 16,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Проверяем, нужно ли показывать кнопку обновления
  bool _shouldShowRefreshButton(ETFProvider etfProvider) {
    // Если данные еще не загружены, не показываем кнопку
    if (etfProvider.ethereumData.isEmpty && etfProvider.bitcoinData.isEmpty) {
      return false;
    }

    // Если было ручное обновление менее часа назад, не показываем кнопку
    if (_lastManualRefresh != null) {
      final now = DateTime.now();
      final timeSinceManualRefresh = now.difference(_lastManualRefresh!);
      if (timeSinceManualRefresh.inHours < 1) {
        return false;
      }
    }

    // Используем время последнего обновления из провайдера
    final lastDataUpdate = etfProvider.lastDataUpdate;
    if (lastDataUpdate == null) {
      return false;
    }

    // Проверяем, прошло ли больше часа с последнего обновления данных
    final now = DateTime.now();
    final difference = now.difference(lastDataUpdate);

    return difference.inHours >= 1;
  }
}
