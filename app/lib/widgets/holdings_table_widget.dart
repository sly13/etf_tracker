import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../models/etf_flow_data.dart';
// import '../services/fund_logo_service.dart';
import '../utils/card_style_utils.dart';

class HoldingsTableWidget extends StatefulWidget {
  final List<ETFFlowData> ethereumData;
  final List<BTCFlowData> bitcoinData;
  final String sortBy;
  final bool sortAscending;
  final Function(String, bool) onSortChanged;
  final String selectedPeriod;
  final String? selectedAsset; // Для фильтрации по активу
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
    this.selectedAsset,
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
      decoration: CardStyleUtils.getCardDecoration(context),
      child: Padding(
        padding: CardStyleUtils.getCardPadding(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Заголовок таблицы
            _buildTableHeader(context, isDark),
            SizedBox(height: CardStyleUtils.getSpacing(context)),
            // Данные таблицы - каждая компания как строка
            ...tableData.asMap().entries.map((entry) {
              final index = entry.key;
              final data = entry.value;
              return Column(
                children: [
                  _buildTableRow(context, data, isDark),
                  if (index < tableData.length - 1) ...[
                    const SizedBox(height: 12),
                    Divider(
                      height: 1,
                      thickness: 1,
                      color: CardStyleUtils.getDividerColor(context),
                    ),
                    const SizedBox(height: 12),
                  ],
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildTableHeader(BuildContext context, bool isDark) {
    // Адаптивные размеры для разных экранов
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmallScreen = screenWidth < 375;
    final columnSpacing = isSmallScreen ? 16.0 : 20.0;
    final columnPadding = isSmallScreen ? 2.0 : 4.0;

    return Row(
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
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: CardStyleUtils.getSubtitleColor(context),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    _getSortIcon('name'),
                    size: 14,
                    color: widget.sortBy == 'name'
                        ? CardStyleUtils.getTitleColor(context)
                        : CardStyleUtils.getSubtitleColor(context),
                  ),
                ],
              ),
            ),
          ),
          // Вертикальный разделитель между столбцом компании и остальными
          Container(
            width: 1,
            margin: EdgeInsets.symmetric(horizontal: columnSpacing / 2),
            color: CardStyleUtils.getDividerColor(context),
          ),
          // BTC колонка
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: columnPadding),
              child: GestureDetector(
                onTap: () => _handleSort('btc'),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerRight,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'BTC',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.orange,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        _getSortIcon('btc'),
                        size: 14,
                        color: widget.sortBy == 'btc'
                            ? Colors.orange
                            : CardStyleUtils.getSubtitleColor(context),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SizedBox(width: columnSpacing),
          // ETH колонка
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: columnPadding),
              child: GestureDetector(
                onTap: () => _handleSort('eth'),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerRight,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'ETH',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.blue,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        _getSortIcon('eth'),
                        size: 14,
                        color: widget.sortBy == 'eth'
                            ? Colors.blue
                            : CardStyleUtils.getSubtitleColor(context),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SizedBox(width: columnSpacing),
          // SOL колонка
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: columnPadding),
              child: GestureDetector(
                onTap: () => _handleSort('sol'),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerRight,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'SOL',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.purple,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        _getSortIcon('sol'),
                        size: 14,
                        color: widget.sortBy == 'sol'
                            ? Colors.purple
                            : CardStyleUtils.getSubtitleColor(context),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
    );
  }

  Widget _buildTableRow(BuildContext context, Map<String, dynamic> data, bool isDark) {
    final company = data['company'] as String;
    final btcValue = data['btc'] as double?;
    final ethValue = data['eth'] as double?;
    final solValue = data['sol'] as double?;

    // Адаптивные размеры для разных экранов
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmallScreen = screenWidth < 375;
    final columnSpacing = isSmallScreen ? 16.0 : 20.0;
    final columnPadding = isSmallScreen ? 2.0 : 4.0;
    final valueFontSize = isSmallScreen ? 11.0 : 12.0;
    final changeFontSize = isSmallScreen ? 10.0 : 11.0;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Колонка с названием компании
          Expanded(
            flex: 2,
            child: Text(
              company,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: CardStyleUtils.getTitleColor(context),
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          // Вертикальный разделитель между столбцом компании и остальными
          Container(
            width: 1,
            margin: EdgeInsets.symmetric(horizontal: columnSpacing / 2),
            color: CardStyleUtils.getDividerColor(context),
          ),
          // BTC значение
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: columnPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisSize: MainAxisSize.min,
                children: [
                  ClipRect(
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerRight,
                      child: Text(
                        btcValue != null ? _formatValue(btcValue) : '—',
                        style: TextStyle(
                          fontSize: valueFontSize,
                          fontWeight: FontWeight.bold,
                          color: btcValue != null ? Colors.orange : CardStyleUtils.getSubtitleColor(context),
                        ),
                        textAlign: TextAlign.right,
                        softWrap: false,
                        overflow: TextOverflow.clip,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  _buildFlowChange(company, 'BTC', isDark, changeFontSize),
                ],
              ),
            ),
          ),
          SizedBox(width: columnSpacing),
          // ETH значение
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: columnPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisSize: MainAxisSize.min,
                children: [
                  ClipRect(
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerRight,
                      child: Text(
                        ethValue != null ? _formatValue(ethValue) : '—',
                        style: TextStyle(
                          fontSize: valueFontSize,
                          fontWeight: FontWeight.bold,
                          color: ethValue != null ? Colors.blue : CardStyleUtils.getSubtitleColor(context),
                        ),
                        textAlign: TextAlign.right,
                        softWrap: false,
                        overflow: TextOverflow.clip,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  _buildFlowChange(company, 'ETH', isDark, changeFontSize),
                ],
              ),
            ),
          ),
          SizedBox(width: columnSpacing),
          // SOL значение
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: columnPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisSize: MainAxisSize.min,
                children: [
                  ClipRect(
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerRight,
                      child: Text(
                        solValue != null ? _formatValue(solValue) : '—',
                        style: TextStyle(
                          fontSize: valueFontSize,
                          fontWeight: FontWeight.bold,
                          color: solValue != null ? Colors.purple : CardStyleUtils.getSubtitleColor(context),
                        ),
                        textAlign: TextAlign.right,
                        softWrap: false,
                        overflow: TextOverflow.clip,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  _buildFlowChange(company, 'SOL', isDark, changeFontSize),
                ],
              ),
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
        'sol': holdings['SOL'],
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
        case 'sol':
          final aSol = a['sol'] as double? ?? 0;
          final bSol = b['sol'] as double? ?? 0;
          return widget.sortAscending
              ? aSol.compareTo(bSol)
              : bSol.compareTo(aSol);
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
      // Для больших чисел используем 1 знак после запятой для компактности
      return '$prefix${(absValue / 1000).toStringAsFixed(1)}B';
    } else {
      // Для миллионов также используем 1 знак после запятой
      return '$prefix${absValue.toStringAsFixed(1)}M';
    }
  }

  // Widget _buildCompanyLogo(String companyName) {
  //   // Преобразуем название компании в ключ для логотипа
  //   String logoKey = _getCompanyLogoKey(companyName);
  //   final isDark = Theme.of(context).brightness == Brightness.dark;

  //   return Container(
  //     width: 40,
  //     height: 40,
  //     decoration: BoxDecoration(
  //       color: isDark ? const Color(0xFF2A2A2A) : Colors.grey[100],
  //       borderRadius: BorderRadius.circular(8),
  //     ),
  //     child: ClipRRect(
  //       borderRadius: BorderRadius.circular(8),
  //       child:
  //           FundLogoService.getLogoWidget(
  //             logoKey,
  //             width: 40,
  //             height: 40,
  //             fit: BoxFit.contain,
  //           ) ??
  //           Container(
  //             width: 40,
  //             height: 40,
  //             decoration: BoxDecoration(
  //               color: isDark ? const Color(0xFF2A2A2A) : Colors.grey[100],
  //               borderRadius: BorderRadius.circular(8),
  //             ),
  //             child: Icon(
  //               Icons.account_balance,
  //               size: 20,
  //               color: CardStyleUtils.getSubtitleColor(context),
  //             ),
  //           ),
  //     ),
  //   );
  // }

  // String _getCompanyLogoKey(String companyName) {
  //   switch (companyName) {
  //     case 'BlackRock':
  //       return 'blackrock';
  //     case 'Fidelity':
  //       return 'fidelity';
  //     case 'Bitwise':
  //       return 'bitwise';
  //     case '21Shares':
  //       return 'twentyOneShares';
  //     case 'VanEck':
  //       return 'vanEck';
  //     case 'Invesco':
  //       return 'invesco';
  //     case 'Franklin Templeton':
  //       return 'franklin';
  //     case 'Grayscale':
  //       return 'grayscale';
  //     case 'Valkyrie':
  //       return 'valkyrie';
  //     case 'WisdomTree':
  //       return 'wisdomTree';
  //     default:
  //       return companyName.toLowerCase();
  //   }
  // }

  Widget _buildFlowChange(String companyName, String type, bool isDark, double fontSize) {
    final companyChanges = widget.separateFlowChanges[companyName];
    final change = companyChanges?[type];

    if (change == null || change == 0) {
      return ClipRect(
        child: FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerRight,
          child: Text(
            '0.0',
            style: TextStyle(
              fontSize: fontSize,
              color: CardStyleUtils.getSubtitleColor(context),
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.right,
            softWrap: false,
            overflow: TextOverflow.clip,
          ),
        ),
      );
    }

    final isPositive = change > 0;
    final color = isPositive ? Colors.green : Colors.red;
    final sign = isPositive ? '+' : '-';

    return ClipRect(
      child: FittedBox(
        fit: BoxFit.scaleDown,
        alignment: Alignment.centerRight,
        child: Text(
          '$sign${_formatValue(change.abs())}',
          style: TextStyle(
            fontSize: fontSize,
            color: color,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.right,
          softWrap: false,
          overflow: TextOverflow.clip,
        ),
      ),
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
