import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_gauges/gauges.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import '../models/cefi_index.dart';
import '../services/etf_service.dart';
import '../services/local_storage_service.dart';
import '../providers/etf_provider.dart';
import '../utils/card_style_utils.dart';
import '../utils/adaptive_text_utils.dart';
import '../widgets/universal_cefi_index_card.dart';

class CEFIIndexDetailScreen extends StatefulWidget {
  final String indexType; // 'btc', 'eth', 'sol', 'composite'

  const CEFIIndexDetailScreen({super.key, required this.indexType});

  @override
  State<CEFIIndexDetailScreen> createState() => _CEFIIndexDetailScreenState();
}

class _CEFIIndexDetailScreenState extends State<CEFIIndexDetailScreen> {
  final ETFService _etfService = ETFService();
  final LocalStorageService _storageService = LocalStorageService();
  CEFIIndexResponse? _indexData;
  IndexChartResponse? _chartData;
  bool _isLoading = true;
  bool _isChartLoading = true;
  String? _error;
  String _selectedTimeRange = 'all';

  @override
  void initState() {
    super.initState();
    // Сначала загружаем из кэша, как в главном виджете
    _loadFromCacheImmediately();
    // Затем загружаем с сервера, если нужно
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  // Загрузить данные из кэша немедленно (как в главном виджете)
  Future<void> _loadFromCacheImmediately() async {
    try {
      final cachedData = await _storageService.getCEFIIndices();
      if (mounted && cachedData != null) {
        CEFIIndexResponse? indexData;

        switch (widget.indexType) {
          case 'btc':
            indexData = cachedData.btc;
            break;
          case 'eth':
            indexData = cachedData.eth;
            break;
          case 'sol':
            indexData = cachedData.sol;
            break;
          case 'composite':
            indexData = cachedData.composite;
            break;
        }

        if (indexData != null) {
          debugPrint('🔍 CEFI Detail Screen: Данные загружены из кэша');
          debugPrint('  Index type: ${widget.indexType}');
          debugPrint('  Current value: ${indexData.current.value}');

          setState(() {
            _indexData = indexData;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Ошибка загрузки кэшированных данных в detail screen: $e');
    }
  }

  Future<void> _loadData() async {
    // Если данные уже загружены из кэша, загружаем только график
    if (_indexData != null) {
      _loadChartData(_selectedTimeRange);
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Сначала пытаемся получить данные из провайдера
      final provider = context.read<ETFProvider>();
      AllCEFIIndices? allData = provider.cefiIndices;

      // Если данных нет в провайдере, загружаем из кэша
      if (allData == null) {
        allData = await _storageService.getCEFIIndices();
      }

      // Если данных все еще нет, загружаем с сервера
      if (allData == null) {
        allData = await _etfService.getAllCEFIIndices(limit: 30);
        await _storageService.saveCEFIIndices(allData);
        // Обновляем провайдер
        provider.loadCEFIIndices();
      }

      // Получаем нужный индекс из общих данных
      CEFIIndexResponse? indexData;
      switch (widget.indexType) {
        case 'btc':
          indexData = allData.btc;
          break;
        case 'eth':
          indexData = allData.eth;
          break;
        case 'sol':
          indexData = allData.sol;
          break;
        case 'composite':
          indexData = allData.composite;
          break;
      }

      // Загружаем график
      final chartData = await _etfService.getIndexChart(
        widget.indexType,
        timeRange: _selectedTimeRange,
      );

      setState(() {
        _indexData = indexData;
        _chartData = chartData;
        _isLoading = false;
        _isChartLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
        _isChartLoading = false;
      });
    }
  }

  Future<void> _loadChartData(String timeRange) async {
    setState(() {
      _isChartLoading = true;
      _selectedTimeRange = timeRange;
    });

    try {
      final chartData = await _etfService.getIndexChart(
        widget.indexType,
        timeRange: timeRange,
      );

      setState(() {
        _chartData = chartData;
        _isChartLoading = false;
      });
    } catch (e) {
      debugPrint('Ошибка загрузки графика: $e');
      setState(() {
        _isChartLoading = false;
      });
    }
  }

  String _getIndexTitle() {
    switch (widget.indexType) {
      case 'btc':
        return 'cefi.index.btc'.tr();
      case 'eth':
        return 'cefi.index.eth'.tr();
      case 'sol':
        return 'cefi.index.sol'.tr();
      case 'composite':
        return 'cefi.index.composite'.tr();
      default:
        return 'cefi.index.default'.tr();
    }
  }

  // Получить параметры для UniversalCEFIIndexCard
  String _getIndexCardTitle() {
    switch (widget.indexType) {
      case 'btc':
        return 'CEFI-BTC';
      case 'eth':
        return 'CEFI-ETH';
      case 'sol':
        return 'CEFI-SOL';
      case 'composite':
        return 'CEFI-Composite';
      default:
        return 'CEFI-Index';
    }
  }

  IconData _getIndexIcon() {
    switch (widget.indexType) {
      case 'btc':
        return Icons.currency_bitcoin;
      case 'eth':
        return Icons.hexagon;
      case 'sol':
        return Icons.radio_button_checked;
      case 'composite':
        return Icons.dashboard;
      default:
        return Icons.dashboard;
    }
  }

  Color _getIndexIconColor() {
    switch (widget.indexType) {
      case 'btc':
        return Colors.orange;
      case 'eth':
        return Colors.blue;
      case 'sol':
        return Colors.teal;
      case 'composite':
        return Colors.blue;
      default:
        return Colors.blue;
    }
  }

  // Определение зоны индекса по шкале:
  // Extreme Greed: 80-100
  // Greed: 60-79
  // Neutral: 40-59
  // Fear: 20-39
  // Extreme Fear: 0-19
  String _getSentimentLabel(double value) {
    if (value >= 80) return 'cefi.sentiment.extreme_greed'.tr();
    if (value >= 60) return 'cefi.sentiment.greed'.tr();
    if (value >= 40) return 'cefi.sentiment.neutral'.tr();
    if (value >= 20) return 'cefi.sentiment.fear'.tr();
    return 'cefi.sentiment.extreme_fear'.tr();
  }

  // Цвета соответствуют зонам индекса
  Color _getSentimentColor(double value) {
    if (value >= 80)
      return const Color(0xFF16a34a); // Extreme Greed - темно-зеленый
    if (value >= 60) return const Color(0xFF22c55e); // Greed - зеленый
    if (value >= 40) return const Color(0xFFeab308); // Neutral - желтый
    if (value >= 20) return const Color(0xFFf97316); // Fear - оранжевый
    return const Color(0xFFdc2626); // Extreme Fear - красный
  }

  String _formatNumber(double num) {
    if (num == num.roundToDouble()) {
      return num.round().toString();
    }
    return num.toStringAsFixed(2);
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    final locale = context.locale.languageCode;
    return DateFormat('d MMM yyyy', locale).format(date);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(_getIndexTitle()),
        backgroundColor: isDark
            ? const Color(0xFF0A0A0A)
            : Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: _error != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '${'common.error'.tr()}: $_error',
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadData,
                    child: Text('common.retry'.tr()),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.only(left: 16, right: 16, top: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Используем тот же виджет, что и на главной странице
                    _isLoading || _indexData == null
                        ? _buildCurrentValueGaugeSkeleton()
                        : UniversalCEFIIndexCard(
                            indexData: _indexData!,
                            title: _getIndexCardTitle(),
                            icon: _getIndexIcon(),
                            iconColor: _getIndexIconColor(),
                            indexType: widget.indexType,
                            disableNavigation:
                                true, // Отключаем переход, так как мы уже на детальной странице
                            hideArrow:
                                true, // Скрываем стрелку на детальной странице
                          ),
                    const SizedBox(height: 24),
                    // Исторические значения или скелетон
                    _isLoading
                        ? _buildHistoricalValuesSkeleton()
                        : _indexData != null
                        ? _buildHistoricalValues()
                        : _buildHistoricalValuesSkeleton(),
                    const SizedBox(height: 24),
                    // График или скелетон
                    _isChartLoading || (_isLoading && _chartData == null)
                        ? _buildChartSkeleton()
                        : _buildChart(),
                    const SizedBox(height: 16), // Небольшой отступ снизу
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildHistoricalValues() {
    if (_indexData == null || _indexData!.history.isEmpty) {
      return const SizedBox.shrink();
    }

    final now = DateTime.now();
    final yesterday = now.subtract(const Duration(days: 1));
    final lastWeek = now.subtract(const Duration(days: 7));
    final lastMonth = DateTime(now.year, now.month - 1, now.day);
    final oneYearAgo = now.subtract(const Duration(days: 365));

    final findClosestValue = (DateTime targetDate) {
      CEFIIndexData? closest;
      double minDiff = double.infinity;

      for (final item in _indexData!.history) {
        final itemDate = DateTime.parse(item.date);
        final diff = (itemDate.difference(targetDate).inDays).abs();
        if (diff < minDiff) {
          minDiff = diff.toDouble();
          closest = item;
        }
      }
      return closest;
    };

    final yesterdayValue = findClosestValue(yesterday);
    final lastWeekValue = findClosestValue(lastWeek);
    final lastMonthValue = findClosestValue(lastMonth);

    // Yearly high/low
    final yearlyData = _indexData!.history
        .where((item) => DateTime.parse(item.date).isAfter(oneYearAgo))
        .toList();
    final dataForExtremes = yearlyData.isNotEmpty
        ? yearlyData
        : _indexData!.history;

    CEFIIndexData? yearlyHigh;
    CEFIIndexData? yearlyLow;

    if (dataForExtremes.isNotEmpty) {
      yearlyHigh = dataForExtremes.reduce((a, b) => a.value > b.value ? a : b);
      yearlyLow = dataForExtremes.reduce((a, b) => a.value < b.value ? a : b);
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        // Historical Values
        Container(
          decoration: CardStyleUtils.getCardDecoration(context),
          padding: CardStyleUtils.getCardPadding(context),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'cefi.historical_values'.tr(),
                style: AdaptiveTextUtils.createAdaptiveTextStyle(
                  context,
                  'titleMedium',
                  fontWeight: FontWeight.bold,
                ).copyWith(color: CardStyleUtils.getTitleColor(context)),
              ),
              const SizedBox(height: 16),
              if (yesterdayValue != null)
                _buildHistoricalRow(
                  'cefi.yesterday'.tr(),
                  yesterdayValue,
                  isDark,
                ),
              if (yesterdayValue != null) const SizedBox(height: 12),
              if (lastWeekValue != null)
                _buildHistoricalRow(
                  'cefi.last_week'.tr(),
                  lastWeekValue,
                  isDark,
                ),
              if (lastWeekValue != null) const SizedBox(height: 12),
              if (lastMonthValue != null)
                _buildHistoricalRow(
                  'cefi.last_month'.tr(),
                  lastMonthValue,
                  isDark,
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Yearly High and Low
        Container(
          decoration: CardStyleUtils.getCardDecoration(context),
          padding: CardStyleUtils.getCardPadding(context),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'cefi.yearly_high_low'.tr(),
                style: AdaptiveTextUtils.createAdaptiveTextStyle(
                  context,
                  'titleMedium',
                  fontWeight: FontWeight.bold,
                ).copyWith(color: CardStyleUtils.getTitleColor(context)),
              ),
              const SizedBox(height: 16),
              if (yearlyHigh != null)
                _buildYearlyRow(
                  'cefi.yearly_high'.tr(),
                  yearlyHigh,
                  _formatDate(yearlyHigh.date),
                  isDark,
                ),
              if (yearlyHigh != null) const SizedBox(height: 12),
              if (yearlyLow != null)
                _buildYearlyRow(
                  'cefi.yearly_low'.tr(),
                  yearlyLow,
                  _formatDate(yearlyLow.date),
                  isDark,
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHistoricalRow(String label, CEFIIndexData data, bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: CardStyleUtils.getSubtitleColor(context),
            fontSize: 14,
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF854d0e) : const Color(0xFFf5f5dc),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            '${_getSentimentLabel(data.value)} - ${_formatNumber(data.value)}',
            style: TextStyle(
              color: isDark ? const Color(0xFFfef3c7) : const Color(0xFF333333),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildYearlyRow(
    String label,
    CEFIIndexData data,
    String date,
    bool isDark,
  ) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            '$label ($date)',
            style: TextStyle(
              color: CardStyleUtils.getSubtitleColor(context),
              fontSize: 14,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: _getSentimentColor(data.value),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            '${_getSentimentLabel(data.value)} - ${_formatNumber(data.value)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildChart() {
    return Container(
      decoration: CardStyleUtils.getCardDecoration(context),
      padding: CardStyleUtils.getCardPadding(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${_getIndexTitle()} ${'cefi.chart'.tr()}',
                style: AdaptiveTextUtils.createAdaptiveTextStyle(
                  context,
                  'titleMedium',
                  fontWeight: FontWeight.bold,
                ).copyWith(color: CardStyleUtils.getTitleColor(context)),
              ),
              Row(
                children: [
                  _buildTimeRangeButton('30d', '30d'),
                  const SizedBox(width: 8),
                  _buildTimeRangeButton('1y', '1y'),
                  const SizedBox(width: 8),
                  _buildTimeRangeButton('All', 'all'),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_isChartLoading)
            const SizedBox(
              height: 300,
              child: Center(child: CircularProgressIndicator()),
            )
          else if (_chartData == null || _chartData!.data.isEmpty)
            SizedBox(
              height: 300,
              child: Center(child: Text('common.no_data'.tr())),
            )
          else
            SizedBox(
              height: 300,
              child: Stack(
                children: [
                  // Фоновые зоны (позиционированы с учетом отступов графика)
                  Positioned(
                    left: 25, // Отступ для области чисел на левой оси
                    right: 0,
                    top:
                        0, // Убрали отступ сверху, чтобы зоны заполняли всю высоту
                    bottom: 25, // Отступ для нижней оси X
                    child: _buildBackgroundZones(),
                  ),
                  // График поверх зон (обрезанный по границам)
                  ClipRect(child: _buildLineChart()),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTimeRangeButton(String label, String value) {
    final isSelected = _selectedTimeRange == value;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => _loadChartData(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? Colors.blue
              : isDark
              ? Colors.grey.shade800
              : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected
                ? Colors.white
                : CardStyleUtils.getTitleColor(context),
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildBackgroundZones() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Column(
          mainAxisSize: MainAxisSize.max,
          children: [
            // Зеленая зона: 80-100 (20% высоты) - СВЕРХУ
            Expanded(
              flex: 2,
              child: Container(color: const Color.fromRGBO(22, 199, 132, 0.1)),
            ),
            // Прозрачная зона: 20-80 (60% высоты)
            Expanded(flex: 6, child: Container(color: Colors.transparent)),
            // Красная зона: 0-20 (20% высоты) - СНИЗУ
            Expanded(
              flex: 2,
              child: Container(color: const Color.fromRGBO(234, 57, 67, 0.1)),
            ),
          ],
        );
      },
    );
  }

  // Разбивает данные на сегменты по зонам для цветной линии
  List<LineChartBarData> _buildColoredLineSegments(List<dynamic> chartData) {
    if (chartData.isEmpty) return [];

    final segments = <List<FlSpot>>[];
    final currentSegment = <FlSpot>[];
    Color? currentColor;

    for (int i = 0; i < chartData.length; i++) {
      final rawValue = chartData[i].indexValue;

      // Проверка на валидность значения
      if (rawValue.isNaN || rawValue.isInfinite) {
        continue; // Пропускаем некорректные значения
      }

      // Ограничиваем значение в диапазоне 0-100
      final value = rawValue.clamp(0.0, 100.0);
      final color = _getSentimentColor(value);
      final spot = FlSpot(i.toDouble(), value);

      // Если цвет изменился, завершаем текущий сегмент и начинаем новый
      if (currentColor != null && currentColor != color) {
        if (currentSegment.isNotEmpty) {
          // Добавляем текущую точку в конец предыдущего сегмента для непрерывности
          currentSegment.add(spot);
          segments.add(List.from(currentSegment));
          currentSegment.clear();
          // Начинаем новый сегмент с той же точки (для плавного перехода)
          currentSegment.add(spot);
        } else {
          currentSegment.add(spot);
        }
      } else {
        // Добавляем точку в текущий сегмент
        currentSegment.add(spot);
      }

      currentColor = color;
    }

    // Добавляем последний сегмент
    if (currentSegment.isNotEmpty) {
      segments.add(currentSegment);
    }

    // Создаем LineChartBarData для каждого сегмента
    return segments
        .map((segmentSpots) {
          if (segmentSpots.isEmpty) return null;
          final firstValue = segmentSpots.first.y;
          final color = _getSentimentColor(firstValue);

          return LineChartBarData(
            spots: segmentSpots,
            isCurved: true,
            color: color,
            barWidth: 3,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(show: false),
          );
        })
        .whereType<LineChartBarData>()
        .toList();
  }

  Widget _buildLineChart() {
    if (_chartData == null || _chartData!.data.isEmpty) {
      return Center(child: Text('common.no_data'.tr()));
    }

    final chartData = _chartData!.data;

    // Дополнительная проверка: если данных недостаточно для построения графика
    // Нужно минимум 2 точки для построения линии
    if (chartData.length < 2) {
      return Center(child: Text('common.no_data'.tr()));
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Убеждаемся, что maxX >= minX (минимум 0)
    // chartData.length >= 2 гарантирует, что maxX >= 1
    final maxX = (chartData.length - 1).toDouble();

    return LineChart(
      LineChartData(
        backgroundColor: Colors.transparent,
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: 20,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
              strokeWidth: 1,
            );
          },
        ),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 25, // Уменьшено для приближения графика к шкале
              interval: chartData.length > 30
                  ? (chartData.length / 5).clamp(1.0, double.infinity)
                  : chartData.length > 1
                  ? 1.0
                  : 1.0,
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index >= 0 && index < chartData.length) {
                  final date = DateTime.parse(chartData[index].date);
                  final locale = context.locale.languageCode;
                  return Text(
                    DateFormat('MMM', locale).format(date),
                    style: TextStyle(
                      color: isDark
                          ? Colors.grey.shade400
                          : Colors.grey.shade600,
                      fontSize: 10,
                    ),
                  );
                }
                return const Text('');
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize:
                  25, // Отступ для чисел, чтобы они не обрезались и были правильно выровнены
              interval: 20,
              getTitlesWidget: (value, meta) {
                // Показываем только значения 20, 40, 60, 80, 100
                if (value == 20 ||
                    value == 40 ||
                    value == 60 ||
                    value == 80 ||
                    value == 100) {
                  // Позиционируем числа под линией (смещаем вниз на половину высоты текста)
                  return Transform.translate(
                    offset: const Offset(
                      0,
                      5,
                    ), // Смещаем вниз, чтобы число было под линией
                    child: Text(
                      value.toInt().toString(),
                      style: TextStyle(
                        color: isDark
                            ? Colors.grey.shade400
                            : Colors.grey.shade600,
                        fontSize: 10,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  );
                }
                return const Text('');
              },
            ),
          ),
          topTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: false,
              reservedSize:
                  20, // Увеличенный паддинг сверху, чтобы число 100 было полностью видно
            ),
          ),
        ),
        borderData: FlBorderData(
          show: true,
          border: Border(
            top: BorderSide(
              color: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
            ),
            bottom: BorderSide(
              color: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
            ),
            // Убираем вертикальные границы (left и right)
          ),
        ),
        minX: 0,
        maxX: maxX,
        minY: 0,
        maxY: 100, // Индекс всегда от 0 до 100
        clipData: const FlClipData.all(),
        lineBarsData: _buildColoredLineSegments(chartData),
      ),
    );
  }

  // Скелетон для gauge с текущим значением
  Widget _buildCurrentValueGaugeSkeleton() {
    final screenWidth = MediaQuery.of(context).size.width;
    final gaugeHeight = (screenWidth * 0.6).clamp(130.0, 180.0);

    return Container(
      decoration: CardStyleUtils.getCardDecoration(context),
      padding: CardStyleUtils.getCardPadding(context),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Скелетон для заголовка
          Container(
            width: 120,
            height: 20,
            decoration: BoxDecoration(
              color: CardStyleUtils.getSubtitleColor(
                context,
              ).withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: gaugeHeight,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Gauge структура (без указателя)
                SfRadialGauge(
                  axes: <RadialAxis>[
                    RadialAxis(
                      minimum: 0,
                      maximum: 100,
                      // Гарантируем, что диапазон валиден (min != max)
                      interval:
                          20, // Явно задаем интервал для предотвращения проблем
                      showLabels: false,
                      showTicks: false,
                      startAngle: 180,
                      endAngle: 0,
                      axisLineStyle: AxisLineStyle(
                        thickness: 20,
                        thicknessUnit: GaugeSizeUnit.logicalPixel,
                        color: Colors.transparent,
                      ),
                      ranges: <GaugeRange>[
                        GaugeRange(
                          startValue: 0,
                          endValue: 20,
                          color: const Color(0xFFdc2626),
                          startWidth: 20,
                          endWidth: 20,
                          sizeUnit: GaugeSizeUnit.logicalPixel,
                        ),
                        GaugeRange(
                          startValue: 20,
                          endValue: 40,
                          color: const Color(0xFFf97316),
                          startWidth: 20,
                          endWidth: 20,
                          sizeUnit: GaugeSizeUnit.logicalPixel,
                        ),
                        GaugeRange(
                          startValue: 40,
                          endValue: 60,
                          color: const Color(0xFFeab308),
                          startWidth: 20,
                          endWidth: 20,
                          sizeUnit: GaugeSizeUnit.logicalPixel,
                        ),
                        GaugeRange(
                          startValue: 60,
                          endValue: 80,
                          color: const Color(0xFF22c55e),
                          startWidth: 20,
                          endWidth: 20,
                          sizeUnit: GaugeSizeUnit.logicalPixel,
                        ),
                        GaugeRange(
                          startValue: 80,
                          endValue: 100,
                          color: const Color(0xFF16a34a),
                          startWidth: 20,
                          endWidth: 20,
                          sizeUnit: GaugeSizeUnit.logicalPixel,
                        ),
                      ],
                    ),
                  ],
                ),
                // Скелетон в центре
                Positioned(
                  bottom: gaugeHeight * 0.15,
                  left: 0,
                  right: 0,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Скелетон для числа
                      Container(
                        width: 60,
                        height: 48,
                        decoration: BoxDecoration(
                          color: CardStyleUtils.getSubtitleColor(
                            context,
                          ).withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Скелетон для текста
                      Container(
                        width: 100,
                        height: 16,
                        decoration: BoxDecoration(
                          color: CardStyleUtils.getSubtitleColor(
                            context,
                          ).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Скелетон для исторических значений
  Widget _buildHistoricalValuesSkeleton() {
    return Column(
      children: [
        // Historical Values скелетон
        Container(
          decoration: CardStyleUtils.getCardDecoration(context),
          padding: CardStyleUtils.getCardPadding(context),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Скелетон для заголовка
              Container(
                width: 150,
                height: 20,
                decoration: BoxDecoration(
                  color: CardStyleUtils.getSubtitleColor(
                    context,
                  ).withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(height: 16),
              // Скелетоны для строк
              ...List.generate(3, (index) {
                return Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          width: 80,
                          height: 14,
                          decoration: BoxDecoration(
                            color: CardStyleUtils.getSubtitleColor(
                              context,
                            ).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        Container(
                          width: 120,
                          height: 24,
                          decoration: BoxDecoration(
                            color: CardStyleUtils.getSubtitleColor(
                              context,
                            ).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                      ],
                    ),
                    if (index < 2) const SizedBox(height: 12),
                  ],
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Yearly High and Low скелетон
        Container(
          decoration: CardStyleUtils.getCardDecoration(context),
          padding: CardStyleUtils.getCardPadding(context),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Скелетон для заголовка
              Container(
                width: 150,
                height: 20,
                decoration: BoxDecoration(
                  color: CardStyleUtils.getSubtitleColor(
                    context,
                  ).withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(height: 16),
              // Скелетоны для строк
              ...List.generate(2, (index) {
                return Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Container(
                            width: double.infinity,
                            height: 14,
                            decoration: BoxDecoration(
                              color: CardStyleUtils.getSubtitleColor(
                                context,
                              ).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 120,
                          height: 24,
                          decoration: BoxDecoration(
                            color: CardStyleUtils.getSubtitleColor(
                              context,
                            ).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                      ],
                    ),
                    if (index < 1) const SizedBox(height: 12),
                  ],
                );
              }),
            ],
          ),
        ),
      ],
    );
  }

  // Скелетон для графика
  Widget _buildChartSkeleton() {
    return Container(
      decoration: CardStyleUtils.getCardDecoration(context),
      padding: CardStyleUtils.getCardPadding(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Скелетон для заголовка
              Container(
                width: 150,
                height: 20,
                decoration: BoxDecoration(
                  color: CardStyleUtils.getSubtitleColor(
                    context,
                  ).withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              // Скелетоны для кнопок времени
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 28,
                    decoration: BoxDecoration(
                      color: CardStyleUtils.getSubtitleColor(
                        context,
                      ).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 40,
                    height: 28,
                    decoration: BoxDecoration(
                      color: CardStyleUtils.getSubtitleColor(
                        context,
                      ).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 40,
                    height: 28,
                    decoration: BoxDecoration(
                      color: CardStyleUtils.getSubtitleColor(
                        context,
                      ).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Скелетон для области графика
          Container(
            height: 300,
            decoration: BoxDecoration(
              color: CardStyleUtils.getSubtitleColor(
                context,
              ).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(
                  CardStyleUtils.getSubtitleColor(
                    context,
                  ).withValues(alpha: 0.5),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
