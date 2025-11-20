import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:timeline_tile/timeline_tile.dart';
import '../services/etf_service.dart';
import '../models/flow_event.dart';
import '../utils/card_style_utils.dart';
import '../utils/adaptive_text_utils.dart';
import '../screens/flow_events_screen.dart';

enum _TimelineItemType {
  single,
  grouped,
}

class _TimelineItem {
  final _TimelineItemType type;
  final List<FlowEvent> events;
  final String? tokenLogoPath;

  _TimelineItem({
    required this.type,
    required this.events,
    required this.tokenLogoPath,
  });
}

class TodayFlowsPanel extends StatefulWidget {
  const TodayFlowsPanel({super.key});

  @override
  State<TodayFlowsPanel> createState() => _TodayFlowsPanelState();
}

class _TodayFlowsPanelState extends State<TodayFlowsPanel> {
  final ETFService _etfService = ETFService();
  List<FlowEvent> _events = [];
  bool _isLoading = true;
  String? _error;
  bool _isToday = true;

  @override
  void initState() {
    super.initState();
    _loadTodayEvents();
  }

  Future<void> _loadTodayEvents() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await _etfService.getTodayEvents(limit: 5);
      final eventsList = (data['events'] as List)
          .map((e) => FlowEvent.fromJson(e))
          .toList();

