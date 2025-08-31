import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/etf_flow_data.dart';

enum ChartPeriod { daily, weekly, monthly }

class ETFFlowBarChart extends StatefulWidget {
  final List<ETFFlowData> flowData;

  const ETFFlowBarChart({super.key, required this.flowData});

  @override
  State<ETFFlowBarChart> createState() => _ETFFlowBarChartState();
}

class _ETFFlowBarChartState extends State<ETFFlowBarChart> {
  ChartPeriod _selectedPeriod = ChartPeriod.daily;
  List<ETFFlowData> _filteredData = [];

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

    List<ETFFlowData> filtered;
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

  List<ETFFlowData> _groupDataByWeek() {
    final Map<String, List<ETFFlowData>> weeklyGroups = {};

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

      return ETFFlowData(date: firstDate.toIso8601String(), total: total);
    }).toList();
  }

  List<ETFFlowData> _groupDataByMonth() {
    final Map<String, List<ETFFlowData>> monthlyGroups = {};

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

      return ETFFlowData(date: firstDate.toIso8601String(), total: total);
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
        color: isDark ? const Color(0xFF1A1A1A) : Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          _buildHeader(isDark),
          const SizedBox(height: 16),
          _buildKeyMetrics(),
          const SizedBox(height: 16),
          Expanded(child: _buildChart()),
        ],
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Потоки Ethereum ETF',
          style: TextStyle(
            color: isDark ? Colors.white : Colors.black87,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildPeriodButton(
                'День',
                ChartPeriod.daily,
                _selectedPeriod == ChartPeriod.daily,
                isDark,
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: _buildPeriodButton(
                'Неделя',
                ChartPeriod.weekly,
                _selectedPeriod == ChartPeriod.weekly,
                isDark,
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: _buildPeriodButton(
                'Месяц',
                ChartPeriod.monthly,
                _selectedPeriod == ChartPeriod.monthly,
                isDark,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPeriodButton(
    String text,
    ChartPeriod period,
    bool isSelected,
    bool isDark,
  ) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedPeriod = period;
        });
        _filterData();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? Colors.blue
              : (isDark ? const Color(0xFF2A2A2A) : Colors.grey[300]),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          text,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: isSelected
                ? Colors.white
                : (isDark ? Colors.grey[400] : Colors.grey[600]),
            fontSize: 10,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildKeyMetrics() {
    if (_filteredData.isEmpty) return const SizedBox.shrink();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final totalInflow = _calculatePeriodTotal();
    final totalAssets = _calculateTotalAssets();
    final ethPrice = _calculateETHPrice();

    return Row(
      children: [
        Expanded(
          child: _buildMetricCard(
            'Приток',
            _formatCurrency(totalInflow),
            Icons.trending_up,
            Colors.green,
            isDark,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildMetricCard(
            'Активы',
            _formatCurrency(totalAssets),
            Icons.account_balance_wallet,
            Colors.blue,
            isDark,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildMetricCard(
            'Цена ETH',
            '\$${ethPrice.toStringAsFixed(0)}',
            Icons.attach_money,
            Colors.orange,
            isDark,
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
    bool isDark,
  ) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2A2A2A) : Colors.grey[200],
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 14),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(
              color: Colors.grey,
              fontSize: 9,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChart() {
    if (_filteredData.isEmpty) {
      return const Center(
        child: Text(
          'Нет данных для отображения',
          style: TextStyle(color: Colors.grey),
        ),
      );
    }

    return AspectRatio(
      aspectRatio: 1.5,
      child: Padding(
        padding: const EdgeInsets.only(top: 18.0, right: 18.0),
        child: Row(
          children: [
            // Фиксированная шкала слева
            SizedBox(
              width: 70,
              child: Column(
                children: [
                  const SizedBox(height: 20),
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
                  child: _buildScrollableChart(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFixedAxis() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
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
                  color: isDark ? Colors.grey[500] : Colors.grey[600],
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

  Widget _buildScrollableChart() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: _getMaxY(),
        minY: _getMinY(),
        barTouchData: BarTouchData(
          enabled: true,
          touchTooltipData: BarTouchTooltipData(
            tooltipBgColor: isDark
                ? const Color(0xFF1A1A1A)
                : Colors.grey[900]!,
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
          show: true,
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
              showTitles: true,
              reservedSize: 25,
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
                      style: TextStyle(
                        color: isDark ? Colors.grey[400] : Colors.grey,
                        fontSize: 8,
                      ),
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
          border: Border.all(
            color: isDark ? const Color(0xFF3A3A3A) : Colors.grey[800]!,
          ),
        ),
        barGroups: _getBarGroups(),
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: _getLeftInterval(),
          getDrawingHorizontalLine: (value) {
            if (value == 0) {
              return FlLine(
                color: isDark ? Colors.white : Colors.black,
                strokeWidth: 2,
              );
            }
            return FlLine(
              color: isDark ? Colors.grey[700] : Colors.grey[600],
              strokeWidth: 1,
            );
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
    return _filteredData.last.total ?? 0;
  }

  double _calculateTotalAssets() {
    if (_filteredData.isEmpty) return 0;
    double total = 0;
    for (final data in _filteredData) {
      total += data.total ?? 0;
    }
    return total;
  }

  double _calculateETHPrice() {
    if (_filteredData.isEmpty) return 4000;
    final latestTotal = _filteredData.last.total ?? 0;
    return 4000 + (latestTotal * 0.01);
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
