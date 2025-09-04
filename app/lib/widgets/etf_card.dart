import 'package:flutter/material.dart';
import '../models/etf.dart';
import '../services/fund_logo_service.dart';
import 'package:intl/intl.dart';
import '../utils/haptic_feedback.dart';

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
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Логотип фонда
                  if (fundKey != null)
                    Container(
                      width: 40,
                      height: 40,
                      margin: const EdgeInsets.only(right: 12),
                      child: FundLogoService.getLogoWidget(
                        fundKey,
                        width: 40,
                        height: 40,
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
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          etf.name,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
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
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(changeIcon, size: 16, color: changeColor),
                          const SizedBox(width: 4),
                          Text(
                            '${etf.changePercent.toStringAsFixed(2)}%',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: changeColor,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildInfoItem(
                    'Класс активов',
                    etf.assetClass,
                    Icons.category,
                  ),
                  _buildInfoItem(
                    'Комиссия',
                    '${etf.expenseRatio.toStringAsFixed(2)}%',
                    Icons.percent,
                  ),
                  _buildInfoItem(
                    'Объем',
                    _formatVolume(etf.volume),
                    Icons.analytics,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildInfoItem(
                    'Активы',
                    _formatCurrency(etf.totalAssets),
                    Icons.account_balance_wallet,
                  ),
                  _buildInfoItem(
                    'Обновлено',
                    DateFormat('dd.MM.yy').format(etf.lastUpdated),
                    Icons.access_time,
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

  Widget _buildInfoItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  String _formatVolume(double volume) {
    if (volume >= 1000000000) {
      return '${(volume / 1000000000).toStringAsFixed(1)}B';
    } else if (volume >= 1000000) {
      return '${(volume / 1000000).toStringAsFixed(1)}M';
    } else if (volume >= 1000) {
      return '${(volume / 1000).toStringAsFixed(1)}K';
    }
    return volume.toStringAsFixed(0);
  }

  String _formatCurrency(double amount) {
    if (amount >= 1000000000) {
      return '\$${(amount / 1000000000).toStringAsFixed(1)}B';
    } else if (amount >= 1000000) {
      return '\$${(amount / 1000000).toStringAsFixed(1)}M';
    } else if (amount >= 1000) {
      return '\$${(amount / 1000).toStringAsFixed(1)}K';
    }
    return '\$${amount.toStringAsFixed(0)}';
  }
}