      setState(() {
        _events = eventsList;
        _isToday = data['isToday'] as bool? ?? true;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  String _formatFlow(double value) {
    final absValue = value.abs();
    final sign = value >= 0 ? '+' : '-';

    if (absValue >= 1000) {
      return '$sign${(absValue / 1000).toStringAsFixed(2)}B';
    } else {
      return '$sign${absValue.toStringAsFixed(2)}M';
    }
  }

  String _formatDateTime(String timeStr, BuildContext context) {
    try {
      final dateTime = DateTime.parse(timeStr);
      final locale = Localizations.localeOf(context).languageCode;
      return DateFormat('dd MMMM yyyy, HH:mm', locale).format(dateTime);
    } catch (e) {
      return '';
    }
  }

  /// Получить путь к логотипу токена на основе названия ETF
  String? _getTokenLogoPath(String etf) {
    final etfLower = etf.toLowerCase();
    if (etfLower.contains('bitcoin') || etfLower.contains('btc')) {
      return 'assets/bitcoin.png';
    } else if (etfLower.contains('ethereum') || etfLower.contains('eth')) {
      return 'assets/ethereum.png';
    } else if (etfLower.contains('solana') || etfLower.contains('sol')) {
      return 'assets/solana.png';
    }
    return null;
  }

  /// Определить токен из названия ETF
  String? _getTokenFromEtf(String etf) {
    final etfLower = etf.toLowerCase();
    if (etfLower.contains('bitcoin') || etfLower.contains('btc')) {
      return 'bitcoin';
    } else if (etfLower.contains('ethereum') || etfLower.contains('eth')) {
      return 'ethereum';
    } else if (etfLower.contains('solana') || etfLower.contains('sol')) {
      return 'solana';
    }
    return null;
  }

  Map<String, List<FlowEvent>> _groupEventsByDate(List<FlowEvent> events) {
    final Map<String, List<FlowEvent>> grouped = {};
    for (final event in events) {
      final dateKey = event.date;
      if (!grouped.containsKey(dateKey)) {
        grouped[dateKey] = [];
      }
      grouped[dateKey]!.add(event);
    }
    // Сортируем события внутри каждого дня по времени
    for (final dateKey in grouped.keys) {
      grouped[dateKey]!.sort((a, b) => b.time.compareTo(a.time));
    }
    return grouped;
  }

  /// Нормализовать время до минут (убрать секунды и миллисекунды)
  String _normalizeTimeToMinutes(String timeStr) {
    try {
      final dateTime = DateTime.parse(timeStr);
      // Округляем до минут
      final normalized = DateTime(
        dateTime.year,
        dateTime.month,
        dateTime.day,
        dateTime.hour,
        dateTime.minute,
      );
      return normalized.toIso8601String();
    } catch (e) {
      // Если не удалось распарсить, возвращаем как есть
      return timeStr;
    }
  }

  /// Группировать события по токену и времени
  /// Возвращает список групп, где каждая группа - это события одного токена и времени
  List<List<FlowEvent>> _groupEventsByTokenAndTime(List<FlowEvent> events) {
    if (events.isEmpty) return [];

    final Map<String, List<FlowEvent>> grouped = {};
    for (final event in events) {
      final token = _getTokenFromEtf(event.etf) ?? 'unknown';
      // Нормализуем время до минут для группировки
      final normalizedTime = _normalizeTimeToMinutes(event.time);
      final key = '$token|$normalizedTime';
      if (!grouped.containsKey(key)) {
        grouped[key] = [];
      }
      grouped[key]!.add(event);
    }

    // Сортируем группы по времени (от новых к старым)
    final sortedKeys = grouped.keys.toList()
      ..sort((a, b) {
        final timeA = a.split('|')[1];
        final timeB = b.split('|')[1];
        return timeB.compareTo(timeA);
      });

    return sortedKeys.map((key) => grouped[key]!).toList();
  }


  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: CardStyleUtils.getCardDecoration(context),
      child: Padding(
        padding: CardStyleUtils.getCardPadding(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Заголовок
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _isToday ? 'etf.today_flows'.tr() : 'etf.latest_flows'.tr(),
                        style: AdaptiveTextUtils.createAdaptiveTextStyle(
                          context,
                          'headlineSmall',
                          fontWeight: FontWeight.bold,
                          customBaseSize: 18.0,
                        ).copyWith(
                          color: CardStyleUtils.getTitleColor(context),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: CardStyleUtils.getSpacing(context)),

            // Содержимое
            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_error != null)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    'Ошибка: $_error',
                    style: TextStyle(
                      color: Colors.red,
                      fontSize: 14,
                    ),
                  ),
                ),
              )
            else if (_events.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    'etf.no_events_today'.tr(),
                    style: TextStyle(
                      color: CardStyleUtils.getSubtitleColor(context),
                      fontSize: 14,
                    ),
                  ),
                ),
              )
            else
              Column(
                children: [
                  // Timeline с событиями
                  _buildTimeline(),
                  SizedBox(height: CardStyleUtils.getSpacing(context)),
                  // Кнопка "Показать еще"
                  SizedBox(
                    width: double.infinity,
                    child: TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const FlowEventsScreen(),
                          ),
                        );
                      },
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        backgroundColor: CardStyleUtils.getNestedCardColor(context),
                        foregroundColor: CardStyleUtils.getTitleColor(context),
                        side: BorderSide(
                          color: CardStyleUtils.getDividerColor(context),
                          width: 0.5,
                        ),
                      ),
                      child: Text(
                        'etf.show_more'.tr(),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: CardStyleUtils.getTitleColor(context),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeline() {
    if (_events.isEmpty) return const SizedBox.shrink();

    final grouped = _groupEventsByDate(_events);
    final sortedDates = grouped.keys.toList()..sort((a, b) => b.compareTo(a));

    // Собираем все элементы для отображения
    final List<_TimelineItem> timelineItems = [];
    
    for (final date in sortedDates) {
      final dateEvents = grouped[date]!;
      final tokenGroups = _groupEventsByTokenAndTime(dateEvents);
      
      for (final group in tokenGroups) {
        // Если в группе больше одного события, значит они одного токена и времени
        // (группировка уже произошла по ключу token|time)
        if (group.length > 1) {
          // Объединенный блок для событий одного токена и времени
          timelineItems.add(_TimelineItem(
            type: _TimelineItemType.grouped,
            events: group,
            tokenLogoPath: _getTokenLogoPath(group.first.etf),
          ));
        } else {
          // Отдельный блок для одного события
          timelineItems.add(_TimelineItem(
            type: _TimelineItemType.single,
            events: group,
            tokenLogoPath: _getTokenLogoPath(group.first.etf),
          ));
        }
      }
    }
    
    // Строим timeline виджеты
    final List<Widget> timelineWidgets = [];
    for (int i = 0; i < timelineItems.length; i++) {
      final item = timelineItems[i];
      final isFirst = i == 0;
      final isLast = i == timelineItems.length - 1;
      
      timelineWidgets.add(
        TimelineTile(
          alignment: TimelineAlign.start,
          isFirst: isFirst,
          isLast: isLast,
          indicatorStyle: IndicatorStyle(
            width: 32,
            height: 32,
            indicator: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: CardStyleUtils.getNestedCardColor(context),
                shape: BoxShape.circle,
                border: Border.all(
                  color: CardStyleUtils.getDividerColor(context),
                  width: 1.5,
                ),
              ),
              child: item.tokenLogoPath != null
                  ? Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: Image.asset(
                        item.tokenLogoPath!,
                        width: 24,
                        height: 24,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            decoration: BoxDecoration(
                              color: CardStyleUtils.getSubtitleColor(context),
                              shape: BoxShape.circle,
                            ),
                          );
                        },
                      ),
                    )
                  : Container(
                      decoration: BoxDecoration(
                        color: CardStyleUtils.getSubtitleColor(context),
                        shape: BoxShape.circle,
                      ),
                    ),
            ),
          ),
          beforeLineStyle: LineStyle(
            color: CardStyleUtils.getDividerColor(context),
            thickness: 2,
          ),
          afterLineStyle: !isLast
              ? LineStyle(
                  color: CardStyleUtils.getDividerColor(context),
                  thickness: 2,
                )
              : null,
          endChild: item.type == _TimelineItemType.grouped
              ? _buildGroupedEventItem(item.events)
              : _buildEventItem(item.events.first),
        ),
      );
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: timelineWidgets,
    );
  }

  Widget _buildGroupedEventItem(List<FlowEvent> events) {
    if (events.isEmpty) return const SizedBox.shrink();
    
    final firstEvent = events.first;
    final dateTime = _formatDateTime(firstEvent.time, context);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12, left: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: CardStyleUtils.getNestedCardColor(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: CardStyleUtils.getDividerColor(context),
          width: 0.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Список компаний с суммами
          ...events.asMap().entries.map((entry) {
            final index = entry.key;
            final event = entry.value;
            final isPositive = event.isPositive;
            return Padding(
              padding: EdgeInsets.only(bottom: index < events.length - 1 ? 8 : 0),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      event.company,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: CardStyleUtils.getTitleColor(context),
                        letterSpacing: -0.2,
                      ),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    _formatFlow(event.amount),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: CardStyleUtils.getFlowTagTextColor(context, isPositive),
                      letterSpacing: 0.3,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
          // Дата и время внизу
          const SizedBox(height: 8),
          Text(
            dateTime,
            style: TextStyle(
              fontSize: 12,
              color: CardStyleUtils.getSubtitleColor(context),
              letterSpacing: -0.1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEventItem(FlowEvent event) {
    final isPositive = event.isPositive;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12, left: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: CardStyleUtils.getNestedCardColor(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: CardStyleUtils.getDividerColor(context),
          width: 0.5,
        ),
      ),
      child: Row(
        children: [
          // Информация
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  event.company,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: CardStyleUtils.getTitleColor(context),
                    letterSpacing: -0.2,
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
                const SizedBox(height: 4),
                Text(
                  _formatDateTime(event.time, context),
                  style: TextStyle(
                    fontSize: 12,
                    color: CardStyleUtils.getSubtitleColor(context),
                    letterSpacing: -0.1,
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          // Сумма
          Text(
            _formatFlow(event.amount),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: CardStyleUtils.getFlowTagTextColor(context, isPositive),
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}

