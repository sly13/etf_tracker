import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../models/etf_flow_data.dart';
import '../providers/crypto_price_provider.dart';
import '../utils/card_style_utils.dart';

class SolanaFlowCard extends StatelessWidget {
  final ETFFlowData flowData;
  final VoidCallback? onTap;

  const SolanaFlowCard({super.key, required this.flowData, this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isPositive = (flowData.total ?? 0) >= 0;
    final flowColor = isPositive ? Colors.green : Colors.red;
    final flowIcon = isPositive ? Icons.trending_up : Icons.trending_down;

    final date = _parseDate(flowData.date);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: CardStyleUtils.getCardDecoration(context),
        padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isDark
                            ? Colors.white.withOpacity(0.1)
                            : Colors.grey.withOpacity(0.3),
                        width: 1,
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.all(6),
                        child: Image.asset(
                          'assets/solana.png',
                          fit: BoxFit.fitHeight,
                          alignment: Alignment.center,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Solana ETF Flow',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.teal,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Consumer<CryptoPriceProvider>(
                          builder: (context, cryptoProvider, child) {
                            final p = cryptoProvider.solanaPrice;
                            if (cryptoProvider.hasError) {
                              return Text(
                                'Ошибка загрузки',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.red,
                                  fontWeight: FontWeight.w500,
                                ),
                              );
                            } else if (p != null) {
                              return Text(
                                '\$${_formatPrice(p)}',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.teal,
                                ),
                              );
                            } else {
                              return Row(
                                children: [
                                  const SizedBox(
                                    width: 10,
                                    height: 10,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 1.5,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.teal,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    'common.loading'.tr(),
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: isDark
                                          ? Colors.teal.shade300
                                          : Colors.teal.shade600,
                                    ),
                                  ),
                                ],
                              );
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.teal.shade800.withOpacity(0.25)
                          : Colors.teal,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Text(
                          date.day.toString(),
                          style: TextStyle(
                            color: isDark ? Colors.teal.shade300 : Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          _getMonthAbbreviation(date.month),
                          style: TextStyle(
                            color: isDark ? Colors.teal.shade300 : Colors.white,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'etf.total_daily_flow'.tr(),
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.teal.shade300 : Colors.teal.shade600,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(flowIcon, color: flowColor, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    _formatFlowAmount(flowData.total ?? 0),
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: flowColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
    );
  }

  DateTime _parseDate(String dateString) {
    try {
      if (dateString.contains('-')) return DateTime.parse(dateString);
      if (dateString.contains('/')) {
        final parts = dateString.split('/');
        if (parts.length == 3) {
          return DateTime(
            int.parse(parts[2]),
            int.parse(parts[1]),
            int.parse(parts[0]),
          );
        }
      }
      return DateTime.now();
    } catch (_) {
      return DateTime.now();
    }
  }

  String _getMonthAbbreviation(int month) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[(month - 1).clamp(0, 11)];
  }

  String _formatFlowAmount(double amount) {
    final absAmount = amount.abs();
    final prefix = amount >= 0 ? '' : '-';
    if (absAmount >= 1000)
      return '$prefix${(absAmount / 1000).toStringAsFixed(2)}B';
    return '$prefix${absAmount.toStringAsFixed(2)}M';
  }

  String _formatPrice(double price) {
    final formatter = NumberFormat('#,##0.00', 'en_US');
    return formatter.format(price);
  }
}
