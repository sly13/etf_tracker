import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:timeline_tile/timeline_tile.dart';
import '../services/etf_service.dart';
import '../models/flow_event.dart';
import '../utils/card_style_utils.dart';

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

class FlowEventsScreen extends StatefulWidget {
  const FlowEventsScreen({super.key});

  @override
  State<FlowEventsScreen> createState() => _FlowEventsScreenState();
}

class _FlowEventsScreenState extends State<FlowEventsScreen> {
  final ETFService _etfService = ETFService();
  final ScrollController _scrollController = ScrollController();
  List<FlowEvent> _events = [];
  bool _isLoading = false;
  bool _hasMore = true;
  int _currentPage = 1;
  String? _error;
  static const int _pageSize = 50; // Увеличено с 20 до 50, чтобы загрузить больше событий за раз

  @override
  void initState() {
    super.initState();
    _loadEvents();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent * 0.9 &&
        !_isLoading &&
        _hasMore) {
      _loadMoreEvents();
    }
  }

  Future<void> _loadEvents() async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await _etfService.getAllEvents(page: 1, limit: _pageSize);
      final eventsList = (data['events'] as List)
          .map((e) => FlowEvent.fromJson(e))
          .toList();
      final pagination = data['pagination'] as Map<String, dynamic>;

      setState(() {
        _events = eventsList;
        _hasMore = pagination['hasMore'] ?? false;
        _currentPage = 1;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _loadMoreEvents() async {
    if (_isLoading || !_hasMore) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final nextPage = _currentPage + 1;
      final data = await _etfService.getAllEvents(
        page: nextPage,
        limit: _pageSize,
      );
      final eventsList = (data['events'] as List)
          .map((e) => FlowEvent.fromJson(e))
          .toList();
      final pagination = data['pagination'] as Map<String, dynamic>;

      setState(() {
        _events.addAll(eventsList);
        _hasMore = pagination['hasMore'] ?? false;
        _currentPage = nextPage;
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

  String _formatDateTimeFull(String timeStr, BuildContext context) {
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
    final etfLower = etf.toLowerCase().trim();
    // Проверяем в порядке приоритета: сначала точные совпадения, потом частичные
    if (etfLower.contains('bitcoin') || etfLower.contains('btc')) {
      return 'bitcoin';
    } else if (etfLower.contains('ethereum') || etfLower.contains('eth')) {
      return 'ethereum';
    } else if (etfLower.contains('solana') || etfLower.contains('sol')) {
      return 'solana';
    }
    return null;
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

  String _formatDate(String dateStr, BuildContext context) {
    try {
      final date = DateTime.parse(dateStr);
      final today = DateTime.now();
      final yesterday = today.subtract(const Duration(days: 1));
      // Используем полную локаль из контекста для правильного форматирования даты
      final locale = Localizations.localeOf(context);
      final localeString = locale.toString();
      
      if (date.year == today.year && date.month == today.month && date.day == today.day) {
        return DateFormat('EEEE, dd MMMM', localeString).format(date);
      } else if (date.year == yesterday.year && date.month == yesterday.month && date.day == yesterday.day) {
        return DateFormat('EEEE, dd MMMM', localeString).format(date);
      } else {
        return DateFormat('EEEE, dd MMMM yyyy', localeString).format(date);
      }
    } catch (e) {
      // Если форматирование с локалью не удалось, пробуем без локали
      try {
        final date = DateTime.parse(dateStr);
        final today = DateTime.now();
        final yesterday = today.subtract(const Duration(days: 1));
        
        if (date.year == today.year && date.month == today.month && date.day == today.day) {
          return DateFormat('EEEE, dd MMMM').format(date);
        } else if (date.year == yesterday.year && date.month == yesterday.month && date.day == yesterday.day) {
          return DateFormat('EEEE, dd MMMM').format(date);
        } else {
          return DateFormat('EEEE, dd MMMM yyyy').format(date);
        }
      } catch (e2) {
        return dateStr;
      }
    }
  }

  Map<String, List<FlowEvent>> _groupEventsByDate(List<FlowEvent> events) {
    final Map<String, List<FlowEvent>> grouped = {};
    for (final event in events) {
      // Извлекаем дату из поля time, чтобы она соответствовала реальной дате события
      try {
        final dateTime = DateTime.parse(event.time);
        // Нормализуем дату до дня (без времени) для правильной группировки
        final normalizedDate = DateTime(dateTime.year, dateTime.month, dateTime.day);
        final dateKey = normalizedDate.toIso8601String().split('T')[0];
        
        if (!grouped.containsKey(dateKey)) {
          grouped[dateKey] = [];
        }
        grouped[dateKey]!.add(event);
      } catch (e) {
        // Если не удалось распарсить time, используем date как fallback
        final dateKey = event.date;
        if (!grouped.containsKey(dateKey)) {
          grouped[dateKey] = [];
        }
        grouped[dateKey]!.add(event);
      }
    }
    return grouped;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('etf.flow_events'.tr()),
        backgroundColor: CardStyleUtils.getCardColor(context),
        foregroundColor: CardStyleUtils.getTitleColor(context),
      ),
      body: RefreshIndicator(
        onRefresh: _loadEvents,
        child: _error != null && _events.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Ошибка: $_error',
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 14,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadEvents,
                      child: Text('common.retry'.tr()),
                    ),
                  ],
                ),
              )
            : _events.isEmpty && _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _buildGroupedEventsList(),
      ),
    );
  }

  /// Удалить дубликаты событий
  /// События считаются дубликатами, если у них одинаковые time, company, etf и amount
  List<FlowEvent> _removeDuplicates(List<FlowEvent> events) {
    final Map<String, FlowEvent> uniqueEvents = {};
    for (final event in events) {
      // Создаем уникальный ключ из time, company, etf и amount
      final key = '${event.time}|${event.company}|${event.etf}|${event.amount}';
      // Если такого события еще нет, или это событие новее (по time), сохраняем его
      if (!uniqueEvents.containsKey(key) || 
          event.time.compareTo(uniqueEvents[key]!.time) > 0) {
        uniqueEvents[key] = event;
      }
    }
    return uniqueEvents.values.toList();
  }

  Widget _buildGroupedEventsList() {
    // Удаляем дубликаты перед группировкой
    final uniqueEvents = _removeDuplicates(_events);
    
    final grouped = _groupEventsByDate(uniqueEvents);
    final sortedDates = grouped.keys.toList()..sort((a, b) => b.compareTo(a));
    
    final List<Widget> items = [];
    
    for (final date in sortedDates) {
      // Заголовок с датой
      items.add(
        Container(
          margin: const EdgeInsets.only(top: 24, bottom: 16),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            _formatDate(date, context),
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: CardStyleUtils.getTitleColor(context),
            ),
          ),
        ),
      );
      
      // Таймлайн с событиями за этот день
      items.add(
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: _buildTimelineForDate(grouped[date]!),
        ),
      );
    }
    
    // Индикатор загрузки в конце
    if (_isLoading) {
      items.add(
        const Padding(
          padding: EdgeInsets.all(16.0),
          child: Center(child: CircularProgressIndicator()),
        ),
      );
    }
    
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: items.length,
      itemBuilder: (context, index) => items[index],
    );
  }

  Widget _buildTimelineForDate(List<FlowEvent> events) {
    if (events.isEmpty) return const SizedBox.shrink();

    // Сортируем события по времени (от новых к старым)
    final sortedEvents = List<FlowEvent>.from(events)
      ..sort((a, b) => b.time.compareTo(a.time));

    // Не группируем события - показываем каждое отдельно
    final List<_TimelineItem> timelineItems = [];

    for (final event in sortedEvents) {
      // Отдельный блок для каждого события
      timelineItems.add(_TimelineItem(
        type: _TimelineItemType.single,
        events: [event],
        tokenLogoPath: _getTokenLogoPath(event.etf),
      ));
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
    final dateTime = _formatDateTimeFull(firstEvent.time, context);

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
                  _formatDateTimeFull(event.time, context),
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

