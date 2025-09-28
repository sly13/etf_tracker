import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/etf_provider.dart';
import '../models/etf_flow_data.dart';
import 'package:intl/intl.dart';
import '../widgets/pro_button.dart';
import '../utils/haptic_feedback.dart';
import '../services/screenshot_service.dart';

class ETFTabsScreen extends StatefulWidget {
  const ETFTabsScreen({super.key});

  @override
  State<ETFTabsScreen> createState() => _ETFTabsScreenState();
}

class _ETFTabsScreenState extends State<ETFTabsScreen> {
  DateTime? _lastManualRefresh;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // Data is loaded only during app initialization, not here
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  /// Создать скриншот с данными за последнюю доступную дату
  Future<void> _createScreenshot() async {
    // Создаем скриншот сразу без проверки подписки
    await ScreenshotService.createDailyETFScreenshot(context: context);
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
        automaticallyImplyLeading: false, // Скрываем кнопку "назад"
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
                    '${'common.error'.tr()}: ${etfProvider.error}',
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

          // Показываем индикатор загрузки во время обновления данных
          if (etfProvider.isLoading && etfProvider.isDataReady) {
            return Stack(
              children: [
                // Основной контент
                RefreshIndicator(
                  onRefresh: () async {
                    // Вибрация при начале обновления
                    HapticUtils.lightImpact();
                    try {
                      await etfProvider.forceRefreshAllData();
                      // Автоматически скроллим вниз после обновления
                      if (_scrollController.hasClients) {
                        _scrollController.animateTo(
                          _scrollController.position.maxScrollExtent,
                          duration: Duration(milliseconds: 500),
                          curve: Curves.easeOut,
                        );
                      }
                      // Вибрация при успешном обновлении
                      HapticUtils.notificationSuccess();
                    } catch (e) {
                      // Вибрация при ошибке
                      HapticUtils.notificationError();
                      rethrow;
                    }
                  },
                  color: Theme.of(context).colorScheme.primary,
                  backgroundColor:
                      Theme.of(context).brightness == Brightness.dark
                      ? const Color(0xFF1C1C1E)
                      : Colors.white,
                  strokeWidth: 2.5,
                  displacement: 40.0,
                  child: SingleChildScrollView(
                    controller: _scrollController,
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSummaryCard(etfProvider),
                        const SizedBox(height: 24),
                        _buildRecentUpdates(etfProvider),
                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
                // Индикатор загрузки поверх контента
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: SizedBox(
                    width: double.infinity,
                    height: 3,
                    child: AnimatedContainer(
                      duration: Duration(milliseconds: 300),
                      width: double.infinity,
                      height: 3,
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primary,
                        borderRadius: BorderRadius.circular(1.5),
                      ),
                    ),
                  ),
                ),
              ],
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              // Вибрация при начале обновления
              HapticUtils.lightImpact();

              try {
                await etfProvider.forceRefreshAllData();
                // Автоматически скроллим вниз после обновления
                if (_scrollController.hasClients) {
                  _scrollController.animateTo(
                    _scrollController.position.maxScrollExtent,
                    duration: Duration(milliseconds: 500),
                    curve: Curves.easeOut,
                  );
                }
                // Вибрация при успешном обновлении
                HapticUtils.notificationSuccess();
              } catch (e) {
                // Вибрация при ошибке
                HapticUtils.notificationError();
                rethrow;
              }
            },
            color: Theme.of(context).colorScheme.primary,
            backgroundColor: Theme.of(context).brightness == Brightness.dark
                ? const Color(0xFF1C1C1E)
                : Colors.white,
            strokeWidth: 2.5,
            displacement: 40.0,
            child: SingleChildScrollView(
              controller: _scrollController,
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Общая сводка
                  _buildSummaryCard(etfProvider),
                  const SizedBox(height: 24),

                  // Последние обновления
                  _buildRecentUpdates(etfProvider),

                  // Добавляем дополнительное пространство для лучшего UX при pull-to-refresh
                  const SizedBox(height: 100),
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
              '${'common.updated'.tr()}: ${DateFormat('dd.MM.yyyy HH:mm').format(DateTime.now())}',
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
    final absValue = value.abs();
    final prefix = value < 0 ? '\$-' : '\$';

    if (absValue >= 1000) {
      return '$prefix${(absValue / 1000).toStringAsFixed(1)}B';
    } else {
      return '$prefix${absValue.toStringAsFixed(1)}M';
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
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'etf.recent_updates'.tr(),
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                // Общая дата и время сразу под заголовком
                Text(
                  _getLatestDateTime(etfProvider),
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                ),
              ],
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
                    onPressed: () async {
                      // Тактильная обратная связь при нажатии
                      HapticUtils.lightImpact();
                      _lastManualRefresh = DateTime.now();

                      try {
                        await context.read<ETFProvider>().forceRefreshAllData();
                        // Успешное обновление
                        HapticUtils.notificationSuccess();
                      } catch (e) {
                        // Ошибка обновления
                        HapticUtils.notificationError();
                      }
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
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
              ),
              Row(
                children: [
                  Text(
                    '${total.toStringAsFixed(1)}M',
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

  // Получить последнюю дату и время обновления
  String _getLatestDateTime(ETFProvider etfProvider) {
    DateTime? latestDate;

    if (etfProvider.bitcoinData.isNotEmpty) {
      latestDate = DateTime.parse(etfProvider.bitcoinData.first.date);
    }

    if (etfProvider.ethereumData.isNotEmpty) {
      final ethDate = DateTime.parse(etfProvider.ethereumData.first.date);
      if (latestDate == null || ethDate.isAfter(latestDate)) {
        latestDate = ethDate;
      }
    }

    if (latestDate != null) {
      return DateFormat('dd.MM.yy').format(latestDate);
    }

    return '';
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
