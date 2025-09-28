import 'package:flutter/material.dart';
import 'period_selector.dart';
import 'chart_constants.dart';

class ChartHeader extends StatelessWidget {
  final String title;
  final ChartPeriod selectedPeriod;
  final Function(ChartPeriod) onPeriodChanged;

  const ChartHeader({
    super.key,
    required this.title,
    required this.selectedPeriod,
    required this.onPeriodChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: ChartStyles.headerPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: ChartColors.primaryText,
              fontSize: ChartStyles.titleFontSize,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          PeriodSelector(
            selectedPeriod: selectedPeriod,
            onPeriodChanged: onPeriodChanged,
          ),
        ],
      ),
    );
  }
}
