import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:easy_localization/easy_localization.dart';
import '../models/etf_flow_data.dart';
import '../utils/adaptive_text_utils.dart';

class FlowCalendar extends StatefulWidget {
  final List<dynamic> flowData;
  final String title;

  const FlowCalendar({super.key, required this.flowData, required this.title});

  @override
  State<FlowCalendar> createState() => _FlowCalendarState();
}

class _FlowCalendarState extends State<FlowCalendar> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  Map<DateTime, List<dynamic>> _events = {};
  final Set<String> _expandedCompanyKeys = {};

  @override
  void initState() {
    super.initState();
    _selectedDay = DateTime.now();
    _loadEvents();
  }

  @override
  void didUpdateWidget(FlowCalendar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.flowData != widget.flowData) {
      _loadEvents();
    }
  }

  void _loadEvents() {
    _events = {};
    for (final data in widget.flowData) {
      final date = DateTime.parse(data.date);
      final day = DateTime(date.year, date.month, date.day);

      if (_events[day] == null) {
        _events[day] = [];
      }
      _events[day]!.add(data);
    }
  }

  List<dynamic> _getEventsForDay(DateTime day) {
    final normalizedDay = DateTime(day.year, day.month, day.day);
    return _events[normalizedDay] ?? [];
  }

  double _getTotalForDay(DateTime day) {
    final events = _getEventsForDay(day);
    return events.fold<double>(0, (sum, event) => sum + (event.total ?? 0));
  }

  double _getTotalForMonth(DateTime month) {
    double total = 0;
    final firstDay = DateTime(month.year, month.month, 1);
    final lastDay = DateTime(month.year, month.month + 1, 0);

    for (
      DateTime day = firstDay;
      day.isBefore(lastDay.add(const Duration(days: 1)));
      day = day.add(const Duration(days: 1))
    ) {
      total += _getTotalForDay(day);
    }

    return total;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1A1A1A) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black26 : Colors.grey.shade300,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Заголовок
          Padding(
            padding: AdaptiveTextUtils.getCardPadding(context),
            child: Row(
              children: [
                Text(
                  widget.title,
                  style: AdaptiveTextUtils.createAdaptiveTextStyle(
                    context,
                    'headlineSmall',
                    fontWeight: FontWeight.bold,
                    customBaseSize: 18.0,
                  ),
                ),
                const Spacer(),
                if (_selectedDay != null)
                  Text(
                    _formatAmount(_getTotalForMonth(_focusedDay)),
                    style: AdaptiveTextUtils.createAdaptiveTextStyle(
                      context,
                      'bodyMedium',
                      fontWeight: FontWeight.bold,
                      color: _getTotalForMonth(_focusedDay) >= 0
                          ? Colors.green
                          : Colors.red,
                      customBaseSize: 14.0,
                    ),
                  ),
              ],
            ),
          ),

          // Календарь
          TableCalendar<dynamic>(
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.utc(2030, 12, 31),
            focusedDay: _focusedDay,
            selectedDayPredicate: (day) {
              return isSameDay(_selectedDay, day);
            },
            eventLoader: (day) => _getEventsForDay(day),
            startingDayOfWeek: StartingDayOfWeek.monday,
            calendarBuilders: CalendarBuilders(
              defaultBuilder: (context, day, focusedDay) {
                final total = _getTotalForDay(day);
                final hasData = _getEventsForDay(day).isNotEmpty;

                if (!hasData) return null;

                return Container(
                  margin: const EdgeInsets.all(2.0),
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '${day.day}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: total >= 0
                              ? Colors.green.withOpacity(0.2)
                              : Colors.red.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _formatAmount(total),
                          style: TextStyle(
                            fontSize: 8,
                            color: total >= 0 ? Colors.green : Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
              selectedBuilder: (context, day, focusedDay) {
                final total = _getTotalForDay(day);
                final hasData = _getEventsForDay(day).isNotEmpty;

                if (!hasData) return null;

                return Container(
                  margin: const EdgeInsets.all(2.0),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.orange,
                    shape: BoxShape.circle,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '${day.day}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: total >= 0
                              ? Colors.green.withOpacity(0.8)
                              : Colors.red.withOpacity(0.8),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _formatAmount(total),
                          style: const TextStyle(
                            fontSize: 8,
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
              todayBuilder: (context, day, focusedDay) {
                final total = _getTotalForDay(day);
                final hasData = _getEventsForDay(day).isNotEmpty;

                if (!hasData) return null;

                return Container(
                  margin: const EdgeInsets.all(2.0),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.3),
                    shape: BoxShape.circle,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '${day.day}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: total >= 0
                              ? Colors.green.withOpacity(0.2)
                              : Colors.red.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _formatAmount(total),
                          style: TextStyle(
                            fontSize: 8,
                            color: total >= 0 ? Colors.green : Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            calendarStyle: CalendarStyle(
              outsideDaysVisible: false,
              weekendTextStyle: TextStyle(
                color: isDark ? Colors.grey[400] : Colors.grey[600],
              ),
              defaultTextStyle: TextStyle(
                color: isDark ? Colors.white : Colors.black,
              ),
              selectedDecoration: BoxDecoration(
                color: Colors.orange,
                shape: BoxShape.circle,
              ),
              todayDecoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.3),
                shape: BoxShape.circle,
              ),
              markersMaxCount:
                  0, // Убираем маркеры, так как используем кастомные билдеры
            ),
            headerStyle: HeaderStyle(
              formatButtonVisible: false,
              titleCentered: true,
              titleTextStyle: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black,
              ),
              leftChevronIcon: Icon(
                Icons.chevron_left,
                color: isDark ? Colors.white : Colors.black,
              ),
              rightChevronIcon: Icon(
                Icons.chevron_right,
                color: isDark ? Colors.white : Colors.black,
              ),
            ),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
              _showDayDetailsModal(selectedDay);
            },
            onPageChanged: (focusedDay) {
              setState(() {
                _focusedDay = focusedDay;
              });
            },
          ),

          // Убираем старый блок с деталями, теперь используем модальное окно
        ],
      ),
    );
  }

  void _showDayDetailsModal(DateTime selectedDay) {
    final events = _getEventsForDay(selectedDay);
    final total = _getTotalForDay(selectedDay);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final Set<String> expandedKeys = {};

    if (events.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '${'etf.no_data_for_date'.tr()} ${DateFormat('yyyy-MM-dd').format(selectedDay)}',
          ),
          backgroundColor: isDark ? Colors.grey[800] : Colors.grey[600],
        ),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1A1A1A) : Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
        ),
        child: Column(
          children: [
            // Заголовок модального окна
            Container(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Индикатор перетаскивания
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[600] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Заголовок с датой и общей суммой
                  Row(
                    children: [
                      Text(
                        DateFormat('yyyy-MM-dd').format(selectedDay),
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black,
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: total >= 0 ? Colors.green : Colors.red,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          _formatAmount(total),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Разделитель
            Container(
              height: 1,
              color: isDark ? Colors.grey[700] : Colors.grey[200],
            ),

            // Список компаний (локальное состояние внутри модалки)
            Expanded(
              child: StatefulBuilder(
                builder: (context, setModalState) {
                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 16,
                    ),
                    itemCount: events.length,
                    itemBuilder: (context, index) {
                      final event = events[index];
                      return _buildCompanyItemWithExpansion(
                        event,
                        isDark,
                        expandedKeys,
                        (key) => setModalState(() {
                          if (expandedKeys.contains(key)) {
                            expandedKeys.remove(key);
                          } else {
                            expandedKeys.add(key);
                          }
                        }),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompanyItem(dynamic event, bool isDark) {
    // Получаем все компании с данными
    List<MapEntry<String, double?>> companies = [];

    if (event is ETFFlowData) {
      companies = event.getCompanies();
    } else if (event is BTCFlowData) {
      companies = event.getCompanies();
    } else if (event is CombinedFlowData) {
      companies = event.companies.entries
          .map((e) => MapEntry(e.key, e.value))
          .toList();
    }

    // Фильтруем только компании с ненулевыми значениями и сортируем по сумме
    final companiesWithData =
        companies
            .where((entry) => entry.value != null && entry.value != 0)
            .toList()
          ..sort(
            (a, b) => (b.value ?? 0).abs().compareTo((a.value ?? 0).abs()),
          );

    if (companiesWithData.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      children: companiesWithData.map((entry) {
        String companyName;
        if (event is ETFFlowData) {
          companyName = ETFFlowData.getCompanyName(entry.key);
        } else if (event is BTCFlowData) {
          companyName = BTCFlowData.getCompanyName(entry.key);
        } else {
          // Combined: пройдём через оба маппера, если не нашли — исходный ключ
          companyName = ETFFlowData.getCompanyName(
            BTCFlowData.getCompanyName(entry.key) == entry.key
                ? entry.key
                : BTCFlowData.getCompanyName(entry.key),
          );
        }
        final amount = entry.value ?? 0;
        final isPositive = amount >= 0;

        return InkWell(
          onTap: () {
            if (event is CombinedFlowData) {
              setState(() {
                if (_expandedCompanyKeys.contains(entry.key)) {
                  _expandedCompanyKeys.remove(entry.key);
                } else {
                  _expandedCompanyKeys.add(entry.key);
                }
              });
            }
          },
          child: Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF2A2A2A) : Colors.grey[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isDark ? Colors.grey[600]! : Colors.grey[200]!,
                width: 1,
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    // Иконка компании
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: isPositive
                            ? Colors.green.withOpacity(0.15)
                            : Colors.red.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(
                        isPositive ? Icons.trending_up : Icons.trending_down,
                        color: isPositive ? Colors.green : Colors.red,
                        size: 16,
                      ),
                    ),

                    const SizedBox(width: 12),

                    // Название компании
                    Expanded(
                      child: Text(
                        companyName,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : Colors.black,
                        ),
                      ),
                    ),

                    // Сумма
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: isPositive
                            ? Colors.green.withOpacity(0.1)
                            : Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        _formatAmount(amount),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isPositive ? Colors.green : Colors.red,
                        ),
                      ),
                    ),
                  ],
                ),
                if (event is CombinedFlowData &&
                    _expandedCompanyKeys.contains(entry.key))
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Builder(
                      builder: (context) {
                        final br = _buildAssetRow(
                          'Bitcoin',
                          event.companiesByAsset['bitcoin']?[entry.key] ?? 0,
                          isDark,
                        );
                        final er = _buildAssetRow(
                          'Ethereum',
                          event.companiesByAsset['ethereum']?[entry.key] ?? 0,
                          isDark,
                        );
                        final sr = _buildAssetRow(
                          'Solana',
                          event.companiesByAsset['solana']?[entry.key] ?? 0,
                          isDark,
                        );
                        return Column(
                          children: [
                            if (br != null) br,
                            if (er != null) er,
                            if (sr != null) sr,
                          ],
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildCompanyItemWithExpansion(
    dynamic event,
    bool isDark,
    Set<String> expandedKeys,
    void Function(String key) toggle,
  ) {
    // Получаем все компании с данными
    List<MapEntry<String, double?>> companies = [];

    if (event is ETFFlowData) {
      companies = event.getCompanies();
    } else if (event is BTCFlowData) {
      companies = event.getCompanies();
    } else if (event is CombinedFlowData) {
      companies = event.companies.entries
          .map((e) => MapEntry(e.key, e.value))
          .toList();
    }

    final companiesWithData =
        companies
            .where((entry) => entry.value != null && entry.value != 0)
            .toList()
          ..sort(
            (a, b) => (b.value ?? 0).abs().compareTo((a.value ?? 0).abs()),
          );

    if (companiesWithData.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      children: companiesWithData.map((entry) {
        String companyName;
        if (event is ETFFlowData) {
          companyName = ETFFlowData.getCompanyName(entry.key);
        } else if (event is BTCFlowData) {
          companyName = BTCFlowData.getCompanyName(entry.key);
        } else {
          companyName = ETFFlowData.getCompanyName(
            BTCFlowData.getCompanyName(entry.key) == entry.key
                ? entry.key
                : BTCFlowData.getCompanyName(entry.key),
          );
        }
        final amount = entry.value ?? 0;
        final isPositive = amount >= 0;

        final content = Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF2A2A2A) : Colors.grey[50],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isDark ? Colors.grey[600]! : Colors.grey[200]!,
              width: 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: isPositive
                          ? Colors.green.withOpacity(0.15)
                          : Colors.red.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      isPositive ? Icons.trending_up : Icons.trending_down,
                      color: isPositive ? Colors.green : Colors.red,
                      size: 16,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      companyName,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isDark ? Colors.white : Colors.black,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: isPositive
                          ? Colors.green.withOpacity(0.1)
                          : Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      _formatAmount(amount),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: isPositive ? Colors.green : Colors.red,
                      ),
                    ),
                  ),
                ],
              ),
              if (event is CombinedFlowData && expandedKeys.contains(entry.key))
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Column(
                    children: [
                      if ((event.companiesByAsset['bitcoin']?[entry.key] ??
                              0) !=
                          0)
                        _buildAssetRow(
                          'Bitcoin',
                          event.companiesByAsset['bitcoin']?[entry.key] ?? 0,
                          isDark,
                        )!,
                      if ((event.companiesByAsset['ethereum']?[entry.key] ??
                              0) !=
                          0)
                        _buildAssetRow(
                          'Ethereum',
                          event.companiesByAsset['ethereum']?[entry.key] ?? 0,
                          isDark,
                        )!,
                      if ((event.companiesByAsset['solana']?[entry.key] ?? 0) !=
                          0)
                        _buildAssetRow(
                          'Solana',
                          event.companiesByAsset['solana']?[entry.key] ?? 0,
                          isDark,
                        )!,
                    ],
                  ),
                ),
            ],
          ),
        );

        return GestureDetector(
          onTap: () {
            if (event is CombinedFlowData) toggle(entry.key);
          },
          behavior: HitTestBehavior.opaque,
          child: content,
        );
      }).toList(),
    );
  }

  Widget? _buildAssetRow(String title, double amount, bool isDark) {
    if (amount == 0) return null;
    final positive = amount >= 0;
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF232323) : Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : Colors.black,
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: positive
                  ? Colors.green.withOpacity(0.1)
                  : Colors.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              _formatAmount(amount),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: positive ? Colors.green : Colors.red,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatAmount(double amount) {
    final absAmount = amount.abs();
    final prefix = amount >= 0 ? '+' : '-';

    if (absAmount >= 1000) {
      return '$prefix${(absAmount / 1000).toStringAsFixed(2)}B';
    } else if (absAmount >= 1) {
      return '$prefix${absAmount.toStringAsFixed(2)}M';
    } else {
      return '$prefix${(absAmount * 1000).toStringAsFixed(0)}K';
    }
  }
}
