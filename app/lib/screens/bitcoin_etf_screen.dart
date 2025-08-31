import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/etf_provider.dart';
import '../models/etf_flow_data.dart';
import 'package:intl/intl.dart';

class BitcoinETFScreen extends StatefulWidget {
  const BitcoinETFScreen({super.key});

  @override
  State<BitcoinETFScreen> createState() => _BitcoinETFScreenState();
}

class _BitcoinETFScreenState extends State<BitcoinETFScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ETFProvider>().loadBitcoinData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bitcoin ETF'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<ETFProvider>().loadBitcoinData();
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
                      etfProvider.loadBitcoinData();
                    },
                    child: const Text('Повторить'),
                  ),
                ],
              ),
            );
          }

          if (etfProvider.bitcoinData.isEmpty) {
            return const Center(
              child: Text('Данные не найдены', style: TextStyle(fontSize: 18)),
            );
          }

          return RefreshIndicator(
            onRefresh: () => etfProvider.loadBitcoinData(),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Заголовок и общая статистика
                  _buildHeader(etfProvider.bitcoinData.first),
                  const SizedBox(height: 24),

                  // График или диаграмма (можно добавить позже)
                  _buildChartPlaceholder(),
                  const SizedBox(height: 24),

                  // Список данных по дням
                  _buildDataList(etfProvider.bitcoinData),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // Заголовок с общей статистикой
  Widget _buildHeader(BTCFlowData latestData) {
    final total = latestData.total ?? 0;
    final isPositive = total >= 0;
    final color = isPositive ? Colors.green : Colors.red;
    final icon = isPositive ? Icons.trending_up : Icons.trending_down;

    return Card(
      elevation: 4,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.orange.shade50, Colors.orange.shade100],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.currency_bitcoin, color: Colors.orange, size: 32),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'Bitcoin ETF Flow',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.orange,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Общий дневной поток',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.orange,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(icon, color: color, size: 24),
                          const SizedBox(width: 8),
                          Text(
                            '\$${total.toStringAsFixed(1)}M',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: color,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      Text(
                        DateFormat(
                          'dd',
                        ).format(DateTime.parse(latestData.date)),
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.orange,
                        ),
                      ),
                      Text(
                        DateFormat(
                          'MMM',
                        ).format(DateTime.parse(latestData.date)),
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.orange,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Заглушка для графика
  Widget _buildChartPlaceholder() {
    return Card(
      elevation: 2,
      child: Container(
        height: 200,
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.show_chart, size: 48, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'График потоков Bitcoin ETF',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Здесь будет отображаться график изменения потоков',
              style: TextStyle(fontSize: 14, color: Colors.grey[500]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  // Список данных по дням
  Widget _buildDataList(List<BTCFlowData> data) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'История потоков',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),

        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: data.length,
          itemBuilder: (context, index) {
            final flowData = data[index];
            return _buildFlowDataCard(flowData);
          },
        ),
      ],
    );
  }

  // Карточка с данными потока
  Widget _buildFlowDataCard(BTCFlowData flowData) {
    final date = DateTime.parse(flowData.date);
    final total = flowData.total ?? 0;
    final isPositive = total >= 0;
    final totalColor = isPositive ? Colors.green : Colors.red;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Заголовок с датой и общим потоком
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.calendar_today, color: Colors.orange, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      DateFormat('dd.MM.yyyy').format(date),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: totalColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: totalColor),
                  ),
                  child: Text(
                    '\$${total.toStringAsFixed(1)}M',
                    style: TextStyle(
                      color: totalColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Сетка с данными по компаниям
            _buildCompanyGrid(flowData),
          ],
        ),
      ),
    );
  }

  // Сетка с данными по компаниям
  Widget _buildCompanyGrid(BTCFlowData flowData) {
    final companies = flowData.getCompanies();
    final rows = <Widget>[];

    for (int i = 0; i < companies.length; i += 2) {
      final rowCompanies = companies.skip(i).take(2).toList();
      final row = Row(
        children: rowCompanies.map((company) {
          return Expanded(child: _buildCompanyItem(company.key, company.value));
        }).toList(),
      );
      rows.add(row);
      if (i + 2 < companies.length) {
        rows.add(const SizedBox(height: 12));
      }
    }

    return Column(children: rows);
  }

  // Элемент компании
  Widget _buildCompanyItem(String companyKey, double? value) {
    final companyName = BTCFlowData.getCompanyName(companyKey);
    final isPositive = value != null && value >= 0;
    final color = value == null
        ? Colors.grey
        : (isPositive ? Colors.green : Colors.red);
    final displayValue = value?.toStringAsFixed(1) ?? 'N/A';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        children: [
          Text(
            companyName,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: Colors.grey[700],
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          Text(
            '\$${displayValue}M',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
