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
import '../utils/card_style_utils.dart';
import '../widgets/today_flows_panel.dart';
import '../widgets/cefi_index_widget.dart';

class ETFTabsScreen extends StatefulWidget {
  const ETFTabsScreen({super.key});

  @override
  State<ETFTabsScreen> createState() => _ETFTabsScreenState();
}

class _ETFTabsScreenState extends State<ETFTabsScreen> {
  // Убран функционал ручного обновления
  final ScrollController _scrollController = ScrollController();
  final GlobalKey<TodayFlowsPanelState> _todayFlowsPanelKey =
      GlobalKey<TodayFlowsPanelState>();

  // Создаем виджет один раз, чтобы он не пересоздавался
  late final TodayFlowsPanel _todayFlowsPanel;

  @override
  void initState() {
    super.initState();
    // Создаем виджет один раз при инициализации
    _todayFlowsPanel = TodayFlowsPanel(key: _todayFlowsPanelKey);
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

  // Создаем контент с данными провайдера
  Widget _buildContentWithData(ETFProvider etfProvider) {
    return SingleChildScrollView(
      key: const ValueKey('main_scroll_view'),
      controller: _scrollController,
      physics: const AlwaysScrollableScrollPhysics(),
      padding: EdgeInsets.only(
        left: AdaptiveTextUtils.getContentPadding(context).left,
        right: AdaptiveTextUtils.getContentPadding(context).right,
        top: AdaptiveTextUtils.getContentPadding(context).top,
      ),
      child: Column(
        key: const ValueKey('main_content_column'),
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Общая сводка
          RepaintBoundary(
            key: const ValueKey('summary_card_repaint'),
            child: KeyedSubtree(
              key: const ValueKey('summary_card'),
              child: _buildSummaryCard(etfProvider),
            ),
          ),
          const SizedBox(height: 24),
          // CEFI Индексы
          RepaintBoundary(
            key: const ValueKey('cefi_index_widget_repaint'),
            child: KeyedSubtree(
              key: const ValueKey('cefi_index_widget'),
              child: const CEFIIndexWidget(),
            ),
          ),
          const SizedBox(height: 24),
          // Панель притоков за сегодня - используем статический виджет
          RepaintBoundary(
            key: const ValueKey('today_flows_panel_repaint'),
            child: KeyedSubtree(
              key: const ValueKey('today_flows_panel_wrapper'),
              child: _todayFlowsPanel,
            ),
          ),
          const SizedBox(height: 24),
          // Календарь суммарных потоков (BTC+ETH+SOL)
          RepaintBoundary(
            key: const ValueKey('combined_calendar_repaint'),
            child: KeyedSubtree(
              key: const ValueKey('combined_calendar'),
              child: _buildCombinedCalendar(etfProvider),
            ),
          ),
          const SizedBox(height: 16), // Небольшой отступ снизу
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<ETFProvider>(
          builder: (context, etfProvider, staticChild) {
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
                        // Обновляем все данные параллельно
                        await Future.wait([
                          etfProvider.forceRefreshAllData(),
                          // Обновляем панель сегодняшних потоков
                          _todayFlowsPanelKey.currentState?.refresh() ??
                              Future.value(),
                        ]);
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
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.grey[400]!
                        : Colors.grey[600]!,
                    backgroundColor:
                        Theme.of(context).brightness == Brightness.dark
                        ? const Color(0xFF1C1C1E)
                        : Colors.white,
                    strokeWidth: 1.5,
                    displacement: 20.0,
                    triggerMode: RefreshIndicatorTriggerMode.onEdge,
                    child: _buildContentWithData(etfProvider),
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
                          color: Theme.of(context).brightness == Brightness.dark
                              ? Colors.grey[400]!
                              : Colors.grey[600]!,
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
                  // Обновляем все данные параллельно
                  await Future.wait([
                    etfProvider.forceRefreshAllData(),
                    // Обновляем панель сегодняшних потоков
                    _todayFlowsPanelKey.currentState?.refresh() ??
                        Future.value(),
                  ]);
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
              color: Theme.of(context).brightness == Brightness.dark
                  ? Colors.grey[400]!
                  : Colors.grey[600]!,
              backgroundColor: Theme.of(context).brightness == Brightness.dark
                  ? const Color(0xFF1C1C1E)
                  : Colors.white,
              strokeWidth: 1.5,
              displacement: 20.0,
              triggerMode: RefreshIndicatorTriggerMode.onEdge,
              child: _buildContentWithData(etfProvider),
            );
          },
        ),
      ),
    );
  }

