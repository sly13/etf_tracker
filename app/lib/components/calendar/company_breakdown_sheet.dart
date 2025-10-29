import 'package:flutter/material.dart';
import '../../models/etf_flow_data.dart';

Future<void> showCompanyBreakdownSheet(
  BuildContext context, {
  required CombinedFlowData event,
  required String companyKey,
}) async {
  final isDark = Theme.of(context).brightness == Brightness.dark;
  final assets = const ['bitcoin', 'ethereum', 'solana'];

  String prettyName(String a) => a == 'bitcoin'
      ? 'Bitcoin'
      : a == 'ethereum'
      ? 'Ethereum'
      : 'Solana';

  String formatAmount(double amount) {
    final absAmount = amount.abs();
    final prefix = amount >= 0 ? '+' : '-';
    if (absAmount >= 1000)
      return '$prefix${(absAmount / 1000).toStringAsFixed(2)}B';
    if (absAmount >= 1) return '$prefix${absAmount.toStringAsFixed(2)}M';
    return '$prefix${(absAmount * 1000).toStringAsFixed(0)}K';
  }

  await showModalBottomSheet(
    context: context,
    backgroundColor: Colors.transparent,
    builder: (context) => Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1A1A1A) : Colors.white,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                ETFFlowData.getCompanyName(companyKey),
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black,
                ),
              ),
              const Spacer(),
            ],
          ),
          const SizedBox(height: 12),
          ...assets.map((asset) {
            final amount = event.companiesByAsset[asset]?[companyKey] ?? 0.0;
            if (amount == 0) return const SizedBox.shrink();
            final positive = amount >= 0;
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF2A2A2A) : Colors.grey[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isDark ? Colors.grey[600]! : Colors.grey[200]!,
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Text(
                    prettyName(asset),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : Colors.black,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: positive
                          ? Colors.green.withOpacity(0.1)
                          : Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      formatAmount(amount),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: positive ? Colors.green : Colors.red,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    ),
  );
}
