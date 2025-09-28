import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'chart_constants.dart';

enum ChartPeriod { daily, weekly, monthly }

class PeriodSelector extends StatelessWidget {
  final ChartPeriod selectedPeriod;
  final Function(ChartPeriod) onPeriodChanged;

  const PeriodSelector({
    super.key,
    required this.selectedPeriod,
    required this.onPeriodChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _buildPeriodButton(
            'etf.daily'.tr(),
            ChartPeriod.daily,
            selectedPeriod == ChartPeriod.daily,
          ),
        ),
        const SizedBox(width: 4),
        Expanded(
          child: _buildPeriodButton(
            'etf.weekly'.tr(),
            ChartPeriod.weekly,
            selectedPeriod == ChartPeriod.weekly,
          ),
        ),
        const SizedBox(width: 4),
        Expanded(
          child: _buildPeriodButton(
            'etf.monthly'.tr(),
            ChartPeriod.monthly,
            selectedPeriod == ChartPeriod.monthly,
          ),
        ),
      ],
    );
  }

  Widget _buildPeriodButton(String text, ChartPeriod period, bool isSelected) {
    return GestureDetector(
      onTap: () => onPeriodChanged(period),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? ChartColors.selectedPeriod
              : ChartColors.unselectedPeriod,
          borderRadius: BorderRadius.circular(
            ChartStyles.periodButtonBorderRadius,
          ),
          border: Border.all(
            color: isSelected ? ChartColors.selectedPeriod : ChartColors.border,
            width: ChartStyles.borderWidth,
          ),
        ),
        child: Text(
          text,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: isSelected
                ? ChartColors.primaryText
                : ChartColors.secondaryText,
            fontSize: ChartStyles.periodButtonFontSize,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
