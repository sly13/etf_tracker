import 'package:flutter/material.dart';
// duplicate removed
import 'package:easy_localization/easy_localization.dart';
import '../providers/etf_provider.dart';
import '../utils/haptic_feedback.dart';
import 'package:provider/provider.dart';
import '../providers/crypto_price_provider.dart';
import '../models/etf_flow_data.dart';
import '../components/flow_calendar.dart';
import '../utils/adaptive_text_utils.dart';
import '../services/screenshot_service.dart';

class ETFTabsScreen extends StatefulWidget {
  const ETFTabsScreen({super.key});

  @override
  State<ETFTabsScreen> createState() => _ETFTabsScreenState();
}

class _ETFTabsScreenState extends State<ETFTabsScreen> {
  // Убран функционал ручного обновления
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
      body: SafeArea(
        child: Consumer<ETFProvider>(
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
                      padding: AdaptiveTextUtils.getContentPadding(context),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildSummaryCard(etfProvider),
                          const SizedBox(height: 24),
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
                padding: AdaptiveTextUtils.getContentPadding(context),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Общая сводка
                    _buildSummaryCard(etfProvider),
                    const SizedBox(height: 24),
                    // Календарь суммарных потоков (BTC+ETH+SOL)
                    _buildCombinedCalendar(etfProvider),
                    // Добавляем дополнительное пространство для лучшего UX при pull-to-refresh
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  // Карточка с общей сводкой
  Widget _buildSummaryCard(ETFProvider etfProvider) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    // Ранее здесь отображалась сумма притоков; теперь не используется

    return Card(
      elevation: 4,
      child: Padding(
        padding: AdaptiveTextUtils.getCardPadding(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'etf.summary'.tr(),
                  style: AdaptiveTextUtils.createAdaptiveTextStyle(
                    context,
                    'headlineSmall',
                    fontWeight: FontWeight.bold,
                    customBaseSize: 18.0,
                  ),
                ),
                const Spacer(),
                // Кнопка скриншота
                IconButton(
                  icon: const Icon(Icons.camera_alt),
                  onPressed: () => _createScreenshot(),
                  tooltip: 'screenshot.tooltip'.tr(),
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Сводка по Bitcoin
            if (etfProvider.summaryData != null) ...[
              Builder(
                builder: (context) {
                  final btcPrice = context
                      .watch<CryptoPriceProvider?>()
                      ?.bitcoinPrice;
                  final subtitle = btcPrice != null
                      ? '\$${btcPrice.toStringAsFixed(2)}'
                      : 'etf.total_assets'.tr();
                  return _buildSummaryRow(
                    'etf.bitcoin'.tr(),
                    etfProvider.summaryData!['bitcoin']['totalAssets']
                            ?.toDouble() ??
                        0.0,
                    'assets/bitcoin.png',
                    Colors.orange,
                    subtitle,
                  );
                },
              ),
              const SizedBox(height: 16),
            ],

            // Сводка по Ethereum
            if (etfProvider.summaryData != null) ...[
              Builder(
                builder: (context) {
                  final ethPrice = context
                      .watch<CryptoPriceProvider?>()
                      ?.ethereumPrice;
                  final subtitle = ethPrice != null
                      ? '\$${ethPrice.toStringAsFixed(2)}'
                      : 'etf.total_assets'.tr();
                  return _buildSummaryRow(
                    'etf.ethereum'.tr(),
                    etfProvider.summaryData!['ethereum']['totalAssets']
                            ?.toDouble() ??
                        0.0,
                    'assets/ethereum.png',
                    Colors.blue,
                    subtitle,
                  );
                },
              ),
            ],

            // Сводка по Solana (показываем всегда, даже если пока 0)
            const SizedBox(height: 16),
            Builder(
              builder: (context) {
                final solPrice = context
                    .watch<CryptoPriceProvider?>()
                    ?.solanaPrice;
                final subtitle = solPrice != null
                    ? '\$${solPrice.toStringAsFixed(2)}'
                    : 'etf.total_assets'.tr();
                return _buildSummaryRow(
                  'Solana ETF',
                  (etfProvider.summaryData != null
                          ? (etfProvider.summaryData!['solana']?['totalAssets']
                                    ?.toDouble() ??
                                0.0)
                          : 0.0)
                      .toDouble(),
                  'assets/solana.png',
                  Colors.teal,
                  subtitle,
                );
              },
            ),

            const SizedBox(height: 16),
            Text(
              '${'common.updated'.tr()}: ${etfProvider.summaryData != null ? DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(etfProvider.summaryData!['overall']['lastUpdated'])) : DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now())}',
              style: TextStyle(
                color: isDark ? Colors.grey[400] : Colors.grey[600],
                fontSize: 12,
              ),
            ),

            // Убрали календарь из карточки summary
          ],
        ),
      ),
    );
  }

