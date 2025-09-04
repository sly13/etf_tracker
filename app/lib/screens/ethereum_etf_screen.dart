import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/etf_provider.dart';
import '../models/etf_flow_data.dart';
import '../widgets/etf_flow_bar_chart.dart';
import '../widgets/premium_chart_overlay.dart';

import '../widgets/ethereum_flow_card.dart';
import 'settings_screen.dart';
import 'subscription_selection_screen.dart';
import 'package:intl/intl.dart';
import '../widgets/pro_button.dart';

class EthereumETFScreen extends StatefulWidget {
  const EthereumETFScreen({super.key});

  @override
  State<EthereumETFScreen> createState() => _EthereumETFScreenState();
}

class _EthereumETFScreenState extends State<EthereumETFScreen> {
  int _displayedItems = 10;
  Map<int, bool> _expandedStates = {};
  String _sortBy = 'date'; // 'date', 'total', 'blackrock', 'fidelity', etc.
  bool _sortAscending = false;

  @override
  void initState() {
    super.initState();
    // Data is loaded only during app initialization, not here
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('etf.ethereum'.tr()),
        backgroundColor: Theme.of(context).brightness == Brightness.dark
            ? const Color(0xFF0A0A0A)
            : Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          // Блок Pro
          const ProButton(),
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
                    'common.error'.tr() + ': ${etfProvider.error}',
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      etfProvider.clearError();
                      etfProvider.loadEthereumData();
                    },
                    child: Text('common.retry'.tr()),
                  ),
                ],
              ),
            );
          }

          if (etfProvider.ethereumData.isEmpty) {
            return Center(
              child: Text(
                'common.no_data'.tr(),
                style: const TextStyle(fontSize: 18),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => etfProvider.loadEthereumData(),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Заголовок и общая статистика
                  EthereumFlowCard(
                    flowData: etfProvider.ethereumData.first,
                    onTap: () {
                      // Можно добавить дополнительную логику при нажатии
                    },
                  ),
                  const SizedBox(height: 24),

                  // График потоков
                  _buildChartSection(etfProvider.ethereumData),
                  const SizedBox(height: 24),

                  // Список данных по дням
                  _buildDataList(etfProvider.ethereumData),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // Секция с графиком
  Widget _buildChartSection(List<ETFFlowData> data) {
    return PremiumChartOverlay(
      title: 'premium.ethereum_charts_title'.tr(),
      description: 'premium.ethereum_charts_desc'.tr(),
      child: Card(
        elevation: 2,
        child: Container(
          height: 450, // Увеличиваем высоту для лучшего отображения
          padding: const EdgeInsets.all(12), // Увеличиваем отступы
          child: ETFFlowBarChart(flowData: data),
        ),
      ),
    );
  }

  // Список данных по дням
  Widget _buildDataList(List<ETFFlowData> data) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Сортируем данные
    final sortedData = _sortData(data);
    final displayedData = sortedData.take(_displayedItems).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'etf.flow_history'.tr(),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            // Кнопка сортировки
            GestureDetector(
              onTap: () {
                _showSortDialog(context);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Theme.of(
                      context,
                    ).colorScheme.primary.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.sort,
                      size: 16,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _getSortDescription(),
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: displayedData.length,
          itemBuilder: (context, index) {
            final flowData = displayedData[index];
            final isLatest = index == 0; // Первый элемент (самый последний)

            // По умолчанию только первый блок развернут
            if (!_expandedStates.containsKey(index)) {
              _expandedStates[index] = isLatest;
            }

            return _buildFlowDataCard(flowData, index, isLatest);
          },
        ),

        // Кнопка "Загрузить еще"
        if (_displayedItems < data.length)
          Center(
            child: Padding(
              padding: const EdgeInsets.only(top: 16),
              child: ElevatedButton(
                onPressed: () {
                  setState(() {
                    _displayedItems = (_displayedItems + 10).clamp(
                      0,
                      data.length,
                    );
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark ? Colors.blue.shade800 : Colors.blue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                ),
                child: Text(
                  'common.load_more'.tr() +
                      ' (${data.length - _displayedItems} ' +
                      'common.remaining'.tr() +
                      ')',
                  style: const TextStyle(fontSize: 16),
                ),
              ),
            ),
          ),
      ],
    );
  }

  // Карточка с данными потока
  Widget _buildFlowDataCard(ETFFlowData flowData, int index, bool isLatest) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final date = DateTime.parse(flowData.date);
    final total = flowData.total ?? 0;
    final isPositive = total >= 0;
    final totalColor = isPositive ? Colors.green : Colors.red;
    final isExpanded = _expandedStates[index] ?? false;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? [const Color(0xFF2A2A2A), const Color(0xFF1A1A1A)]
                : [Colors.white, Colors.grey.shade50],
          ),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black26 : Colors.grey.shade300,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Заголовок с датой и общим потоком
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          Icons.calendar_today,
                          size: 20,
                          color: Colors.blue,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        DateFormat('dd.MM.yyyy').format(date),
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              totalColor.withOpacity(0.1),
                              totalColor.withOpacity(0.2),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(25),
                          border: Border.all(
                            color: totalColor.withOpacity(0.3),
                            width: 1,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: totalColor.withOpacity(0.2),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isPositive
                                  ? Icons.trending_up
                                  : Icons.trending_down,
                              color: totalColor,
                              size: 16,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              '\$${total.toStringAsFixed(1)}M',
                              style: TextStyle(
                                color: totalColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      InkWell(
                        onTap: () {
                          setState(() {
                            _expandedStates[index] = !isExpanded;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: isDark
                                ? Colors.blue.withOpacity(0.2)
                                : Colors.blue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: Colors.blue.withOpacity(0.3),
                              width: 1,
                            ),
                          ),
                          child: Icon(
                            isExpanded ? Icons.expand_less : Icons.expand_more,
                            color: Colors.blue,
                            size: 20,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              // Сетка с данными по компаниям (показываем только если развернуто)
              if (isExpanded) ...[
                const SizedBox(height: 16),
                _buildCompanyGrid(flowData),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // Общая статистика по компаниям
  // Функция для умного форматирования чисел
  String _formatLargeNumber(double value) {
    if (value >= 1000) {
      return '\$${(value / 1000).toStringAsFixed(1)}B';
    } else {
      return '\$${value.toStringAsFixed(1)}M';
    }
  }

  // Сетка с данными по компаниям
  Widget _buildCompanyGrid(ETFFlowData flowData) {
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final companyName = ETFFlowData.getCompanyName(companyKey);
    final isPositive = value != null && value >= 0;
    final color = value == null
        ? Colors.grey
        : (isPositive ? Colors.green : Colors.red);
    final displayValue = value?.toStringAsFixed(1) ?? 'N/A';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2A2A2A) : Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark ? const Color(0xFF3A3A3A) : Colors.grey[300]!,
        ),
      ),
      child: Column(
        children: [
          Text(
            companyName,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: isDark ? Colors.grey[300] : Colors.grey[700],
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

  // Показать диалог сортировки
  void _showSortDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('sorting.title'.tr()),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<String>(
                title: Text('sorting.by_date'.tr()),
                value: 'date',
                groupValue: _sortBy,
                onChanged: (value) {
                  setState(() {
                    _sortBy = value!;
                  });
                  Navigator.pop(context);
                },
              ),
              RadioListTile<String>(
                title: Text('sorting.by_total_flow'.tr()),
                value: 'total',
                groupValue: _sortBy,
                onChanged: (value) {
                  setState(() {
                    _sortBy = value!;
                  });
                  Navigator.pop(context);
                },
              ),
              RadioListTile<String>(
                title: Text('sorting.by_blackrock'.tr()),
                value: 'blackrock',
                groupValue: _sortBy,
                onChanged: (value) {
                  setState(() {
                    _sortBy = value!;
                  });
                  Navigator.pop(context);
                },
              ),
              RadioListTile<String>(
                title: Text('sorting.by_fidelity'.tr()),
                value: 'fidelity',
                groupValue: _sortBy,
                onChanged: (value) {
                  setState(() {
                    _sortBy = value!;
                  });
                  Navigator.pop(context);
                },
              ),
              RadioListTile<String>(
                title: Text('sorting.by_grayscale'.tr()),
                value: 'grayscale',
                groupValue: _sortBy,
                onChanged: (value) {
                  setState(() {
                    _sortBy = value!;
                  });
                  Navigator.pop(context);
                },
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _sortAscending = !_sortAscending;
                      });
                    },
                    child: Row(
                      children: [
                        Icon(
                          _sortAscending
                              ? Icons.arrow_upward
                              : Icons.arrow_downward,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _sortAscending
                              ? 'sorting.ascending'.tr()
                              : 'sorting.descending'.tr(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('common.cancel'.tr()),
            ),
          ],
        );
      },
    );
  }

  // Сортировка данных
  List<ETFFlowData> _sortData(List<ETFFlowData> data) {
    final sortedData = List<ETFFlowData>.from(data);

    sortedData.sort((a, b) {
      int comparison = 0;

      switch (_sortBy) {
        case 'date':
          comparison = DateTime.parse(a.date).compareTo(DateTime.parse(b.date));
          break;
        case 'total':
          comparison = (a.total ?? 0).compareTo(b.total ?? 0);
          break;
        case 'blackrock':
          comparison = (a.blackrock ?? 0).compareTo(b.blackrock ?? 0);
          break;
        case 'fidelity':
          comparison = (a.fidelity ?? 0).compareTo(b.fidelity ?? 0);
          break;
        case 'grayscale':
          comparison = (a.grayscale ?? 0).compareTo(b.grayscale ?? 0);
          break;
        default:
          comparison = DateTime.parse(a.date).compareTo(DateTime.parse(b.date));
      }

      return _sortAscending ? comparison : -comparison;
    });

    return sortedData;
  }

  // Получить описание текущей сортировки
  String _getSortDescription() {
    String sortType = '';
    switch (_sortBy) {
      case 'date':
        sortType = 'sorting.date'.tr();
        break;
      case 'total':
        sortType = 'sorting.total_flow'.tr();
        break;
      case 'blackrock':
        sortType = 'sorting.blackrock'.tr();
        break;
      case 'fidelity':
        sortType = 'sorting.fidelity'.tr();
        break;
      case 'grayscale':
        sortType = 'sorting.grayscale'.tr();
        break;
      default:
        sortType = 'sorting.date'.tr();
    }

    return '${_sortAscending ? '↑' : '↓'} $sortType';
  }
}
