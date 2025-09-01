import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/etf_provider.dart';
import '../services/fund_logo_service.dart';
import 'settings_screen.dart';

class FundHoldingsScreen extends StatefulWidget {
  const FundHoldingsScreen({super.key});

  @override
  State<FundHoldingsScreen> createState() => _FundHoldingsScreenState();
}

class _FundHoldingsScreenState extends State<FundHoldingsScreen> {
  String _sortBy = 'current'; // 'current', 'total', 'eth', 'btc', 'name'
  bool _sortAscending = false; // false = по убыванию (большие значения сверху)
  int _selectedTabIndex = 0; // 0 - Общее, 1 - Эфир, 2 - Биткоин

  @override
  void initState() {
    super.initState();
    // Данные загружаются только при инициализации приложения, не здесь
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
            icon: const Icon(Icons.sort),
            onPressed: () {
              _showSortDialog(context);
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<ETFProvider>().forceRefreshAllData();
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
                      etfProvider.forceRefreshAllData();
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
              onRefresh: () => etfProvider.forceRefreshAllData(),
            child: Column(
              children: [
                // Табы
                _buildTabBar(),
                // Контент
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                                      child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildFundHoldingsList(etfProvider.fundHoldings!),
                    ],
                  ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }



  Widget _buildFundHoldingsList(Map<String, dynamic> holdings) {
    final fundHoldings = holdings['fundHoldings'] as Map<String, dynamic>;

    // Фильтруем фонды в зависимости от выбранного таба
    final filteredEntries = _filterFundHoldings(fundHoldings.entries.toList());

    // Сортируем фонды
    final sortedEntries = _sortFundHoldings(filteredEntries);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _getTabTitle(),
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            Text(
              _getSortDescription(),
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...sortedEntries.map((entry) {
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
                  _buildTabContent(fundData),
                ],
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildFundItem(String label, String value, Color color, {bool isFullWidth = false}) {
    return Container(
      width: isFullWidth ? double.infinity : null,
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

  // Построить табы
  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
        ),
      ),
      child: Row(
        children: [
          _buildTabItem('Общее', 0, Icons.account_balance),
          _buildTabItem('Эфир', 1, Icons.currency_exchange),
          _buildTabItem('Биткоин', 2, Icons.currency_bitcoin),
        ],
      ),
    );
  }

  // Построить элемент таба
  Widget _buildTabItem(String title, int index, IconData icon) {
    final isSelected = _selectedTabIndex == index;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedTabIndex = index;
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? Theme.of(context).colorScheme.primary
                : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                color: isSelected
                    ? Colors.white
                    : (isDark ? Colors.grey[400] : Colors.grey[600]),
                size: 20,
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  color: isSelected
                      ? Colors.white
                      : (isDark ? Colors.grey[400] : Colors.grey[600]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Получить заголовок таба
  String _getTabTitle() {
    switch (_selectedTabIndex) {
      case 0:
        return 'Общее Владение';
      case 1:
        return 'Владение Ethereum';
      case 2:
        return 'Владение Bitcoin';
      default:
        return 'Владение по Фондам';
    }
  }

  // Построить контент в зависимости от выбранного таба
  Widget _buildTabContent(Map<String, dynamic> fundData) {
    switch (_selectedTabIndex) {
      case 0:
        // Общее владение - показываем оба значения
        return Row(
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
        );
      case 1:
        // Только Ethereum
        return _buildFundItem(
          'ETH',
          _formatLargeNumber(fundData['eth']),
          Colors.blue,
          isFullWidth: true,
        );
      case 2:
        // Только Bitcoin
        return _buildFundItem(
          'BTC',
          _formatLargeNumber(fundData['btc']),
          Colors.orange,
          isFullWidth: true,
        );
      default:
        return const SizedBox.shrink();
    }
  }

  // Показать диалог сортировки
  void _showSortDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Сортировка'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<String>(
                title: const Text('По текущему табу (по умолчанию)'),
                value: 'current',
                groupValue: _sortBy,
                onChanged: (value) {
                  setState(() {
                    _sortBy = value!;
                  });
                  Navigator.pop(context);
                },
              ),
              RadioListTile<String>(
                title: const Text('По общему владению'),
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
                title: const Text('По Ethereum'),
                value: 'eth',
                groupValue: _sortBy,
                onChanged: (value) {
                  setState(() {
                    _sortBy = value!;
                  });
                  Navigator.pop(context);
                },
              ),
              RadioListTile<String>(
                title: const Text('По Bitcoin'),
                value: 'btc',
                groupValue: _sortBy,
                onChanged: (value) {
                  setState(() {
                    _sortBy = value!;
                  });
                  Navigator.pop(context);
                },
              ),
              RadioListTile<String>(
                title: const Text('По названию'),
                value: 'name',
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
                        Icon(_sortAscending ? Icons.arrow_upward : Icons.arrow_downward),
                        const SizedBox(width: 8),
                        Text(_sortAscending ? 'По возрастанию' : 'По убыванию'),
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
              child: const Text('Отмена'),
            ),
          ],
        );
      },
    );
  }

  // Фильтрация фондов в зависимости от выбранного таба
  List<MapEntry<String, dynamic>> _filterFundHoldings(List<MapEntry<String, dynamic>> entries) {
    switch (_selectedTabIndex) {
      case 0: // Общее - показываем все фонды
        return entries;
      case 1: // Ethereum - показываем только Ethereum фонды
        return entries.where((entry) {
          final fundKey = entry.key;
          // Ethereum фонды: blackrock, fidelity, bitwise, twentyOneShares, vanEck, invesco, franklin, grayscale, grayscaleCrypto
          return ['blackrock', 'fidelity', 'bitwise', 'twentyOneShares', 'vanEck', 'invesco', 'franklin', 'grayscale', 'grayscaleCrypto'].contains(fundKey);
        }).toList();
      case 2: // Bitcoin - показываем только Bitcoin фонды
        return entries.where((entry) {
          final fundKey = entry.key;
          // Bitcoin фонды: все Ethereum + valkyrie, wisdomTree
          return ['blackrock', 'fidelity', 'bitwise', 'twentyOneShares', 'vanEck', 'invesco', 'franklin', 'grayscale', 'grayscaleCrypto', 'valkyrie', 'wisdomTree'].contains(fundKey);
        }).toList();
      default:
        return entries;
    }
  }

  // Сортировка фондов
  List<MapEntry<String, dynamic>> _sortFundHoldings(List<MapEntry<String, dynamic>> entries) {
    entries.sort((a, b) {
      final aData = a.value as Map<String, dynamic>;
      final bData = b.value as Map<String, dynamic>;
      
      int comparison = 0;
      
      switch (_sortBy) {
        case 'total':
          final aTotal = (aData['eth'] ?? 0) + (aData['btc'] ?? 0);
          final bTotal = (bData['eth'] ?? 0) + (bData['btc'] ?? 0);
          comparison = aTotal.compareTo(bTotal);
          break;
        case 'eth':
          comparison = (aData['eth'] ?? 0).compareTo(bData['eth'] ?? 0);
          break;
        case 'btc':
          comparison = (aData['btc'] ?? 0).compareTo(bData['btc'] ?? 0);
          break;
        case 'name':
          final aName = _getFundDisplayName(a.key);
          final bName = _getFundDisplayName(b.key);
          comparison = aName.compareTo(bName);
          break;
        case 'current':
          // Сортировка по текущему выбранному табу
          switch (_selectedTabIndex) {
            case 0: // Общее
              final aTotal = (aData['eth'] ?? 0) + (aData['btc'] ?? 0);
              final bTotal = (bData['eth'] ?? 0) + (bData['btc'] ?? 0);
              comparison = aTotal.compareTo(bTotal);
              break;
            case 1: // Ethereum
              comparison = (aData['eth'] ?? 0).compareTo(bData['eth'] ?? 0);
              break;
            case 2: // Bitcoin
              comparison = (aData['btc'] ?? 0).compareTo(bData['btc'] ?? 0);
              break;
            default:
              comparison = 0;
          }
          break;
      }
      
      return _sortAscending ? comparison : -comparison;
    });
    
    return entries;
  }

  // Получить описание текущей сортировки
  String _getSortDescription() {
    String sortType = '';
    switch (_sortBy) {
      case 'current':
        switch (_selectedTabIndex) {
          case 0:
            sortType = 'Общее владение';
            break;
          case 1:
            sortType = 'Ethereum';
            break;
          case 2:
            sortType = 'Bitcoin';
            break;
          default:
            sortType = 'Текущий таб';
        }
        break;
      case 'total':
        sortType = 'Общее владение';
        break;
      case 'eth':
        sortType = 'Ethereum';
        break;
      case 'btc':
        sortType = 'Bitcoin';
        break;
      case 'name':
        sortType = 'Название';
        break;
    }
    
    return '${_sortAscending ? '↑' : '↓'} $sortType';
  }
}
