import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/etf_provider.dart';
import '../config/app_config.dart';
import 'settings_screen.dart';
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
    // Данные загружаются только при инициализации приложения, не здесь
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
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SettingsScreen()),
              );
            },
          ),
        ],
      ),
      body: Consumer<ETFProvider>(
        builder: (context, etfProvider, child) {
          // Показываем ошибку только если она есть
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
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
                Text(
                  'Общая сводка ETF',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
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
              style: TextStyle(
                color: isDark ? Colors.grey[400] : Colors.grey[600],
                fontSize: 12,
              ),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Делаем Ethereum темнее
    final adjustedColor = title.contains('Ethereum')
        ? (isDark ? Colors.blue.shade700 : Colors.blue.shade600)
        : color;

    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: adjustedColor.withOpacity(isDark ? 0.2 : 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: adjustedColor, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? Colors.grey[400] : Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
        Text(
          '\$${value.toStringAsFixed(1)}M',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: adjustedColor,
          ),
        ),
      ],
    );
  }

  // Последние обновления
  Widget _buildRecentUpdates(ETFProvider etfProvider) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Последние обновления',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Делаем Ethereum темнее
    final adjustedColor = title.contains('Ethereum')
        ? (isDark ? Colors.blue.shade700 : Colors.blue.shade600)
        : color;

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
                color: adjustedColor,
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
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  Text(
                    'Обновлено: ${DateFormat('dd.MM.yyyy').format(DateTime.parse(date))}',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            Text(
              '\$${total.toStringAsFixed(1)}M',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: adjustedColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
