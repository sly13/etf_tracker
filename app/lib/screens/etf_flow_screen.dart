import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/etf_provider.dart';
import '../models/etf_flow_data.dart';
import 'package:intl/intl.dart';

class ETFFlowScreen extends StatefulWidget {
  const ETFFlowScreen({super.key});

  @override
  State<ETFFlowScreen> createState() => _ETFFlowScreenState();
}

class _ETFFlowScreenState extends State<ETFFlowScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ETFProvider>().loadETFFlowData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ETF Потоки'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<ETFProvider>().loadETFFlowData();
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
                      etfProvider.loadETFFlowData();
                    },
                    child: const Text('Повторить'),
                  ),
                ],
              ),
            );
          }

          if (etfProvider.etfFlowData.isEmpty) {
            return const Center(
              child: Text('Данные не найдены', style: TextStyle(fontSize: 18)),
            );
          }

          return RefreshIndicator(
            onRefresh: () => etfProvider.loadETFFlowData(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: etfProvider.etfFlowData.length,
              itemBuilder: (context, index) {
                final flowData = etfProvider.etfFlowData[index];
                return _buildFlowDataCard(flowData);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildFlowDataCard(ETFFlowData flowData) {
    final date = DateTime.parse(flowData.date);
    final isPositive = flowData.total != null && flowData.total! >= 0;
    final totalColor = isPositive ? Colors.green : Colors.red;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat('dd.MM.yyyy').format(date),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
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
                    '\$${(flowData.total ?? 0).toStringAsFixed(1)}M',
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
            _buildCompanyGrid(flowData),
          ],
        ),
      ),
    );
  }

  Widget _buildCompanyGrid(ETFFlowData flowData) {
    final companies = flowData.getCompanies();
    final rows = <Widget>[];

    for (int i = 0; i < companies.length; i += 3) {
      final rowCompanies = companies.skip(i).take(3).toList();
      final row = Row(
        children: rowCompanies.map((company) {
          return Expanded(child: _buildCompanyItem(company.key, company.value));
        }).toList(),
      );
      rows.add(row);
      if (i + 3 < companies.length) {
        rows.add(const SizedBox(height: 12));
      }
    }

    return Column(children: rows);
  }

  Widget _buildCompanyItem(String companyKey, double? value) {
    final companyName = ETFFlowData.getCompanyName(companyKey);
    final isPositive = value != null && value >= 0;
    final color = value == null
        ? Colors.grey
        : (isPositive ? Colors.green : Colors.red);
    final displayValue = value?.toStringAsFixed(1) ?? 'N/A';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.all(8),
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
          const SizedBox(height: 4),
          Text(
            '\$${displayValue}M',
            style: TextStyle(
              fontSize: 14,
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
