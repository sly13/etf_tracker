import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/etf_provider.dart';
import '../services/fund_logo_service.dart';

class FundHoldingsScreen extends StatefulWidget {
  const FundHoldingsScreen({super.key});

  @override
  State<FundHoldingsScreen> createState() => _FundHoldingsScreenState();
}

class _FundHoldingsScreenState extends State<FundHoldingsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ETFProvider>().loadFundHoldings();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Владение Фондами'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<ETFProvider>().loadFundHoldings();
            },
          ),
        ],
      ),
      body: Consumer<ETFProvider>(
        builder: (context, etfProvider, child) {
          if (etfProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (etfProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Ошибка: ${etfProvider.error}',
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      etfProvider.clearError();
                      etfProvider.loadFundHoldings();
                    },
                    child: const Text('Повторить'),
                  ),
                ],
              ),
            );
          }

          if (etfProvider.fundHoldings == null) {
            return const Center(
              child: Text('Данные не найдены', style: TextStyle(fontSize: 18)),
            );
          }

          return RefreshIndicator(
            onRefresh: () => etfProvider.loadFundHoldings(),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSummaryCard(etfProvider.fundHoldings!),
                  const SizedBox(height: 24),
                  _buildFundHoldingsList(etfProvider.fundHoldings!),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSummaryCard(Map<String, dynamic> holdings) {
    final summary = holdings['summary'] as Map<String, dynamic>;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Общая Сводка',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildSummaryItem(
                    'Ethereum',
                    _formatLargeNumber(summary['totalEth']),
                    Colors.blue,
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: _buildSummaryItem(
                    'Bitcoin',
                    _formatLargeNumber(summary['totalBtc']),
                    Colors.orange,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildSummaryItem(
              'Общее Владение',
              _formatLargeNumber(summary['totalHoldings']),
              Colors.green,
              isLarge: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(
    String label,
    String value,
    Color color, {
    bool isLarge = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isLarge ? 16 : 14,
              fontWeight: FontWeight.w500,
              color: color,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: isLarge ? 20 : 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildFundHoldingsList(Map<String, dynamic> holdings) {
    final fundHoldings = holdings['fundHoldings'] as Map<String, dynamic>;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Владение по Фондам',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        ...fundHoldings.entries.map((entry) {
          final fundName = _getFundDisplayName(entry.key);
          final fundData = entry.value as Map<String, dynamic>;

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      // Логотип фонда
                      if (FundLogoService.hasLogo(entry.key))
                        Container(
                          width: 32,
                          height: 32,
                          margin: const EdgeInsets.only(right: 12),
                          child: FundLogoService.getLogoWidget(
                            entry.key,
                            width: 32,
                            height: 32,
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),

                      // Название фонда
                      Expanded(
                        child: Text(
                          fundName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildFundItem(
                          'ETH',
                          _formatLargeNumber(fundData['eth']),
                          Colors.blue,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildFundItem(
                          'BTC',
                          _formatLargeNumber(fundData['btc']),
                          Colors.orange,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildFundItem(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  /// Форматирует большие числа, конвертируя их в миллиарды для лучшей читаемости
  String _formatLargeNumber(dynamic number) {
    if (number == null) return '\$0.0M';

    final double value = number.toDouble();

    // Если значение больше 1000 миллионов (1 миллиард), показываем в миллиардах
    if (value >= 1000) {
      final billions = value / 1000;
      return '\$${billions.toStringAsFixed(1)}B';
    }

    // Иначе показываем в миллионах
    return '\$${value.toStringAsFixed(1)}M';
  }

  String _getFundDisplayName(String fundKey) {
    return FundLogoService.getFundName(fundKey);
  }
}
