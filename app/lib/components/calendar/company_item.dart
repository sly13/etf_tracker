import 'package:flutter/material.dart';

class CompanyItem extends StatelessWidget {
  final String companyName;
  final double amount;
  final bool dark;
  final VoidCallback? onTap;

  const CompanyItem({
    super.key,
    required this.companyName,
    required this.amount,
    required this.dark,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isPositive = amount >= 0;
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: dark ? const Color(0xFF2A2A2A) : Colors.grey[50],
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: dark ? Colors.grey[600]! : Colors.grey[200]!,
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: isPositive
                    ? Colors.green.withOpacity(0.15)
                    : Colors.red.withOpacity(0.15),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                isPositive ? Icons.trending_up : Icons.trending_down,
                color: isPositive ? Colors.green : Colors.red,
                size: 16,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                companyName,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: dark ? Colors.white : Colors.black,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: isPositive
                    ? Colors.green.withOpacity(0.1)
                    : Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                _formatAmount(amount),
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: isPositive ? Colors.green : Colors.red,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatAmount(double amount) {
    final absAmount = amount.abs();
    final prefix = amount >= 0 ? '+' : '-';
    if (absAmount >= 1000) {
      return '$prefix${(absAmount / 1000).toStringAsFixed(2)}B';
    } else if (absAmount >= 1) {
      return '$prefix${absAmount.toStringAsFixed(2)}M';
    } else {
      return '$prefix${(absAmount * 1000).toStringAsFixed(0)}K';
    }
  }
}
