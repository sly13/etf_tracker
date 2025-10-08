import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'period_selector.dart';
import 'chart_constants.dart';

class FlowChart extends StatelessWidget {
  final List<dynamic> filteredData;
  final ChartPeriod selectedPeriod;

  const FlowChart({
    super.key,
    required this.filteredData,
    required this.selectedPeriod,
  });

  @override
  Widget build(BuildContext context) {
    if (filteredData.isEmpty) {
      return Center(
        child: Text(
          'common.no_data'.tr(),
          style: const TextStyle(color: ChartColors.secondaryText),
        ),
      );
    }

    return Padding(
      padding: EdgeInsets.only(
        top: 20,
        left: ChartStyles.chartPadding.left,
        right: ChartStyles.chartPadding.right,
        bottom: ChartStyles.chartPadding.bottom,
      ),
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.start,
          maxY: _getRoundedMaxY(),
          minY: _getRoundedMinY(),
          groupsSpace: ChartDimensions.groupsSpace,
          barTouchData: BarTouchData(
            enabled: true,
            handleBuiltInTouches: true,
            touchTooltipData: BarTouchTooltipData(
              tooltipBgColor: ChartColors.cardBackground,
              tooltipRoundedRadius: 8,
              tooltipPadding: const EdgeInsets.all(12),
              tooltipMargin: 10,
              tooltipHorizontalAlignment: FLHorizontalAlignment.center,
              maxContentWidth: 200,
              getTooltipItem: (group, groupIndex, rod, rodIndex) {
                final data = filteredData[group.x.toInt()];
                final date = DateTime.parse(data.date);
                String dateFormat;
                switch (selectedPeriod) {
                  case ChartPeriod.daily:
                    dateFormat = 'dd MMM yyyy';
                    break;
                  case ChartPeriod.weekly:
                    dateFormat = 'dd MMM yyyy';
                    break;
                  case ChartPeriod.monthly:
                    dateFormat = 'MMM yyyy';
                    break;
                }
                final valueInMillions = rod.toY;
                return BarTooltipItem(
                  '${DateFormat(dateFormat, 'en_US').format(date)}\n${_formatTooltipValue(valueInMillions)}',
                  const TextStyle(
                    color: ChartColors.primaryText,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
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
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: ChartDimensions.leftAxisReservedSize,
                interval: _getLeftInterval(),
                getTitlesWidget: (value, meta) {
                  return SideTitleWidget(
                    axisSide: meta.axisSide,
                    child: Container(
                      width:
                          45, // Фиксированная ширина для предотвращения переноса
                      alignment: Alignment.centerRight,
                      child: Text(
                        _formatAxisValue(value),
                        style: const TextStyle(
                          color: ChartColors.secondaryText,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.right,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  );
                },
              ),
            ),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: ChartDimensions.bottomAxisReservedSize,
                interval: _getInterval(),
                getTitlesWidget: (value, meta) {
                  if (selectedPeriod == ChartPeriod.daily) {
                    // Для дневного периода показываем только первую и последнюю дату
                    if (value.toInt() == 0) {
                      // Первая дата - позиционируем в начале
                      final firstDate = DateTime.parse(filteredData.first.date);
                      return SideTitleWidget(
                        axisSide: meta.axisSide,
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: Padding(
                            padding: const EdgeInsets.only(left: 50.0),
                            child: Text(
                              DateFormat(
                                'dd MMM yyyy',
                                'en_US',
                              ).format(firstDate),
                              style: const TextStyle(
                                color: ChartColors.secondaryText,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      );
                    } else if (value.toInt() == filteredData.length - 1) {
                      // Последняя дата - всегда показываем, но с правильным позиционированием
                      final lastDate = DateTime.parse(filteredData.last.date);
                      return SideTitleWidget(
                        axisSide: meta.axisSide,
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: Padding(
                            padding: const EdgeInsets.only(right: 60.0),
                            child: Text(
                              DateFormat(
                                'dd MMM yyyy',
                                'en_US',
                              ).format(lastDate),
                              style: const TextStyle(
                                color: ChartColors.secondaryText,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      );
                    }
                    return const Text('');
                  } else if (selectedPeriod == ChartPeriod.weekly) {
                    // Для недельного периода показываем только первую и последнюю дату
                    if (value.toInt() == 0) {
                      // Первая дата недели
                      final firstDate = DateTime.parse(filteredData.first.date);
                      return SideTitleWidget(
                        axisSide: meta.axisSide,
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: Padding(
                            padding: const EdgeInsets.only(left: 50.0),
                            child: Text(
                              DateFormat(
                                'dd MMM yyyy',
                                'en_US',
                              ).format(firstDate),
                              style: const TextStyle(
                                color: ChartColors.secondaryText,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      );
                    } else if (value.toInt() == filteredData.length - 1) {
                      // Последняя дата недели
                      final lastDate = DateTime.parse(filteredData.last.date);
                      return SideTitleWidget(
                        axisSide: meta.axisSide,
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: Padding(
                            padding: const EdgeInsets.only(right: 80.0),
                            child: Text(
                              DateFormat(
                                'dd MMM yyyy',
                                'en_US',
                              ).format(lastDate),
                              style: const TextStyle(
                                color: ChartColors.secondaryText,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      );
                    }
                    return const Text('');
                  } else if (selectedPeriod == ChartPeriod.monthly) {
                    // Для месячного периода показываем только первую и последнюю дату
                    if (value.toInt() == 0) {
                      // Первая дата месяца
                      final firstDate = DateTime.parse(filteredData.first.date);
                      return SideTitleWidget(
                        axisSide: meta.axisSide,
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: Padding(
                            padding: const EdgeInsets.only(left: 50.0),
                            child: Text(
                              DateFormat('MMM yyyy', 'en_US').format(firstDate),
                              style: const TextStyle(
                                color: ChartColors.secondaryText,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      );
                    } else if (value.toInt() == filteredData.length - 1) {
                      // Последняя дата месяца
                      final lastDate = DateTime.parse(filteredData.last.date);
                      return SideTitleWidget(
                        axisSide: meta.axisSide,
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: Padding(
                            padding: const EdgeInsets.only(right: 80.0),
                            child: Text(
                              DateFormat('MMM yyyy', 'en_US').format(lastDate),
                              style: const TextStyle(
                                color: ChartColors.secondaryText,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      );
                    }
                    return const Text('');
                  }
                  return const Text('');
                },
              ),
            ),
          ),
          borderData: FlBorderData(show: false),
          barGroups: _getBarGroups(),
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            drawHorizontalLine: true,
            horizontalInterval: _getLeftInterval(),
            getDrawingHorizontalLine: (value) {
              // Показываем линии на всех значениях оси
              if (value == 0) {
                return const FlLine(
                  color: ChartColors.zeroLine,
                  strokeWidth: ChartStyles.zeroLineWidth,
                );
              }
              return const FlLine(
                color: ChartColors.gridLine,
                strokeWidth: ChartStyles.gridLineWidth,
              );
            },
          ),
        ),
      ),
    );
  }

  List<BarChartGroupData> _getBarGroups() {
    return filteredData.asMap().entries.map((entry) {
      final index = entry.key;
      final data = entry.value;
      final total = data.total ?? 0;

      // Зеленый для положительных значений, красный для отрицательных
      final color = total >= 0
          ? ChartColors.positiveFlow
          : ChartColors.negativeFlow;

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
    if (filteredData.isEmpty) return 0;

    final minValue = filteredData
        .map((data) => data.total ?? 0)
        .reduce((a, b) => a < b ? a : b);

    return minValue < 0 ? minValue * 1.2 : 0;
  }

  double _getMaxY() {
    if (filteredData.isEmpty) return 100;

    final maxValue = filteredData
        .map((data) => data.total ?? 0)
        .reduce((a, b) => a > b ? a : b);

    return maxValue > 0 ? maxValue * 1.2 : 100;
  }

  double _getRoundedMaxY() {
    if (filteredData.isEmpty) return 100;

    final maxValue = filteredData
        .map((data) => data.total ?? 0)
        .reduce((a, b) => a > b ? a : b);

    // Округляем до ближайшего миллиарда вверх
    return (maxValue / 1000).ceil() * 1000.0;
  }

  double _getRoundedMinY() {
    if (filteredData.isEmpty) return 0;

    final minValue = filteredData
        .map((data) => data.total ?? 0)
        .reduce((a, b) => a < b ? a : b);

    // Округляем до ближайшего миллиарда вниз
    return (minValue / 1000).floor() * 1000.0;
  }

  double _getInterval() {
    switch (selectedPeriod) {
      case ChartPeriod.daily:
        // Для дневного периода показываем только первую и последнюю дату
        return filteredData.length > 1 ? filteredData.length - 1 : 1;
      case ChartPeriod.weekly:
        // Для недельного периода показываем только первую и последнюю дату
        return filteredData.length > 1 ? filteredData.length - 1 : 1;
      case ChartPeriod.monthly:
        // Для месячного периода показываем только первую и последнюю дату
        return filteredData.length > 1 ? filteredData.length - 1 : 1;
    }
  }

  double _getLeftInterval() {
    final maxY = _getMaxY();
    final minY = _getMinY();
    final range = maxY - minY;

    // Фиксированные интервалы по миллиардам - только четкие значения
    if (range <= 1000) return 200; // 200M
    if (range <= 2000) return 500; // 500M
    if (range <= 5000) return 1000; // 1B
    if (range <= 10000) return 2000; // 2B
    if (range <= 20000) return 5000; // 5B
    if (range <= 50000) return 10000; // 10B
    return 20000; // 20B
  }

  double _getBarWidth() {
    switch (selectedPeriod) {
      case ChartPeriod.daily:
        return ChartDimensions.dailyBarWidth;
      case ChartPeriod.weekly:
        return ChartDimensions.weeklyBarWidth;
      case ChartPeriod.monthly:
        return ChartDimensions.monthlyBarWidth;
    }
  }

  String _formatAxisValue(double value) {
    if (value == 0) return '0';

    final absValue = value.abs();
    final prefix = value < 0 ? '-' : '';

    if (absValue >= 1000) {
      // Для миллиардов показываем без десятичных знаков, если это целое число
      final billions = absValue / 1000;
      if (billions == billions.roundToDouble()) {
        return '$prefix${billions.round()}B';
      } else {
        return '$prefix${billions.toStringAsFixed(2)}B';
      }
    } else if (absValue >= 1) {
      // Для миллионов показываем без десятичных знаков, если это целое число
      if (absValue == absValue.roundToDouble()) {
        return '$prefix${absValue.round()}M';
      } else {
        return '$prefix${absValue.toStringAsFixed(2)}M';
      }
    } else {
      // Для тысяч показываем без десятичных знаков, если это целое число
      final thousands = absValue * 1000;
      if (thousands == thousands.roundToDouble()) {
        return '$prefix${thousands.round()}K';
      } else {
        return '$prefix${thousands.toStringAsFixed(2)}K';
      }
    }
  }

  String _formatTooltipValue(double value) {
    final absValue = value.abs();
    final prefix = value < 0 ? '-' : '';

    if (absValue >= 1000) {
      return '$prefix${(absValue / 1000).toStringAsFixed(2)}B';
    } else if (absValue >= 1) {
      return '$prefix${absValue.toStringAsFixed(2)}M';
    } else {
      return '$prefix${(absValue * 1000).toStringAsFixed(2)}K';
    }
  }
}