  // Старые методы расчета удалены - теперь используем данные напрямую из API

  // Функция для умного форматирования чисел
  String _formatLargeNumber(double value) {
    final absValue = value.abs();
    final prefix = value < 0 ? '\$-' : '\$';

    if (absValue >= 1000) {
      return '$prefix${(absValue / 1000).toStringAsFixed(2)}B';
    } else {
      return '$prefix${absValue.toStringAsFixed(2)}M';
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
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
      ],
    );
  }

  // Суммарный календарь (BTC + ETH + SOL)
  Widget _buildCombinedCalendar(ETFProvider etfProvider) {
    // Собираем по дате суммы и разложение по компаниям
    final Map<String, Map<String, double>> dateToCompanies = {};
    final Map<String, Map<String, Map<String, double>>> dateToCompaniesByAsset =
        {}; // date -> asset -> {company: amount}

    void accumulate(BaseETFFlowData e, String asset) {
      final date = e.date;
      dateToCompanies.putIfAbsent(date, () => {});
      final map = dateToCompanies[date]!;
      dateToCompaniesByAsset.putIfAbsent(date, () => {});
      dateToCompaniesByAsset[date]!.putIfAbsent(asset, () => {});
      final assetMap = dateToCompaniesByAsset[date]![asset]!;
      void add(String key, double? v) {
        if (v == null) return;
        map[key] = (map[key] ?? 0) + v;
        assetMap[key] = (assetMap[key] ?? 0) + v;
      }

      add('blackrock', e.blackrock);
      add('fidelity', e.fidelity);
      add('bitwise', e.bitwise);
      add('twentyOneShares', e.twentyOneShares);
      add('vanEck', e.vanEck);
      add('invesco', e.invesco);
      add('franklin', e.franklin);
      add('grayscale', e.grayscale);
      add('total', e.total);
    }

    for (final e in etfProvider.ethereumData) accumulate(e, 'ethereum');
    for (final b in etfProvider.bitcoinData) accumulate(b, 'bitcoin');
    for (final s in etfProvider.solanaData) accumulate(s, 'solana');

    final combined = dateToCompanies.entries.map((entry) {
      final date = entry.key;
      final companies = entry.value;
      final total = (companies['total'] ?? 0);
      // убираем служебный ключ total из компаний
      final companiesOnly = Map<String, double>.from(companies)
        ..remove('total');
      final byAsset = dateToCompaniesByAsset[date] ?? {};
      // Убираем возможные total в подкартах (на всякий случай)
      final cleanedByAsset = byAsset.map((asset, comp) {
        final c = Map<String, double>.from(comp)..remove('total');
        return MapEntry(asset, c);
      });
      return CombinedFlowData(
        date: date,
        companies: companiesOnly,
        companiesByAsset: cleanedByAsset,
        total: total,
      );
    }).toList()..sort((a, b) => b.date.compareTo(a.date));

    return Card(
      elevation: 4,
      margin: EdgeInsets.zero,
      color: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: FlowCalendar(flowData: combined, title: 'etf.flow_history'.tr()),
    );
  }

  // Блок последних обновлений удалён; теперь инфо отображается в Summary

  // Удалены вспомогательные блоки Recent Updates
}
