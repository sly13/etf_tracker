import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:intl/intl.dart';
import '../models/etf_flow_data.dart';
import '../providers/crypto_price_provider.dart';

class EthereumFlowCard extends StatelessWidget {
  final ETFFlowData flowData;
  final VoidCallback? onTap;

  const EthereumFlowCard({super.key, required this.flowData, this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isPositive = (flowData.total ?? 0) >= 0;
    final flowColor = isPositive ? Colors.green : Colors.red;
    final flowIcon = isPositive ? Icons.trending_up : Icons.trending_down;

    // Парсим дату
    final date = _parseDate(flowData.date);

    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: isDark
                  ? [const Color(0xFF1A1A1A), const Color(0xFF0A0A0A)]
                  : [Colors.blue.shade50, Colors.blue.shade100],
            ),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Иконка Ethereum
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.blue.shade400
                          : Colors.blue.shade600,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.all(8),
                        child: Image.asset(
                          'assets/ethereum.png',
                          width: 32,
                          height: 32,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(width: 16),

                  // Заголовок
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'etf.ethereum_flow'.tr(),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.blue.shade400 : Colors.blue,
                          ),
                        ),
                        const SizedBox(height: 2),
                        // Цена Ethereum
                        Consumer<CryptoPriceProvider>(
                          builder: (context, cryptoProvider, child) {
                            if (cryptoProvider.hasError)
                              return Text(
                                'Ошибка загрузки',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.red,
                                  fontWeight: FontWeight.w500,
                                ),
                              );
                            else if (cryptoProvider.ethereumPrice != null)
                              return Text(
                                '\$${_formatPrice(cryptoProvider.ethereumPrice!)}',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.blue,
                                ),
                              );
                            else
                              return Row(
                                children: [
                                  SizedBox(
                                    width: 10,
                                    height: 10,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 1.5,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.blue,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Загрузка...',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: isDark
                                          ? Colors.blue.shade300
                                          : Colors.blue.shade600,
                                    ),
                                  ),
                                ],
                              );
                          },
                        ),
                      ],
                    ),
                  ),

                  // Дата
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.blue.shade800.withOpacity(0.3)
                          : Colors.blue.shade600,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Text(
                          date.day.toString(),
                          style: TextStyle(
                            color: isDark ? Colors.blue.shade300 : Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          _getMonthAbbreviation(date.month),
                          style: TextStyle(
                            color: isDark ? Colors.blue.shade300 : Colors.white,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 8),

              // Подпись "Общий дневной поток"
              Text(
                'etf.total_daily_flow'.tr(),
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.blue.shade300 : Colors.blue.shade600,
                  fontWeight: FontWeight.w500,
                ),
              ),

              const SizedBox(height: 4),

              // Значение потока
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
      ),
    );
  }

  DateTime _parseDate(String dateString) {
    try {
      // Пытаемся парсить различные форматы даты
      if (dateString.contains('-')) {
        return DateTime.parse(dateString);
      } else if (dateString.contains('/')) {
        final parts = dateString.split('/');
        if (parts.length == 3) {
          return DateTime(
            int.parse(parts[2]),
            int.parse(parts[1]),
            int.parse(parts[0]),
          );
        }
      }
      // Если не удалось распарсить, возвращаем текущую дату
      return DateTime.now();
    } catch (e) {
      return DateTime.now();
    }
  }

  String _getMonthAbbreviation(int month) {
    switch (month) {
      case 1:
        return 'Jan';
      case 2:
        return 'Feb';
      case 3:
        return 'Mar';
      case 4:
        return 'Apr';
      case 5:
        return 'May';
      case 6:
        return 'Jun';
      case 7:
        return 'Jul';
      case 8:
        return 'Aug';
      case 9:
        return 'Sep';
      case 10:
        return 'Oct';
      case 11:
        return 'Nov';
      case 12:
        return 'Dec';
      default:
        return 'Jan';
    }
  }

  String _formatFlowAmount(double amount) {
    final absAmount = amount.abs();
    final prefix = amount >= 0 ? '' : '-';

    // Данные уже в миллионах, поэтому добавляем M к значению
    return '$prefix${absAmount.toStringAsFixed(1)}M';
  }

  String _formatPrice(double price) {
    // Форматируем цену с разделителями тысяч
    final formatter = NumberFormat('#,##0.00', 'en_US');
    return formatter.format(price);
  }
}
