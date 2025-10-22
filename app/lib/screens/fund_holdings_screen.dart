import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../providers/etf_provider.dart';
import '../widgets/holdings_table_widget.dart';
import '../utils/haptic_feedback.dart';
import '../services/flow_calculation_service.dart';
import '../utils/adaptive_text_utils.dart';

class FundHoldingsScreen extends StatefulWidget {
  const FundHoldingsScreen({super.key});

  @override
  State<FundHoldingsScreen> createState() => _FundHoldingsScreenState();
}

class _FundHoldingsScreenState extends State<FundHoldingsScreen> {
  String _sortBy = 'btc'; // 'name', 'btc', 'eth'
  bool _sortAscending =
      false; // false = descending (large to small) - по умолчанию BTC от большего к меньшему
  String _selectedPeriod =
      'day'; // 'day', 'week', 'month', 'quarter', 'half_year', 'year'
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // Data is loaded only during app initialization, not here
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<ETFProvider>(
          builder: (context, etfProvider, child) {
            // Показываем ошибку только если она есть
            if (etfProvider.error != null) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '${'common.error'.tr()}: ${etfProvider.error}',
                      style: const TextStyle(color: Colors.red),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        etfProvider.clearError();
                        etfProvider.forceRefreshAllData();
                      },
                      child: Text('common.retry'.tr()),
                    ),
                  ],
                ),
              );
            }

            if (etfProvider.ethereumData.isEmpty &&
                etfProvider.bitcoinData.isEmpty) {
              return Center(
                child: Text(
                  'common.no_data'.tr(),
                  style: const TextStyle(fontSize: 18),
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () async {
                // Вибрация при начале обновления
                HapticUtils.lightImpact();
                try {
                  await etfProvider.forceRefreshAllData();
                  // Автоматически скроллим вниз после обновления
                  if (_scrollController.hasClients) {
                    _scrollController.animateTo(
                      _scrollController.position.maxScrollExtent,
                      duration: Duration(milliseconds: 500),
                      curve: Curves.easeOut,
                    );
                  }
                  // Вибрация при успешном обновлении
                  HapticUtils.notificationSuccess();
                } catch (e) {
                  // Вибрация при ошибке
                  HapticUtils.notificationError();
                  rethrow;
                }
              },
              color: Theme.of(context).colorScheme.primary,
              backgroundColor: Theme.of(context).brightness == Brightness.dark
                  ? const Color(0xFF1C1C1E)
                  : Colors.white,
              strokeWidth: 2.5,
              displacement: 40.0,
              child: SingleChildScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                padding: AdaptiveTextUtils.getContentPadding(context),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Заголовок и кнопка сортировки
                    _buildHeader(),
                    const SizedBox(height: 16),

                    // Таблица владений
                    HoldingsTableWidget(
                      ethereumData: etfProvider.ethereumData,
                      bitcoinData: etfProvider.bitcoinData,
                      sortBy: _sortBy,
                      sortAscending: _sortAscending,
                      onSortChanged: (sortBy, ascending) {
                        setState(() {
                          _sortBy = sortBy;
                          _sortAscending = ascending;
                        });
                      },
                      selectedPeriod: _selectedPeriod,
                      separateFlowChanges:
                          FlowCalculationService.getSeparateChanges(
                            etfProvider.ethereumData,
                            etfProvider.bitcoinData,
                            _selectedPeriod,
                          ),
                      totalHoldings: FlowCalculationService.getTotalHoldings(
                        etfProvider.ethereumData,
                        etfProvider.bitcoinData,
                      ),
                    ),

                    // Добавляем дополнительное пространство для лучшего UX при pull-to-refresh
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      children: [
        Expanded(
          child: Text(
            'etf.holdings'.tr(),
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
        ),
        // Кнопка выбора периода
        GestureDetector(
          onTap: () {
            HapticUtils.lightImpact();
            _showPeriodDialog(context);
          },
          child: Container(
            width: 80, // Фиксированная ширина для одинакового размера
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Theme.of(context).colorScheme.secondary.withOpacity(0.3),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 16,
                  color: Theme.of(context).colorScheme.secondary,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    _getPeriodDescription(),
                    style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context).colorScheme.secondary,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 8),
        // Кнопка сортировки
        GestureDetector(
          onTap: () {
            HapticUtils.lightImpact();
            _showSortDialog(context);
          },
          child: Container(
            width: 80, // Фиксированная ширина для одинакового размера
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.sort,
                  size: 16,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    _getSortDescription(),
                    style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String _getSortDescription() {
    switch (_sortBy) {
      case 'name':
        return _sortAscending ? 'A-Z' : 'Z-A';
      case 'btc':
        return _sortAscending ? 'BTC ↑' : 'BTC ↓';
      case 'eth':
        return _sortAscending ? 'ETH ↑' : 'ETH ↓';
      default:
        return 'Sort';
    }
  }

  String _getPeriodDescription() {
    switch (_selectedPeriod) {
      case 'day':
        return 'holdings.period_day'.tr();
      case 'week':
        return 'holdings.period_week'.tr();
      case 'month':
        return 'holdings.period_month'.tr();
      case 'quarter':
        return 'holdings.period_3months'.tr();
      case 'half_year':
        return 'holdings.period_half_year'.tr();
      case 'year':
        return 'holdings.period_year'.tr();
      default:
        return 'holdings.period_day'.tr();
    }
  }

  void _showSortDialog(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: isDark ? const Color(0xFF1C1C1E) : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Text(
            'sorting.title'.tr(),
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildSortOption('name', 'sorting.by_name'.tr(), isDark),
              _buildSortOption('btc', 'sorting.by_btc'.tr(), isDark),
              _buildSortOption('eth', 'sorting.by_eth'.tr(), isDark),
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

  Widget _buildSortOption(String value, String title, bool isDark) {
    final isSelected = _sortBy == value;

    return ListTile(
      onTap: () {
        setState(() {
          if (_sortBy == value) {
            _sortAscending = !_sortAscending;
          } else {
            _sortBy = value;
            _sortAscending = true;
          }
        });
        Navigator.pop(context);
      },
      splashColor: Colors.transparent,
      hoverColor: Colors.transparent,
      title: Text(
        title,
        style: TextStyle(color: isDark ? Colors.white : Colors.black87),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isSelected) ...[
            Text(
              _sortAscending ? '↑' : '↓',
              style: TextStyle(
                fontSize: 16,
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Radio<String>(
            value: value,
            groupValue: _sortBy,
            onChanged: (String? newValue) {
              if (newValue != null) {
                setState(() {
                  if (_sortBy == newValue) {
                    _sortAscending = !_sortAscending;
                  } else {
                    _sortBy = newValue;
                    _sortAscending = true;
                  }
                });
                Navigator.pop(context);
              }
            },
            activeColor: Theme.of(context).colorScheme.primary,
          ),
        ],
      ),
    );
  }

  void _showPeriodDialog(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: isDark ? const Color(0xFF1C1C1E) : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Text(
            'holdings.period_changes'.tr(),
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildPeriodOption('day', 'holdings.period_day'.tr(), isDark),
              _buildPeriodOption('week', 'holdings.period_week'.tr(), isDark),
              _buildPeriodOption('month', 'holdings.period_month'.tr(), isDark),
              _buildPeriodOption(
                'quarter',
                'holdings.period_3months'.tr(),
                isDark,
              ),
              _buildPeriodOption(
                'half_year',
                'holdings.period_half_year'.tr(),
                isDark,
              ),
              _buildPeriodOption('year', 'holdings.period_year'.tr(), isDark),
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

  Widget _buildPeriodOption(String value, String title, bool isDark) {
    return ListTile(
      onTap: () {
        setState(() {
          _selectedPeriod = value;
        });
        Navigator.pop(context);
      },
      splashColor: Colors.transparent,
      hoverColor: Colors.transparent,
      title: Text(
        title,
        style: TextStyle(color: isDark ? Colors.white : Colors.black87),
      ),
      trailing: Radio<String>(
        value: value,
        groupValue: _selectedPeriod,
        onChanged: (String? newValue) {
          if (newValue != null) {
            setState(() {
              _selectedPeriod = newValue;
            });
            Navigator.pop(context);
          }
        },
        activeColor: Theme.of(context).colorScheme.secondary,
      ),
    );
  }
}
