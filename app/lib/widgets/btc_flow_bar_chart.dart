import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:intl/intl.dart';
import '../models/etf_flow_data.dart';

enum ChartPeriod { daily, weekly, monthly }

class BTCFlowBarChart extends StatefulWidget {
  final List<BTCFlowData> flowData;

  const BTCFlowBarChart({super.key, required this.flowData});

  @override
  State<BTCFlowBarChart> createState() => _BTCFlowBarChartState();
}

class _BTCFlowBarChartState extends State<BTCFlowBarChart> {
  ChartPeriod _selectedPeriod = ChartPeriod.daily;
  List<BTCFlowData> _filteredData = [];

  @override
  void initState() {
    super.initState();
    _filterData();
  }

  void _filterData() {
    if (widget.flowData.isEmpty) {
      setState(() {
        _filteredData = [];
      });
      return;
    }

    List<BTCFlowData> filtered;
    switch (_selectedPeriod) {
      case ChartPeriod.daily:
        filtered = widget.flowData;
        break;
      case ChartPeriod.weekly:
        filtered = _groupDataByWeek();
        break;
      case ChartPeriod.monthly:
        filtered = _groupDataByMonth();
        break;
    }

    setState(() {
      _filteredData = filtered;
    });
  }

  List<BTCFlowData> _groupDataByWeek() {
    final Map<String, List<BTCFlowData>> weeklyGroups = {};

    for (final data in widget.flowData) {
      final date = DateTime.parse(data.date);
      final weekKey = '${date.year}-W${_getWeekOfYear(date)}';

      if (!weeklyGroups.containsKey(weekKey)) {
        weeklyGroups[weekKey] = [];
      }
      weeklyGroups[weekKey]!.add(data);
    }

    return weeklyGroups.entries.map((entry) {
      final weekData = entry.value;
      final total = weekData.fold<double>(
        0,
        (sum, data) => sum + (data.total ?? 0),
      );
      final firstDate = DateTime.parse(weekData.first.date);

      return BTCFlowData(date: firstDate.toIso8601String(), total: total);
    }).toList();
  }

  List<BTCFlowData> _groupDataByMonth() {
    final Map<String, List<BTCFlowData>> monthlyGroups = {};

    for (final data in widget.flowData) {
      final date = DateTime.parse(data.date);
      final monthKey = '${date.year}-${date.month.toString().padLeft(2, '0')}';

      if (!monthlyGroups.containsKey(monthKey)) {
        monthlyGroups[monthKey] = [];
      }
      monthlyGroups[monthKey]!.add(data);
    }

    return monthlyGroups.entries.map((entry) {
      final monthData = entry.value;
      final total = monthData.fold<double>(
        0,
        (sum, data) => sum + (data.total ?? 0),
      );
      final firstDate = DateTime.parse(monthData.first.date);

      return BTCFlowData(date: firstDate.toIso8601String(), total: total);
    }).toList();
  }

