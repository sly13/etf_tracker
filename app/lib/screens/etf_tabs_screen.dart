import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/etf_provider.dart';
import '../models/etf_flow_data.dart';
import 'package:intl/intl.dart';

class ETFTabsScreen extends StatefulWidget {
  const ETFTabsScreen({super.key});

  @override
  State<ETFTabsScreen> createState() => _ETFTabsScreenState();
}

class _ETFTabsScreenState extends State<ETFTabsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      final provider = context.read<ETFProvider>();
      if (_tabController.index == 0) {
        provider.switchTab('ethereum');
      } else {
        provider.switchTab('bitcoin');
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ETFProvider>().loadAllData();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ETF Tracker: Bitcoin & Ethereum'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              final provider = context.read<ETFProvider>();
              if (_tabController.index == 0) {
                provider.loadEthereumData();
              } else {
                provider.loadBitcoinData();
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Блок с суммарной статистикой сразу после заголовка
          _buildSummaryCard(),
          const SizedBox(height: 8),
          // Табы для переключения между Ethereum и Bitcoin
          Container(
            color: Theme.of(context).colorScheme.primary,
            child: TabBar(
              controller: _tabController,
              indicatorColor: Colors.white,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              tabs: const [
                Tab(icon: Icon(Icons.currency_bitcoin), text: 'Ethereum'),
                Tab(icon: Icon(Icons.currency_bitcoin), text: 'Bitcoin'),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Содержимое табов
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [_buildDataList('ethereum'), _buildDataList('bitcoin')],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDataList(String type) {
    return Consumer<ETFProvider>(
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
                    if (type == 'ethereum') {
                      etfProvider.loadEthereumData();
                    } else {
                      etfProvider.loadBitcoinData();
                    }
                  },
                  child: const Text('Повторить'),
                ),
              ],
            ),
          );
        }

        final data = type == 'ethereum'
            ? etfProvider.ethereumData
            : etfProvider.bitcoinData;

        if (data.isEmpty) {
          return Center(
            child: Text('Данные не найдены', style: TextStyle(fontSize: 18)),
          );
        }

        return RefreshIndicator(
          onRefresh: () {
            if (type == 'ethereum') {
              return etfProvider.loadEthereumData();
            } else {
              return etfProvider.loadBitcoinData();
            }
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: data.length,
            itemBuilder: (context, index) {
              final flowData = data[index];
              return _buildFlowDataCard(flowData, type);
            },
          ),
        );
      },
    );
  }

  Widget _buildFlowDataCard(ETFFlowData flowData, String type) {
    final date = DateTime.parse(flowData.date);
    final isPositive = flowData.total != null && flowData.total! >= 0;
    final totalColor = isPositive ? Colors.green : Colors.red;
    final cryptoIcon = type == 'ethereum'
        ? Icons.currency_bitcoin
        : Icons.currency_bitcoin;

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
                Row(
                  children: [
                    Icon(cryptoIcon, color: Colors.blue),
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

  Widget _buildSummaryCard() {
    return Selector<ETFProvider, Map<String, dynamic>?>(
      selector: (context, provider) => provider.summaryData,
      builder: (context, summaryData, child) {
        if (summaryData == null) {
          return const SizedBox.shrink();
        }

        return Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.blue.shade50, Colors.orange.shade50],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    flex: 2,
                    child: Text(
                      '📊 ETF Flow Statistics',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade800,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Text(
                        'Total: ${(summaryData['overall']['total']?.toDouble() ?? 0.0).toStringAsFixed(1)}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color:
                              (summaryData['overall']['total']?.toDouble() ??
                                      0.0) >=
                                  0
                              ? Colors.green
                              : Colors.red,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildSummaryItem(
                      'Ethereum',
                      summaryData['ethereum']['total']?.toDouble() ?? 0.0,
                      summaryData['ethereum']['count'] ?? 0,
                      summaryData['ethereum']['average']?.toDouble() ?? 0.0,
                      Colors.blue,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildSummaryItem(
                      'Bitcoin',
                      summaryData['bitcoin']['total']?.toDouble() ?? 0.0,
                      summaryData['bitcoin']['count'] ?? 0,
                      summaryData['bitcoin']['average']?.toDouble() ?? 0.0,
                      Colors.orange,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSummaryItem(
    String title,
    double total,
    int count,
    double average,
    Color color,
  ) {
    final isPositive = total >= 0;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                title == 'Ethereum'
                    ? Icons.currency_bitcoin
                    : Icons.currency_bitcoin,
                color: color,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${total.toStringAsFixed(1)}',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isPositive ? Colors.green : Colors.red,
            ),
          ),
          Text(
            '$count days • ${average.toStringAsFixed(1)} avg',
            style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
          ),
        ],
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
