import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/etf_provider.dart';
import '../config/app_config.dart';
import 'package:intl/intl.dart';

class ETFTabsScreen extends StatefulWidget {
  const ETFTabsScreen({super.key});

  @override
  State<ETFTabsScreen> createState() => _ETFTabsScreenState();
}

class _ETFTabsScreenState extends State<ETFTabsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ETFProvider>().loadAllData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('ETF Tracker'),
            if (AppConfig.isDebugMode)
              Text(
                'Dev Mode - ${AppConfig.backendBaseUrl}',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.normal,
                ),
              ),
          ],
        ),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<ETFProvider>().loadAllData();
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
                      etfProvider.loadAllData();
                    },
                    child: const Text('Повторить'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => etfProvider.loadAllData(),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Общая сводка
                  _buildSummaryCard(etfProvider),
                  const SizedBox(height: 24),

                  // Последние обновления
                  _buildRecentUpdates(etfProvider),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // Карточка с общей сводкой
  Widget _buildSummaryCard(ETFProvider etfProvider) {
    final ethereumData = etfProvider.ethereumData.isNotEmpty
        ? etfProvider.ethereumData.first
        : null;
    final bitcoinData = etfProvider.bitcoinData.isNotEmpty
        ? etfProvider.bitcoinData.first
        : null;

    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.analytics,
                  color: Theme.of(context).colorScheme.primary,
                  size: 28,
                ),
                const SizedBox(width: 12),
                const Text(
                  'Общая сводка ETF',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Сводка по Ethereum
            if (ethereumData != null) ...[
              _buildSummaryRow(
                'Ethereum ETF',
                ethereumData.total ?? 0,
                Icons.currency_exchange,
                Colors.blue,
                'Общий дневной поток',
              ),
              const SizedBox(height: 16),
            ],

            // Сводка по Bitcoin
            if (bitcoinData != null) ...[
              _buildSummaryRow(
                'Bitcoin ETF',
                bitcoinData.total ?? 0,
                Icons.currency_bitcoin,
                Colors.orange,
                'Общий дневной поток',
              ),
            ],

            const SizedBox(height: 16),
            Text(
              'Обновлено: ${DateFormat('dd.MM.yyyy HH:mm').format(DateTime.now())}',
              style: TextStyle(color: Colors.grey[600], fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  // Строка сводки
  Widget _buildSummaryRow(
    String title,
    double value,
    IconData icon,
    Color color,
    String subtitle,
  ) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            ],
          ),
        ),
        Text(
          '\$${value.toStringAsFixed(1)}M',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  // Последние обновления
  Widget _buildRecentUpdates(ETFProvider etfProvider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Последние обновления',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),

        if (etfProvider.ethereumData.isNotEmpty)
          _buildUpdateCard(
            'Ethereum ETF',
            etfProvider.ethereumData.first.date,
            etfProvider.ethereumData.first.total ?? 0,
            Colors.blue,
          ),

        if (etfProvider.bitcoinData.isNotEmpty) ...[
          const SizedBox(height: 12),
          _buildUpdateCard(
            'Bitcoin ETF',
            etfProvider.bitcoinData.first.date,
            etfProvider.bitcoinData.first.total ?? 0,
            Colors.orange,
          ),
        ],
      ],
    );
  }

  // Карточка обновления
  Widget _buildUpdateCard(
    String title,
    String date,
    double total,
    Color color,
  ) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 8,
              height: 40,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    'Обновлено: ${DateFormat('dd.MM.yyyy').format(DateTime.parse(date))}',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            Text(
              '\$${total.toStringAsFixed(1)}M',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
