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
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.construction, size: 64, color: Colors.orange),
            SizedBox(height: 16),
            Text(
              'ETF Портфель',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              'Функция находится в разработке',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
