import 'package:flutter/material.dart';
import '../models/etf.dart';
import '../services/fund_logo_service.dart';
import 'package:intl/intl.dart';
import '../utils/haptic_feedback.dart';
import '../utils/adaptive_text_utils.dart';

class ETFCard extends StatelessWidget {
  final ETF etf;
  final VoidCallback onTap;

  const ETFCard({super.key, required this.etf, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isPositive = etf.changePercent >= 0;
    final changeColor = isPositive ? Colors.green : Colors.red;
    final changeIcon = isPositive ? Icons.trending_up : Icons.trending_down;

    // Определяем ключ фонда по названию
    final fundKey = _getFundKeyFromName(etf.name);

    // Получаем адаптивные размеры
    final sizes = AdaptiveTextUtils.getETFCardSizes(context);

    return Card(
      elevation: 4,
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: () {
          HapticUtils.lightImpact();
          onTap();
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.all(sizes['cardPadding']!),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Логотип фонда
                  if (fundKey != null)
                    Container(
                      width: sizes['logoSize'],
                      height: sizes['logoSize'],
                      margin: EdgeInsets.only(right: sizes['spacing']! * 1.5),
                      child: FundLogoService.getLogoWidget(
                        fundKey,
                        width: sizes['logoSize']!,
                        height: sizes['logoSize']!,
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),

                  // Информация о фонде
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          etf.ticker,
                          style: AdaptiveTextUtils.createAdaptiveTextStyle(
                            context,
                            'titleLarge',
                            fontWeight: FontWeight.bold,
                            customBaseSize: sizes['titleFontSize'],
                          ),
                        ),
                        SizedBox(height: sizes['spacing']! / 2),
                        Text(
                          etf.name,
                          style: AdaptiveTextUtils.createAdaptiveTextStyle(
                            context,
                            'bodyMedium',
                            color: Colors.grey[600],
                            customBaseSize: sizes['subtitleFontSize'],
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),

                  // Цена и изменение
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '\$${etf.currentPrice.toStringAsFixed(2)}',
                        style: AdaptiveTextUtils.createAdaptiveFinancialStyle(
                          context,
                          'headlineMedium',
                          fontWeight: FontWeight.bold,
                          customBaseSize: sizes['priceFontSize'],
                        ),
                      ),
                      SizedBox(height: sizes['spacing']! / 2),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            changeIcon,
                            size: sizes['iconSize'],
                            color: changeColor,
                          ),
                          SizedBox(width: sizes['spacing']! / 2),
                          Text(
                            '${etf.changePercent.toStringAsFixed(2)}%',
                            style:
                                AdaptiveTextUtils.createAdaptiveFinancialStyle(
                                  context,
                                  'bodyMedium',
                                  fontWeight: FontWeight.w500,
                                  color: changeColor,
                                  customBaseSize: sizes['changeFontSize'],
                                ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              SizedBox(height: sizes['cardSpacing']!),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildInfoItem(
                    context,
                    'Класс активов',
                    etf.assetClass,
                    Icons.category,
                    sizes,
                  ),
                  _buildInfoItem(
                    context,
                    'Комиссия',
                    '${etf.expenseRatio.toStringAsFixed(2)}%',
                    Icons.percent,
                    sizes,
                  ),
                  _buildInfoItem(
                    context,
                    'Объем',
                    _formatVolume(etf.volume),
                    Icons.analytics,
                    sizes,
                  ),
                ],
              ),
              SizedBox(height: sizes['spacing']!),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildInfoItem(
                    context,
                    'Активы',
                    _formatCurrency(etf.totalAssets),
                    Icons.account_balance_wallet,
                    sizes,
                  ),
                  _buildInfoItem(
                    context,
                    'Обновлено',
                    DateFormat('yyyy-MM-dd').format(etf.lastUpdated),
                    Icons.access_time,
                    sizes,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Определяет ключ фонда по названию
  String? _getFundKeyFromName(String name) {
    final lowerName = name.toLowerCase();

    if (lowerName.contains('blackrock') || lowerName.contains('ibit')) {
      return 'blackrock';
    } else if (lowerName.contains('fidelity') || lowerName.contains('fbtc')) {
      return 'fidelity';
    } else if (lowerName.contains('bitwise') || lowerName.contains('bitb')) {
      return 'bitwise';
    } else if (lowerName.contains('21shares') ||
        lowerName.contains('ark') ||
        lowerName.contains('arkb')) {
      return 'twentyOneShares';
    } else if (lowerName.contains('vaneck') || lowerName.contains('hodl')) {
      return 'vanEck';
    } else if (lowerName.contains('invesco') || lowerName.contains('btco')) {
      return 'invesco';
    } else if (lowerName.contains('franklin') || lowerName.contains('ezbc')) {
      return 'franklin';
    } else if (lowerName.contains('grayscale') && lowerName.contains('btc')) {
      return 'grayscale';
    } else if (lowerName.contains('grayscale') && lowerName.contains('eth')) {
      return 'grayscaleCrypto';
    } else if (lowerName.contains('valkyrie') || lowerName.contains('brrr')) {
      return 'valkyrie';
    } else if (lowerName.contains('wisdomtree') || lowerName.contains('btcw')) {
      return 'wisdomTree';
    }

    return null;
  }

  Widget _buildInfoItem(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Map<String, double> sizes,
  ) {
    return Column(
      children: [
        Icon(icon, size: sizes['iconSize']! * 1.25, color: Colors.grey[600]),
        SizedBox(height: sizes['spacing']! / 2),
        Text(
          label,
          style: AdaptiveTextUtils.createAdaptiveTextStyle(
            context,
            'labelSmall',
            color: Colors.grey[600],
            customBaseSize: sizes['subtitleFontSize']! * 0.85,
          ),
        ),
        SizedBox(height: sizes['spacing']! / 4),
        Text(
          value,
          style: AdaptiveTextUtils.createAdaptiveFinancialStyle(
            context,
            'labelSmall',
            fontWeight: FontWeight.w500,
            customBaseSize: sizes['subtitleFontSize']! * 0.85,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  String _formatVolume(double volume) {
    final absVolume = volume.abs();
    final prefix = volume < 0 ? '-' : '';

    if (absVolume >= 1000000000) {
      return '$prefix${(absVolume / 1000000000).toStringAsFixed(2)}B';
    } else if (absVolume >= 1000000) {
      return '$prefix${(absVolume / 1000000).toStringAsFixed(2)}M';
    } else if (absVolume >= 1000) {
      return '$prefix${(absVolume / 1000).toStringAsFixed(2)}K';
    }
    return '$prefix${absVolume.toStringAsFixed(0)}';
  }

  String _formatCurrency(double amount) {
    final absAmount = amount.abs();
    final prefix = amount < 0 ? '\$-' : '\$';

    if (absAmount >= 1000000000) {
      return '$prefix${(absAmount / 1000000000).toStringAsFixed(2)}B';
    } else if (absAmount >= 1000000) {
      return '$prefix${(absAmount / 1000000).toStringAsFixed(2)}M';
    } else if (absAmount >= 1000) {
      return '$prefix${(absAmount / 1000).toStringAsFixed(2)}K';
    }
    return '$prefix${absAmount.toStringAsFixed(0)}';
  }
}