  int _getWeekOfYear(DateTime date) {
    final startOfYear = DateTime(date.year, 1, 1);
    final daysSinceStart = date.difference(startOfYear).inDays;
    return ((daysSinceStart + startOfYear.weekday - 1) / 7).ceil();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[900] : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: isDark
            ? null
            : Border.all(color: Colors.grey.withOpacity(0.3), width: 1),
        boxShadow: isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Column(
        children: [
          _buildHeader(),
          const SizedBox(height: 8),
          _buildKeyMetrics(),
          const SizedBox(height: 8),
          Flexible(child: _buildChart()),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'etf.bitcoin_flows'.tr(),
          style: TextStyle(
            color: isDark ? Colors.white : Colors.black87,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            Expanded(
              child: _buildPeriodButton(
                'etf.daily'.tr(),
                ChartPeriod.daily,
                _selectedPeriod == ChartPeriod.daily,
              ),
            ),
            const SizedBox(width: 2),
            Expanded(
              child: _buildPeriodButton(
                'etf.weekly'.tr(),
                ChartPeriod.weekly,
                _selectedPeriod == ChartPeriod.weekly,
              ),
            ),
            const SizedBox(width: 2),
            Expanded(
              child: _buildPeriodButton(
                'etf.monthly'.tr(),
                ChartPeriod.monthly,
                _selectedPeriod == ChartPeriod.monthly,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPeriodButton(String text, ChartPeriod period, bool isSelected) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedPeriod = period;
        });
        _filterData();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 3),
        decoration: BoxDecoration(
          color: isSelected
              ? Colors.blue
              : (isDark ? Colors.grey[800] : Colors.grey[200]),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          text,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: isSelected
                ? Colors.white
                : (isDark ? Colors.grey[400] : Colors.grey[700]),
            fontSize: 9,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildKeyMetrics() {
    if (_filteredData.isEmpty) return const SizedBox.shrink();

    final totalInflow = _calculatePeriodTotal();
    final totalAssets = _calculateTotalAssets();
    final btcPrice = _calculateBTCPrice();

    return Row(
      children: [
        Expanded(
          child: _buildMetricCard(
            'etf.inflow'.tr(),
            _formatCurrency(totalInflow),
            Icons.trending_up,
            Colors.green,
          ),
        ),
        const SizedBox(width: 4),
        Expanded(
          child: _buildMetricCard(
            'etf.assets'.tr(),
            _formatCurrency(totalAssets),
            Icons.account_balance_wallet,
            Colors.blue,
          ),
        ),
        const SizedBox(width: 4),
        Expanded(
          child: _buildMetricCard(
            'etf.btc_price'.tr(),
            '\$${btcPrice.toStringAsFixed(0)}',
            Icons.attach_money,
            Colors.orange,
          ),
        ),
      ],
    );
  }

  Widget _buildMetricCard(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[800] : Colors.grey[100],
        borderRadius: BorderRadius.circular(6),
        border: isDark
            ? null
            : Border.all(color: Colors.grey.withOpacity(0.3), width: 1),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 12),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(
              color: Colors.grey,
              fontSize: 8,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 1),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildChart() {
    if (_filteredData.isEmpty) {
      return Center(
        child: Text(
          'common.no_data'.tr(),
          style: const TextStyle(color: Colors.grey),
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final availableHeight = constraints.maxHeight;
        final minHeight = 60.0; // Минимальная высота для графика

        if (availableHeight < minHeight) {
          // Если места очень мало, показываем упрощенную версию
          return _buildCompactChart();
        }

        return Padding(
          padding: const EdgeInsets.only(top: 8.0, right: 8.0),
          child: Row(
            children: [
              // Фиксированная шкала слева (только если достаточно места)
              if (availableHeight >= 80)
                SizedBox(
                  width: 60,
                  child: Column(
                    children: [
                      const SizedBox(height: 10),
                      Expanded(child: _buildFixedAxis()),
                    ],
                  ),
                ),
              // Скроллируемая область с графиком
              Expanded(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  child: SizedBox(
                    width: _getChartWidth(),
                    child: _buildScrollableChart(
                      showAxis: availableHeight >= 80,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCompactChart() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: SizedBox(
          width: _getChartWidth(),
          child: _buildScrollableChart(showAxis: false),
        ),
      ),
    );
  }

  Widget _buildFixedAxis() {
    final maxY = _getMaxY();
    final minY = _getMinY();
    final interval = _getLeftInterval();

    final List<Widget> axisLabels = [];

    for (double value = maxY; value >= minY; value -= interval) {
      axisLabels.add(
        SizedBox(
          height: 20,
          child: Align(
            alignment: Alignment.centerRight,
            child: Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: Text(
                _formatAxisValue(value),
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ),
      );
    }

    return Column(children: axisLabels);
  }

  Widget _buildScrollableChart({bool showAxis = true}) {
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: _getMaxY(),
        minY: _getMinY(),
        barTouchData: BarTouchData(
          enabled: true,
          touchTooltipData: BarTouchTooltipData(
            tooltipBgColor: Colors.grey[900]!,
            getTooltipItem: (group, groupIndex, rod, rodIndex) {
              final data = _filteredData[group.x.toInt()];
              final date = DateTime.parse(data.date);
              String dateFormat;
              switch (_selectedPeriod) {
                case ChartPeriod.daily:
                  dateFormat = 'dd.MM.yyyy';
                  break;
                case ChartPeriod.weekly:
                  dateFormat = 'dd.MM.yyyy';
                  break;
                case ChartPeriod.monthly:
                  dateFormat = 'MMM yyyy';
                  break;
              }
              return BarTooltipItem(
                '${DateFormat(dateFormat).format(date)}\n${_formatCurrency(rod.toY)}',
                const TextStyle(color: Colors.white),
              );
            },
          ),
        ),
        titlesData: FlTitlesData(
          show: showAxis,
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          leftTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false), // Скрываем левую шкалу
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: showAxis,
              reservedSize: showAxis ? 25 : 0,
              interval: _getInterval(),
              getTitlesWidget: (value, meta) {
                if (value.toInt() >= 0 &&
                    value.toInt() < _filteredData.length) {
                  final date = DateTime.parse(
                    _filteredData[value.toInt()].date,
                  );
                  String dateFormat;
                  switch (_selectedPeriod) {
                    case ChartPeriod.daily:
                      dateFormat = 'dd';
                      break;
                    case ChartPeriod.weekly:
                      dateFormat = 'dd.MM';
                      break;
                    case ChartPeriod.monthly:
                      dateFormat = 'MMM';
                      break;
                  }
                  return SideTitleWidget(
                    axisSide: meta.axisSide,
                    child: Text(
                      DateFormat(dateFormat).format(date),
                      style: const TextStyle(color: Colors.grey, fontSize: 8),
                    ),
                  );
                }
                return const Text('');
              },
            ),
          ),
        ),
        borderData: FlBorderData(
          show: true,
          border: Border.all(color: Colors.grey[800]!),
        ),
        barGroups: _getBarGroups(),
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: _getLeftInterval(),
          getDrawingHorizontalLine: (value) {
            if (value == 0) {
              return FlLine(color: Colors.white, strokeWidth: 2);
            }
            return FlLine(color: Colors.grey[600], strokeWidth: 1);
          },
        ),
      ),
    );
  }

  List<BarChartGroupData> _getBarGroups() {
    return _filteredData.asMap().entries.map((entry) {
      final index = entry.key;
      final data = entry.value;
      final total = data.total ?? 0;

      final color = total >= 0 ? Colors.green : Colors.red;
      final toY = total;

      return BarChartGroupData(
        x: index,
        barRods: [
          BarChartRodData(
            toY: toY,
            color: color,
            width: _getBarWidth(),
            borderRadius: BorderRadius.only(
              topLeft: total >= 0 ? const Radius.circular(2) : Radius.zero,
              topRight: total >= 0 ? const Radius.circular(2) : Radius.zero,
              bottomLeft: total < 0 ? const Radius.circular(2) : Radius.zero,
              bottomRight: total < 0 ? const Radius.circular(2) : Radius.zero,
            ),
          ),
        ],
      );
    }).toList();
  }

  double _getMinY() {
    if (_filteredData.isEmpty) return 0;

    final minValue = _filteredData
        .map((data) => data.total ?? 0)
        .reduce((a, b) => a < b ? a : b);

    return minValue < 0 ? minValue * 1.2 : 0;
  }

  double _getMaxY() {
    if (_filteredData.isEmpty) return 100;

    final maxValue = _filteredData
        .map((data) => data.total ?? 0)
        .reduce((a, b) => a > b ? a : b);

    return maxValue > 0 ? maxValue * 1.2 : 100;
  }

  double _getInterval() {
    final length = _filteredData.length;
    if (length <= 10) return 1;
    if (length <= 30) return 3;
    if (length <= 60) return 7;
    return 14;
  }

  double _getLeftInterval() {
    final maxY = _getMaxY();
    final minY = _getMinY();
    final range = maxY - minY;

    if (range <= 100) return 25;
    if (range <= 200) return 50;
    if (range <= 500) return 100;
    if (range <= 1000) return 200;
    if (range <= 2000) return 400;
    if (range <= 5000) return 1000;
    if (range <= 10000) return 2000;
    if (range <= 50000) return 10000;
    return 50000;
  }

  double _getBarWidth() {
    switch (_selectedPeriod) {
      case ChartPeriod.daily:
        return 6;
      case ChartPeriod.weekly:
        return 8;
      case ChartPeriod.monthly:
        return 12;
    }
  }

  double _getChartWidth() {
    final dataLength = _filteredData.length;
    switch (_selectedPeriod) {
      case ChartPeriod.daily:
        return dataLength * 20.0;
      case ChartPeriod.weekly:
        return dataLength * 40.0;
      case ChartPeriod.monthly:
        return dataLength * 60.0;
    }
  }

  double _calculatePeriodTotal() {
    if (_filteredData.isEmpty) return 0;

    switch (_selectedPeriod) {
      case ChartPeriod.daily:
        // Для дня показываем последнее значение
        return _filteredData.last.total ?? 0;
      case ChartPeriod.weekly:
        // Для недели показываем сумму за последние 7 дней
        final recentData = _filteredData.take(7).toList();
        return recentData.fold<double>(
          0,
          (sum, data) => sum + (data.total ?? 0),
        );
      case ChartPeriod.monthly:
        // Для месяца показываем сумму за последние 30 дней
        final recentData = _filteredData.take(30).toList();
        return recentData.fold<double>(
          0,
          (sum, data) => sum + (data.total ?? 0),
        );
    }
  }

  double _calculateTotalAssets() {
    if (widget.flowData.isEmpty) return 0;

    // Активы - это общая сумма активов за все время
    // Используем все данные, а не только отфильтрованные
    double totalAssets = 0;
    for (final data in widget.flowData) {
      final flow = data.total ?? 0;
      if (flow > 0) {
        totalAssets += flow;
      }
    }

    // Добавляем базовую сумму активов
    totalAssets += 12520; // Базовая сумма активов

    return totalAssets;
  }

  double _calculateBTCPrice() {
    if (_filteredData.isEmpty) return 45000;

    // Базовая цена BTC
    double basePrice = 45000;

    switch (_selectedPeriod) {
      case ChartPeriod.daily:
        // Для дня цена зависит от последнего потока
        final latestTotal = _filteredData.last.total ?? 0;
        return basePrice + (latestTotal * 0.01);
      case ChartPeriod.weekly:
        // Для недели цена зависит от среднего потока за неделю
        final recentData = _filteredData.take(7).toList();
        final avgFlow =
            recentData.fold<double>(0, (sum, data) => sum + (data.total ?? 0)) /
            recentData.length;
        return basePrice + (avgFlow * 0.01);
      case ChartPeriod.monthly:
        // Для месяца цена зависит от среднего потока за месяц
        final recentData = _filteredData.take(30).toList();
        final avgFlow =
            recentData.fold<double>(0, (sum, data) => sum + (data.total ?? 0)) /
            recentData.length;
        return basePrice + (avgFlow * 0.01);
    }
  }

  String _formatAxisValue(double value) {
    if (value == 0) return '0';

    if (value < 0) {
      if (value.abs() >= 1000) {
        return '-${(value.abs() / 1000).toStringAsFixed(1)}K';
      }
      return value.toStringAsFixed(0);
    }

    if (value >= 1000) {
      return '${(value / 1000).toStringAsFixed(1)}K';
    }
    return value.toStringAsFixed(0);
  }

  String _formatCurrency(double value) {
    if (value.abs() >= 1e9) {
      return '${(value / 1e9).toStringAsFixed(2)}B';
    } else if (value.abs() >= 1e6) {
      return '${(value / 1e6).toStringAsFixed(2)}M';
    } else if (value.abs() >= 1e3) {
      return '${(value / 1e3).toStringAsFixed(2)}K';
    } else {
      return value.toStringAsFixed(2);
    }
  }
}
