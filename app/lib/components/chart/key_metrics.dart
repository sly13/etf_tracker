import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'period_selector.dart';
import 'chart_constants.dart';

class KeyMetrics extends StatelessWidget {
  final List<dynamic> filteredData;
  final ChartPeriod selectedPeriod;
  final List<dynamic> allFlowData;

  const KeyMetrics({
    super.key,
    required this.filteredData,
    required this.selectedPeriod,
    required this.allFlowData,
  });

  @override
  Widget build(BuildContext context) {
    if (filteredData.isEmpty) return const SizedBox.shrink();

    final periodTotal = _calculatePeriodTotal();

    return Padding(
      padding: ChartStyles.metricsPadding,
      child: _buildMetricItem(
        'etf.${_getPeriodTitle().toLowerCase()}_total_net_inflow'.tr(),
        _formatCurrency(periodTotal),
        periodTotal >= 0 ? Colors.green : Colors.red,
        periodTotal >= 0 ? Icons.trending_up : Icons.trending_down,
      ),
    );
  }

  Widget _buildMetricItem(
    String title,
    String value,
    Color color,
    IconData icon,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.2), width: 1),
      ),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 14),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: ChartColors.secondaryText,
                    fontSize: 11,
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
          ),
        ],
      ),
    );
  }

  double _calculatePeriodTotal() {
    if (filteredData.isEmpty) return 0;

    switch (selectedPeriod) {
      case ChartPeriod.daily:
        // Для дневного периода показываем сумму за последний день
        final latestData = filteredData.last;
        return latestData.total ?? 0;
      case ChartPeriod.weekly:
        // Для недельного периода показываем сумму за последнюю неделю
        final latestWeekData = filteredData.last;
        return latestWeekData.total ?? 0;
      case ChartPeriod.monthly:
        // Для месячного периода показываем сумму за последний месяц
        final latestMonthData = filteredData.last;
        return latestMonthData.total ?? 0;
    }
  }

  String _getPeriodTitle() {
    switch (selectedPeriod) {
      case ChartPeriod.daily:
        return 'Daily';
      case ChartPeriod.weekly:
        return 'Weekly';
      case ChartPeriod.monthly:
        return 'Monthly';
    }
  }

  String _formatCurrency(double value) {
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
