import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../services/etf_service.dart';
import '../models/flow_event.dart';
import '../utils/card_style_utils.dart';

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
  static const int _pageSize = 20;

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

  String _formatDateTime(String timeStr) {
    try {
      final dateTime = DateTime.parse(timeStr);
      return DateFormat('HH:mm').format(dateTime);
    } catch (e) {
      return timeStr;
    }
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final today = DateTime.now();
      final yesterday = today.subtract(const Duration(days: 1));
      
      if (date.year == today.year && date.month == today.month && date.day == today.day) {
        return DateFormat('EEEE, dd MMMM', 'ru').format(date);
      } else if (date.year == yesterday.year && date.month == yesterday.month && date.day == yesterday.day) {
        return DateFormat('EEEE, dd MMMM', 'ru').format(date);
      } else {
        return DateFormat('EEEE, dd MMMM yyyy', 'ru').format(date);
      }
    } catch (e) {
      return dateStr;
    }
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

  Widget _buildGroupedEventsList() {
    final grouped = _groupEventsByDate(_events);
    final sortedDates = grouped.keys.toList()..sort((a, b) => b.compareTo(a));
    
    final List<Widget> items = [];
    
    for (final date in sortedDates) {
      // Заголовок с датой
      items.add(
        Container(
          margin: const EdgeInsets.only(top: 16, bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            _formatDate(date),
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: CardStyleUtils.getTitleColor(context),
            ),
          ),
        ),
      );
      
      // События за этот день
      for (final event in grouped[date]!) {
        items.add(
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _buildEventItem(event),
          ),
        );
      }
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

  Widget _buildEventItem(FlowEvent event) {
    final isPositive = event.isPositive;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: CardStyleUtils.getCardColor(context),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: CardStyleUtils.getDividerColor(context),
          width: 0.5,
        ),
      ),
      child: Row(
        children: [
          // Иконка
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
          // Информация
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        _formatDateTime(event.time),
                        style: TextStyle(
                          fontSize: 11,
                          color: CardStyleUtils.getSubtitleColor(context),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        event.company,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: CardStyleUtils.getTitleColor(context),
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  event.etf,
                  style: TextStyle(
                    fontSize: 12,
                    color: CardStyleUtils.getSubtitleColor(context),
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Сумма
          IntrinsicWidth(
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 10,
                vertical: 6,
              ),
              decoration: BoxDecoration(
                color: CardStyleUtils.getFlowTagColor(context, isPositive),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                _formatFlow(event.amount),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: CardStyleUtils.getFlowTagTextColor(context, isPositive),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

