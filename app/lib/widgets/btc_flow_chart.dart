import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:easy_localization/easy_localization.dart';
import '../models/etf_flow_data.dart';

enum ChartPeriod { daily, weekly, monthly }

class BTCFlowChart extends StatefulWidget {
  final List<BTCFlowData> data;
  final String title;
  final Color primaryColor;
  final Color secondaryColor;

  const BTCFlowChart({
    super.key,
    required this.data,
    required this.title,
    this.primaryColor = Colors.orange,
    this.secondaryColor = Colors.blue,
  });

  @override
  State<BTCFlowChart> createState() => _BTCFlowChartState();
}

class _BTCFlowChartState extends State<BTCFlowChart> {
  ChartPeriod _selectedPeriod = ChartPeriod.daily;
  List<BTCFlowData> _filteredData = [];

  @override
  void initState() {
    super.initState();
    _filterData();
  }

  @override
  void didUpdateWidget(BTCFlowChart oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.data != widget.data) {
      _filterData();
    }
  }

  void _filterData() {
    if (widget.data.isEmpty) {
      _filteredData = [];
      return;
    }

    final now = DateTime.now();
    final sortedData = List<BTCFlowData>.from(
      widget.data,
    )..sort((a, b) => DateTime.parse(a.date).compareTo(DateTime.parse(b.date)));

    switch (_selectedPeriod) {
      case ChartPeriod.daily:
        // Показать последние 30 дней
        final thirtyDaysAgo = now.subtract(const Duration(days: 30));
        _filteredData = sortedData
            .where((item) => DateTime.parse(item.date).isAfter(thirtyDaysAgo))
            .toList();
        break;
      case ChartPeriod.weekly:
        // Группируем данные по неделям
        _filteredData = _groupDataByWeek(sortedData);
        break;
      case ChartPeriod.monthly:
        // Показать последние 6 месяцев
        final sixMonthsAgo = now.subtract(const Duration(days: 180));
        _filteredData = sortedData
            .where((item) => DateTime.parse(item.date).isAfter(sixMonthsAgo))
            .toList();
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Заголовок и переключатели периода
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  widget.title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              _buildPeriodSelector(),
            ],
          ),
        ),

        // Ключевые метрики
        _buildKeyMetrics(),

        // График
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: _buildChart(),
          ),
        ),
      ],
    );
  }

  Widget _buildPeriodSelector() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildPeriodButton('Ежедневно', ChartPeriod.daily),
          _buildPeriodButton('Еженедельно', ChartPeriod.weekly),
          _buildPeriodButton('Ежемесячно', ChartPeriod.monthly),
        ],
      ),
    );
  }

  Widget _buildPeriodButton(String label, ChartPeriod period) {
    final isSelected = _selectedPeriod == period;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedPeriod = period;
          _filterData();
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? widget.primaryColor : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey[400],
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildKeyMetrics() {
    if (_filteredData.isEmpty) return const SizedBox.shrink();

    final latestData = _filteredData.last;
    final totalInflow = latestData.total ?? 0;
    final totalAssets = _calculateTotalAssets();
    final btcPrice = _calculateBTCPrice();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        children: [
          Expanded(
            child: _buildMetricCard(
              'etf.total_daily_net_inflow'.tr(),
              _formatCurrency(totalInflow),
              totalInflow >= 0 ? Colors.green : Colors.red,
              Icons.trending_up,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildMetricCard(
              'Общая сумма\nчистых активов',
              _formatCurrency(totalAssets),
              widget.primaryColor,
              Icons.account_balance,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildMetricCard(
              'Цена BTC',
              _formatCurrency(btcPrice),
              widget.secondaryColor,
              Icons.currency_bitcoin,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(
    String title,
    String value,
    Color color,
    IconData icon,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[800]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(fontSize: 10, color: Colors.grey[400]),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: color,
            ),
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

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: true,
          horizontalInterval: 200,
          verticalInterval: 1,
          getDrawingHorizontalLine: (value) {
            return FlLine(color: Colors.grey[800], strokeWidth: 1);
          },
          getDrawingVerticalLine: (value) {
            return FlLine(color: Colors.grey[800], strokeWidth: 1);
          },
        ),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              interval: _getInterval(),
              getTitlesWidget: (value, meta) {
                if (value.toInt() >= 0 &&
                    value.toInt() < _filteredData.length) {
                  final date = DateTime.parse(
                    _filteredData[value.toInt()].date,
                  );
                  return SideTitleWidget(
                    axisSide: meta.axisSide,
                    child: Text(
                      DateFormat('MM-dd').format(date),
                      style: const TextStyle(color: Colors.grey, fontSize: 10),
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
              interval: _getLeftInterval(),
              reservedSize: 60,
              getTitlesWidget: (value, meta) {
                return SideTitleWidget(
                  axisSide: meta.axisSide,
                  child: Text(
                    _formatCurrency(value),
                    style: const TextStyle(color: Colors.grey, fontSize: 10),
                  ),
                );
              },
            ),
          ),
        ),
        borderData: FlBorderData(
          show: true,
          border: Border.all(color: Colors.grey[800]!),
        ),
        minX: 0,
        maxX: (_filteredData.length - 1).toDouble(),
        minY: _getMinY(),
        maxY: _getMaxY(),
        lineBarsData: [
          // Линия общих активов
          LineChartBarData(
            spots: _getTotalAssetsSpots(),
            isCurved: true,
            gradient: LinearGradient(
              colors: [
                widget.primaryColor,
                widget.primaryColor.withOpacity(0.5),
              ],
            ),
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  widget.primaryColor.withOpacity(0.3),
                  widget.primaryColor.withOpacity(0.1),
                ],
              ),
            ),
          ),
          // Линия цены BTC
          LineChartBarData(
            spots: _getBTCPriceSpots(),
            isCurved: true,
            gradient: LinearGradient(
              colors: [
                widget.secondaryColor,
                widget.secondaryColor.withOpacity(0.5),
              ],
            ),
            barWidth: 2,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
          ),
        ],
      ),
    );
  }

  List<FlSpot> _getTotalAssetsSpots() {
    double cumulativeTotal = 0;
    return _filteredData.asMap().entries.map((entry) {
      final total = entry.value.total ?? 0;
      cumulativeTotal += total;
      return FlSpot(entry.key.toDouble(), cumulativeTotal);
    }).toList();
  }

  List<FlSpot> _getBTCPriceSpots() {
    // Симуляция цены BTC на основе общих активов
    double basePrice = 65000;
    return _filteredData.asMap().entries.map((entry) {
      final total = entry.value.total ?? 0;
      final priceChange = total * 0.005; // Простая формула для демонстрации
      return FlSpot(entry.key.toDouble(), basePrice + priceChange);
    }).toList();
  }

  double _getMinY() {
    if (_filteredData.isEmpty) return 0;

    final totalAssetsSpots = _getTotalAssetsSpots();
    final btcPriceSpots = _getBTCPriceSpots();

    final minTotalAssets = totalAssetsSpots
        .map((spot) => spot.y)
        .reduce((a, b) => a < b ? a : b);
    final minBTCPrice = btcPriceSpots
        .map((spot) => spot.y)
        .reduce((a, b) => a < b ? a : b);

    return (minTotalAssets < minBTCPrice ? minTotalAssets : minBTCPrice) * 0.9;
  }

  double _getMaxY() {
    if (_filteredData.isEmpty) return 100;

    final totalAssetsSpots = _getTotalAssetsSpots();
    final btcPriceSpots = _getBTCPriceSpots();

    final maxTotalAssets = totalAssetsSpots
        .map((spot) => spot.y)
        .reduce((a, b) => a > b ? a : b);
    final maxBTCPrice = btcPriceSpots
        .map((spot) => spot.y)
        .reduce((a, b) => a > b ? a : b);

    return (maxTotalAssets > maxBTCPrice ? maxTotalAssets : maxBTCPrice) * 1.1;
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
    if (maxY <= 1000) return 100;
    if (maxY <= 10000) return 1000;
    if (maxY <= 100000) return 10000;
    return 100000;
  }

  List<BTCFlowData> _groupDataByWeek(List<BTCFlowData> flowData) {
    final Map<String, List<BTCFlowData>> weeklyGroups = {};

    for (final data in flowData) {
      final date = DateTime.parse(data.date);
      final weekKey = '${date.year}-W${_getWeekOfYear(date)}';

      if (!weeklyGroups.containsKey(weekKey)) {
        weeklyGroups[weekKey] = [];
      }
      weeklyGroups[weekKey]!.add(data);
    }

    final groupedData = weeklyGroups.entries.map((entry) {
      final weekData = entry.value;
      final total = weekData.fold<double>(
        0,
        (sum, data) => sum + (data.total ?? 0),
      );
      final firstDate = DateTime.parse(weekData.first.date);

      return BTCFlowData(date: firstDate.toIso8601String(), total: total);
    }).toList();

    // Сортируем по дате
    groupedData.sort(
      (a, b) => DateTime.parse(a.date).compareTo(DateTime.parse(b.date)),
    );

    return groupedData;
  }

  int _getWeekOfYear(DateTime date) {
    // Используем ISO недели (неделя начинается с понедельника)
    final jan1 = DateTime(date.year, 1, 1);
    final jan1Weekday = jan1.weekday;

    // Находим первый понедельник года
    final firstMonday = jan1.add(Duration(days: (8 - jan1Weekday) % 7));

    if (date.isBefore(firstMonday)) {
      // Если дата до первого понедельника, это неделя предыдущего года
      return _getWeekOfYear(DateTime(date.year - 1, 12, 31));
    }

    final weekNumber = ((date.difference(firstMonday).inDays) / 7).floor() + 1;
    return weekNumber;
  }

  double _calculateTotalAssets() {
    if (_filteredData.isEmpty) return 0;

    double total = 0;
    for (final data in _filteredData) {
      total += data.total ?? 0;
    }
    return total;
  }

  double _calculateBTCPrice() {
    if (_filteredData.isEmpty) return 65000;

    final latestTotal = _filteredData.last.total ?? 0;
    return 65000 + (latestTotal * 0.005);
  }

  String _formatCurrency(double value) {
    final absValue = value.abs();
    final prefix = value < 0 ? '-' : '';

    if (absValue >= 1e9) {
      return '$prefix${(absValue / 1e9).toStringAsFixed(2)}B';
    } else if (absValue >= 1e6) {
      return '$prefix${(absValue / 1e6).toStringAsFixed(2)}M';
    } else if (absValue >= 1e3) {
      return '$prefix${(absValue / 1e3).toStringAsFixed(2)}K';
    } else {
      return '$prefix${absValue.toStringAsFixed(2)}';
    }
  }
}
