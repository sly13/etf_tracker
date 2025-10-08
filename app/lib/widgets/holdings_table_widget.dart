import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../models/etf_flow_data.dart';
import '../services/fund_logo_service.dart';

class HoldingsTableWidget extends StatefulWidget {
  final List<ETFFlowData> ethereumData;
  final List<BTCFlowData> bitcoinData;
  final String sortBy;
  final bool sortAscending;
  final Function(String, bool) onSortChanged;
  final String selectedPeriod;
  final Map<String, Map<String, double>> separateFlowChanges;
  final Map<String, Map<String, double>> totalHoldings;

  const HoldingsTableWidget({
    super.key,
    required this.ethereumData,
    required this.bitcoinData,
    required this.sortBy,
    required this.sortAscending,
    required this.onSortChanged,
    required this.selectedPeriod,
    required this.separateFlowChanges,
    required this.totalHoldings,
  });

  @override
  State<HoldingsTableWidget> createState() => _HoldingsTableWidgetState();
}

class _HoldingsTableWidgetState extends State<HoldingsTableWidget> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Получаем данные для таблицы
    final tableData = _getTableData();

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1C1C1E) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? Colors.grey[800]! : Colors.grey[300]!,
          width: 1,
        ),
      ),
      child: Column(
        children: [
          // Заголовок таблицы
          _buildTableHeader(isDark),
          // Данные таблицы
          ...tableData.map((data) => _buildTableRow(data, isDark)),
        ],
      ),
    );
  }

  Widget _buildTableHeader(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[900] : Colors.grey[50],
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(12),
          topRight: Radius.circular(12),
        ),
      ),
      child: Row(
        children: [
          // Название компании
          Expanded(
            flex: 2,
            child: GestureDetector(
              onTap: () => _handleSort('name'),
              child: Row(
                children: [
                  Text(
                    'holdings.company'.tr(),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    _getSortIcon('name'),
                    size: 16,
                    color: widget.sortBy == 'name'
                        ? (isDark ? Colors.white : Colors.black87)
                        : (isDark ? Colors.grey[400] : Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ),
          // BTC колонка
          Expanded(
            child: GestureDetector(
              onTap: () => _handleSort('btc'),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'BTC',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.orange,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    _getSortIcon('btc'),
                    size: 16,
                    color: widget.sortBy == 'btc'
                        ? Colors.orange
                        : (isDark ? Colors.grey[400] : Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ),
          // ETH колонка
          Expanded(
            child: GestureDetector(
              onTap: () => _handleSort('eth'),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'ETH',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    _getSortIcon('eth'),
                    size: 16,
                    color: widget.sortBy == 'eth'
                        ? Colors.blue
                        : (isDark ? Colors.grey[400] : Colors.grey[600]),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTableRow(Map<String, dynamic> data, bool isDark) {
    final company = data['company'] as String;
    final btcValue = data['btc'] as double?;
    final ethValue = data['eth'] as double?;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: isDark ? Colors.grey[800]! : Colors.grey[200]!,
            width: 0.5,
          ),
        ),
      ),
      child: Row(
        children: [
          // Колонка с логотипом и названием компании
          Expanded(
            flex: 2,
            child: Row(
              children: [
                // Логотип компании
                _buildCompanyLogo(company),
                const SizedBox(width: 8),
                // Название компании
                Expanded(
                  child: Text(
                    company,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // BTC значение
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  btcValue != null ? _formatValue(btcValue) : '-',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: btcValue != null ? Colors.orange : Colors.grey,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                _buildFlowChange(company, 'BTC', isDark),
              ],
            ),
          ),
          // ETH значение
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  ethValue != null ? _formatValue(ethValue) : '-',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: ethValue != null ? Colors.blue : Colors.grey,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                _buildFlowChange(company, 'ETH', isDark),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _getTableData() {
    final List<Map<String, dynamic>> data = [];

    // Используем данные из totalHoldings (данные из последнего дня)
    for (var entry in widget.totalHoldings.entries) {
      final company = entry.key;
      final holdings = entry.value;

      data.add({
        'company': company,
        'btc': holdings['BTC'],
        'eth': holdings['ETH'],
      });
    }

    // Сортируем данные
    data.sort((a, b) {
      switch (widget.sortBy) {
        case 'name':
          return widget.sortAscending
              ? a['company'].compareTo(b['company'])
              : b['company'].compareTo(a['company']);
        case 'btc':
          final aBtc = a['btc'] as double? ?? 0;
          final bBtc = b['btc'] as double? ?? 0;
          return widget.sortAscending
              ? aBtc.compareTo(bBtc)
              : bBtc.compareTo(aBtc);
        case 'eth':
          final aEth = a['eth'] as double? ?? 0;
          final bEth = b['eth'] as double? ?? 0;
          return widget.sortAscending
              ? aEth.compareTo(bEth)
              : bEth.compareTo(aEth);
        default:
          return 0;
      }
    });

    return data;
  }

  String _formatValue(double value) {
    final absValue = value.abs();
    final prefix = value < 0 ? '\$-' : '\$';

    if (absValue >= 1000) {
      return '$prefix${(absValue / 1000).toStringAsFixed(2)}B';
    } else {
      return '$prefix${absValue.toStringAsFixed(2)}M';
    }
  }

  Widget _buildCompanyLogo(String companyName) {
    // Преобразуем название компании в ключ для логотипа
    String logoKey = _getCompanyLogoKey(companyName);

    return Container(
      width: 50,
      height: 20,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: Colors.grey.withOpacity(0.3), width: 0.5),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child:
            FundLogoService.getLogoWidget(
              logoKey,
              width: 50,
              height: 20,
              fit: BoxFit.contain,
            ) ??
            Container(
              width: 50,
              height: 20,
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(4),
              ),
              child: Icon(
                Icons.account_balance,
                size: 12,
                color: Colors.grey[600],
              ),
            ),
      ),
    );
  }

  String _getCompanyLogoKey(String companyName) {
    switch (companyName) {
      case 'BlackRock':
        return 'blackrock';
      case 'Fidelity':
        return 'fidelity';
      case 'Bitwise':
        return 'bitwise';
      case '21Shares':
        return 'twentyOneShares';
      case 'VanEck':
        return 'vanEck';
      case 'Invesco':
        return 'invesco';
      case 'Franklin Templeton':
        return 'franklin';
      case 'Grayscale':
        return 'grayscale';
      case 'Valkyrie':
        return 'valkyrie';
      case 'WisdomTree':
        return 'wisdomTree';
      default:
        return companyName.toLowerCase();
    }
  }

  Widget _buildFlowChange(String companyName, String type, bool isDark) {
    final companyChanges = widget.separateFlowChanges[companyName];
    final change = companyChanges?[type];

    if (change == null || change == 0) {
      return Text(
        '0.0',
        style: TextStyle(
          fontSize: 10,
          color: Colors.grey[600],
          fontWeight: FontWeight.w500,
        ),
        textAlign: TextAlign.center,
      );
    }

    // Отладочная информация
    print('🔍 FlowChange Debug: $companyName $type = $change');

    final isPositive = change > 0;
    final color = isPositive ? Colors.green : Colors.red;
    final sign = isPositive ? '+' : '-';

    return Text(
      '$sign${_formatValue(change.abs())}',
      style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w500),
      textAlign: TextAlign.center,
    );
  }

  /// Обработка клика по сортировке
  void _handleSort(String column) {
    bool newSortAscending = true;

    // Если кликаем по той же колонке, меняем направление сортировки
    if (widget.sortBy == column) {
      newSortAscending = !widget.sortAscending;
    }

    widget.onSortChanged(column, newSortAscending);
  }

  /// Получить иконку сортировки
  IconData _getSortIcon(String column) {
    if (widget.sortBy == column) {
      return widget.sortAscending
          ? Icons.keyboard_arrow_up
          : Icons.keyboard_arrow_down;
    }
    return Icons.keyboard_arrow_up; // По умолчанию показываем стрелку вверх
  }
}
