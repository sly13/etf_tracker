import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

class ETFListScreen extends StatefulWidget {
  const ETFListScreen({super.key});

  @override
  State<ETFListScreen> createState() => _ETFListScreenState();
}

class _ETFListScreenState extends State<ETFListScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('etf_portfolio.title'.tr()),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.construction, size: 64, color: Colors.orange),
            const SizedBox(height: 16),
            Text(
              'etf_portfolio.title'.tr(),
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'etf_portfolio.in_development'.tr(),
              style: const TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
