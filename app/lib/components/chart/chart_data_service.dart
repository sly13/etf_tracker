import '../../models/etf_flow_data.dart';
import 'period_selector.dart';

class ChartDataService {
  static List<dynamic> getLastSixMonthsData(List<dynamic> flowData) {
    if (flowData.isEmpty) return [];

    final now = DateTime.now();

    // Исправляем расчет даты 6 месяцев назад
    DateTime correctedSixMonthsAgo;
    if (now.month <= 6) {
      correctedSixMonthsAgo = DateTime(now.year - 1, now.month + 6, now.day);
    } else {
      correctedSixMonthsAgo = DateTime(now.year, now.month - 6, now.day);
    }

    // Фильтруем данные за последние 6 месяцев
    final recentData = flowData.where((data) {
      final date = DateTime.parse(data.date);
      return date.isAfter(correctedSixMonthsAgo) ||
          date.isAtSameMomentAs(correctedSixMonthsAgo);
    }).toList();

    // Сортируем по дате
    recentData.sort(
      (a, b) => DateTime.parse(a.date).compareTo(DateTime.parse(b.date)),
    );

    return recentData;
  }

  static List<dynamic> groupDataByWeek(List<dynamic> flowData) {
    final Map<String, List<dynamic>> weeklyGroups = {};

    for (final data in flowData) {
      final date = DateTime.parse(data.date);
      final weekKey = '${date.year}-W${_getWeekOfYear(date)}';

      if (!weeklyGroups.containsKey(weekKey)) {
        weeklyGroups[weekKey] = [];
      }
      weeklyGroups[weekKey]!.add(data);
    }

    final groupedData = weeklyGroups.entries.map((entry) {
      final weekData = entry.value;
      final total = weekData.fold<double>(
        0,
        (sum, data) => sum + (data.total ?? 0),
      );
      final firstDate = DateTime.parse(weekData.first.date);

      // Создаем объект того же типа, что и входные данные
      if (flowData.isNotEmpty && flowData.first is ETFFlowData) {
        return ETFFlowData(date: firstDate.toIso8601String(), total: total);
      } else {
        return BTCFlowData(date: firstDate.toIso8601String(), total: total);
      }
    }).toList();

    // Сортируем по дате
    groupedData.sort(
      (a, b) => DateTime.parse(a.date).compareTo(DateTime.parse(b.date)),
    );

    return groupedData;
  }

  static List<dynamic> groupDataByMonth(List<dynamic> flowData) {
    final Map<String, List<dynamic>> monthlyGroups = {};

    for (final data in flowData) {
      final date = DateTime.parse(data.date);
      final monthKey = '${date.year}-${date.month.toString().padLeft(2, '0')}';

      if (!monthlyGroups.containsKey(monthKey)) {
        monthlyGroups[monthKey] = [];
      }
      monthlyGroups[monthKey]!.add(data);
    }

    final groupedData = monthlyGroups.entries.map((entry) {
      final monthData = entry.value;
      final total = monthData.fold<double>(
        0,
        (sum, data) => sum + (data.total ?? 0),
      );
      final firstDate = DateTime.parse(monthData.first.date);

      // Создаем объект того же типа, что и входные данные
      if (flowData.isNotEmpty && flowData.first is ETFFlowData) {
        return ETFFlowData(date: firstDate.toIso8601String(), total: total);
      } else {
        return BTCFlowData(date: firstDate.toIso8601String(), total: total);
      }
    }).toList();

    // Сортируем по дате
    groupedData.sort(
      (a, b) => DateTime.parse(a.date).compareTo(DateTime.parse(b.date)),
    );

    return groupedData;
  }

  static List<dynamic> filterDataByPeriod(
    List<dynamic> flowData,
    ChartPeriod period,
  ) {
    if (flowData.isEmpty) return [];

    switch (period) {
      case ChartPeriod.daily:
        return getLastSixMonthsData(flowData);
      case ChartPeriod.weekly:
        return groupDataByWeek(flowData);
      case ChartPeriod.monthly:
        return groupDataByMonth(flowData);
    }
  }

  static int _getWeekOfYear(DateTime date) {
    // Используем ISO недели (неделя начинается с понедельника)
    final jan1 = DateTime(date.year, 1, 1);
    final jan1Weekday = jan1.weekday;

    // Находим первый понедельник года
    final firstMonday = jan1.add(Duration(days: (8 - jan1Weekday) % 7));

    if (date.isBefore(firstMonday)) {
      // Если дата до первого понедельника, это неделя предыдущего года
      return _getWeekOfYear(DateTime(date.year - 1, 12, 31));
    }

    final weekNumber = ((date.difference(firstMonday).inDays) / 7).floor() + 1;
    return weekNumber;
  }
}
