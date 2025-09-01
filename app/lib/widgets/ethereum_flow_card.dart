import 'package:flutter/material.dart';
import '../models/etf_flow_data.dart';
import 'package:intl/intl.dart';

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
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Иконка с долларом и стрелками
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.blue.shade400
                          : Colors.blue.shade600,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.currency_exchange,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),

                  const SizedBox(width: 12),

                  // Заголовок
                  Expanded(
                    child: Text(
                      'Ethereum ETF Flow',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.blue.shade400 : Colors.blue,
                      ),
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

              const SizedBox(height: 16),

              // Подпись "Общий дневной поток"
              Text(
                'Общий дневной поток',
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.blue.shade300 : Colors.blue.shade600,
                  fontWeight: FontWeight.w500,
                ),
              ),

              const SizedBox(height: 8),

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
    final prefix = amount >= 0 ? '\$ ' : '\$ -';

    // Данные уже в миллионах, поэтому добавляем M к значению
    return '$prefix${absAmount.toStringAsFixed(1)}M';
  }
}
