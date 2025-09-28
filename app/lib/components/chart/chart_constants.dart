import 'package:flutter/material.dart';

class ChartColors {
  // Основные цвета
  static const Color background = Color(0xFF1A1A1A); // Как у summary карточки
  static const Color cardBackground = Color(0xFF1A1A1A);
  static const Color border = Color(0xFF333333);

  // Цвета текста
  static const Color primaryText = Colors.white;
  static const Color secondaryText = Color(0xFFCCCCCC);

  // Цвета для данных
  static const Color positiveFlow = Color(0xFF00C853);
  static const Color negativeFlow = Color(0xFFD32F2F);
  static const Color gridLine = Color(0xFF333333);
  static const Color zeroLine = Colors.white;

  // Цвета для периодов
  static const Color selectedPeriod = Colors.blue;
  static const Color unselectedPeriod = Color(0xFF1A1A1A);
}

class ChartStyles {
  // Размеры шрифтов
  static const double titleFontSize = 16.0;
  static const double metricFontSize = 13.0; // Уменьшено с 16.0
  static const double axisFontSize = 11.0;
  static const double bottomAxisFontSize = 10.0;
  static const double periodButtonFontSize = 10.0;
  static const double metricLabelFontSize = 10.0; // Уменьшено с 12.0

  // Отступы
  static const EdgeInsets headerPadding = EdgeInsets.fromLTRB(
    16.0,
    16.0,
    16.0,
    8.0,
  );
  static const EdgeInsets metricsPadding = EdgeInsets.fromLTRB(
    12.0, // Уменьшено с 16.0
    0,
    12.0, // Уменьшено с 16.0
    6.0, // Уменьшено с 8.0
  );
  static const EdgeInsets chartPadding = EdgeInsets.symmetric(horizontal: 10.0);

  // Размеры элементов
  static const double metricDotSize = 6.0; // Уменьшено с 8.0
  static const double borderRadius = 8.0;
  static const double periodButtonBorderRadius = 4.0;

  // Ширина линий
  static const double gridLineWidth = 0.5;
  static const double zeroLineWidth = 2.0;
  static const double borderWidth = 1.0;
}

class ChartDimensions {
  // Размеры осей
  static const double leftAxisReservedSize =
      50.0; // Увеличено для предотвращения переноса
  static const double bottomAxisReservedSize = 40.0;

  // Ширина столбцов
  static const double dailyBarWidth = 2.0;
  static const double weeklyBarWidth = 3.0;
  static const double monthlyBarWidth = 6.0;

  // Интервалы
  static const double groupsSpace = 1.0;
}