  // Карточка с общей сводкой
  Widget _buildSummaryCard(ETFProvider etfProvider) {
    // Используем данные из переданного провайдера
    final isSummaryLoaded = etfProvider.isSummaryLoaded;
    final summaryData = etfProvider.summaryData;
    // Показываем скелетоны при обновлении (когда isLoading и данные уже загружены)
    final isLoading = etfProvider.isLoading && etfProvider.isDataReady;
    final shouldShowSkeleton = !isSummaryLoaded || isLoading;

    return Container(
      key: const ValueKey('summary_card_container'),
      decoration: CardStyleUtils.getCardDecoration(context),
      child: Padding(
        padding: CardStyleUtils.getCardPadding(context),
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
                  ).copyWith(color: CardStyleUtils.getTitleColor(context)),
                ),
                const Spacer(),
                // Кнопка скриншота с темным фоном
                GestureDetector(
                  onTap: () => _createScreenshot(),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Theme.of(context).brightness == Brightness.dark
                          ? Colors.grey[800]
                          : Colors.grey[300],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.camera_alt,
                      color: Theme.of(context).brightness == Brightness.dark
                          ? Colors.white
                          : Colors.grey[800]!,
                      size: 16,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            // Дата - показываем скелетон если данные не загружены или идет обновление
            !shouldShowSkeleton && summaryData != null
                ? Text(
                    DateFormat('yyyy-MM-dd HH:mm').format(
                      DateTime.parse(summaryData['overall']['lastUpdated']),
                    ),
                    style: TextStyle(
                      color: CardStyleUtils.getSubtitleColor(context),
                      fontSize: 12,
                      height: 1.3,
                    ),
                  )
                : Container(
                    width: 120,
                    height: 12,
                    decoration: BoxDecoration(
                      color: CardStyleUtils.getSubtitleColor(
                        context,
                      ).withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
            SizedBox(height: CardStyleUtils.getSpacing(context) + 4),

            // Сводка по Bitcoin
            Builder(
              key: const ValueKey('bitcoin_summary_row'),
              builder: (context) {
                final btcPrice = context
                    .watch<CryptoPriceProvider?>()
                    ?.bitcoinPrice;
                final subtitle = btcPrice != null
                    ? '\$${btcPrice.toStringAsFixed(2)}'
                    : 'etf.total_assets'.tr();
                return _buildSummaryRow(
                  'etf.bitcoin'.tr(),
                  !shouldShowSkeleton && summaryData != null
                      ? (summaryData['bitcoin']?['totalAssets']?.toDouble() ??
                                0.0)
                            .toDouble()
                      : 0.0,
                  'assets/bitcoin.png',
                  Colors.orange,
                  subtitle,
                  !shouldShowSkeleton && summaryData != null
                      ? (summaryData['bitcoin']?['currentFlow']?.toDouble() ??
                            0.0)
                      : 0.0,
                  isLoading: shouldShowSkeleton,
                );
              },
            ),
            const SizedBox(height: 8),

            // Сводка по Ethereum
            Builder(
              key: const ValueKey('ethereum_summary_row'),
              builder: (context) {
                final ethPrice = context
                    .watch<CryptoPriceProvider?>()
                    ?.ethereumPrice;
                final subtitle = ethPrice != null
                    ? '\$${ethPrice.toStringAsFixed(2)}'
                    : 'etf.total_assets'.tr();
                return _buildSummaryRow(
                  'etf.ethereum'.tr(),
                  !shouldShowSkeleton && summaryData != null
                      ? (summaryData['ethereum']?['totalAssets']?.toDouble() ??
                                0.0)
                            .toDouble()
                      : 0.0,
                  'assets/ethereum.png',
                  Colors.blue,
                  subtitle,
                  !shouldShowSkeleton && summaryData != null
                      ? (summaryData['ethereum']?['currentFlow']?.toDouble() ??
                            0.0)
                      : 0.0,
                  isLoading: shouldShowSkeleton,
                );
              },
            ),
            const SizedBox(height: 8),

            // Сводка по Solana
            Builder(
              key: const ValueKey('solana_summary_row'),
              builder: (context) {
                final solPrice = context
                    .watch<CryptoPriceProvider?>()
                    ?.solanaPrice;
                final subtitle = solPrice != null
                    ? '\$${solPrice.toStringAsFixed(2)}'
                    : 'etf.total_assets'.tr();
                return _buildSummaryRow(
                  'Solana ETF',
                  !shouldShowSkeleton && summaryData != null
                      ? (summaryData['solana']?['totalAssets']?.toDouble() ??
                                0.0)
                            .toDouble()
                      : 0.0,
                  'assets/solana.png',
                  Colors.teal,
                  subtitle,
                  !shouldShowSkeleton && summaryData != null
                      ? (summaryData['solana']?['currentFlow']?.toDouble() ??
                            0.0)
                      : 0.0,
                  isLoading: shouldShowSkeleton,
                );
              },
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

  // Функция для форматирования притоков/оттоков (без знака доллара)
  String _formatFlow(double value) {
    final absValue = value.abs();
    final sign = value >= 0 ? '+' : '-';

    if (absValue >= 1000) {
      return '$sign${(absValue / 1000).toStringAsFixed(2)}B';
    } else {
      return '$sign${absValue.toStringAsFixed(2)}M';
    }
  }

  // Строка сводки
  Widget _buildSummaryRow(
    String title,
    double value,
    String imageAsset,
    Color color,
    String subtitle,
    double currentFlow, {
    bool isLoading = false,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Улучшенные цвета для положительных/отрицательных изменений
    final flowColor = currentFlow >= 0
        ? (isDark ? Colors.green.shade400 : Colors.green.shade600)
        : (isDark ? Colors.red.shade400 : Colors.red.shade600);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: CardStyleUtils.getDividerColor(context),
              width: 1,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(6),
              child: Image.asset(
                imageAsset,
                fit: BoxFit.fitHeight,
                alignment: Alignment.center,
                cacheWidth: 56,
                cacheHeight: 56,
              ),
            ),
          ),
        ),
        SizedBox(width: CardStyleUtils.getSpacing(context)),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: CardStyleUtils.getTitleColor(context),
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 12,
                  color: CardStyleUtils.getSubtitleColor(context),
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
        // Блок с ценой - показываем скелетоны для чисел если загрузка
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            isLoading
                ? Container(
                    width: 70,
                    height: 18,
                    decoration: BoxDecoration(
                      color: CardStyleUtils.getSubtitleColor(
                        context,
                      ).withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  )
                : Text(
                    _formatLargeNumber(value),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: CardStyleUtils.getTitleColor(context),
                      height: 1.2,
                      letterSpacing: -0.5,
                    ),
                  ),
            const SizedBox(height: 6),
            isLoading
                ? Container(
                    width: 60,
                    height: 14,
                    decoration: BoxDecoration(
                      color: CardStyleUtils.getSubtitleColor(
                        context,
                      ).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  )
                : Text(
                    _formatFlow(currentFlow),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: flowColor,
                      height: 1.2,
                      letterSpacing: -0.2,
                    ),
                  ),
          ],
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
      // Не добавляем total из базы, будем пересчитывать как сумму фондов
    }

    for (final e in etfProvider.ethereumData) accumulate(e, 'ethereum');
    for (final b in etfProvider.bitcoinData) accumulate(b, 'bitcoin');
    for (final s in etfProvider.solanaData) accumulate(s, 'solana');

    final combined = dateToCompanies.entries.map((entry) {
      final date = entry.key;
      final companies = entry.value;
      // Пересчитываем total как сумму всех фондов (исключая служебный ключ 'total')
      final total = companies.entries
          .where((e) => e.key != 'total')
          .fold<double>(0, (sum, e) => sum + e.value);
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

    return Container(
      key: const ValueKey('combined_calendar_container'),
      decoration: CardStyleUtils.getCardDecoration(context),
      child: FlowCalendar(
        key: const ValueKey('flow_calendar'),
        flowData: combined,
        title: 'etf.flow_history'.tr(),
      ),
    );
  }

  // Блок последних обновлений удалён; теперь инфо отображается в Summary

  // Удалены вспомогательные блоки Recent Updates
}
