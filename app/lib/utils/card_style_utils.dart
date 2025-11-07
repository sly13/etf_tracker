import 'package:flutter/material.dart';

/// Утилита для стилей карточек в зависимости от темы
/// - Темная тема: премиум-криптовый стиль (Coinbase/Robinhood/Binance)
/// - Светлая тема: нативный Apple стиль (Wallet/Stocks/Health)
class CardStyleUtils {
  /// Получить стиль карточки в зависимости от темы
  static BoxDecoration getCardDecoration(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    if (isDark) {
      // Премиум-криптовый стиль для темной темы
      return BoxDecoration(
        color: const Color(0xFF1A1A1A), // Темно-серый графитовый
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF1A1A1A),
            const Color(0xFF1F1F1F), // Слегка градиентный
          ],
        ),
        boxShadow: [
          // Глубокие тени для премиум-эффекта
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 8),
            spreadRadius: 0,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
            spreadRadius: -2,
          ),
        ],
        border: Border.all(
          color: Colors.white.withOpacity(0.05), // Мягкий блик
          width: 1,
        ),
      );
    } else {
      // Нативный Apple стиль для светлой темы
      return BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          // Мягкие тени для минималистичного эффекта
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
            spreadRadius: 0,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 4,
            offset: const Offset(0, 1),
            spreadRadius: 0,
          ),
        ],
        border: Border.all(
          color: Colors.grey.withOpacity(0.1), // Мягкий контрастный разделитель
          width: 0.5,
        ),
      );
    }
  }

  /// Получить цвет фона карточки
  static Color getCardColor(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return isDark ? const Color(0xFF1A1A1A) : Colors.white;
  }

  /// Получить цвет фона для вложенных элементов
  static Color getNestedCardColor(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return isDark ? const Color(0xFF232323) : Colors.grey[50]!;
  }

  /// Получить цвет текста заголовка
  static Color getTitleColor(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return isDark ? Colors.white : Colors.black87;
  }

  /// Получить цвет вторичного текста
  static Color getSubtitleColor(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return isDark ? Colors.grey[400]! : Colors.grey[600]!;
  }

  /// Получить стиль для иконок (насыщенные для темной темы)
  static Color getIconColor(BuildContext context, Color baseColor) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    if (isDark) {
      // Насыщенные иконки для премиум-эффекта
      return baseColor;
    } else {
      // Более приглушенные для Apple стиля
      return baseColor.withOpacity(0.8);
    }
  }

  /// Получить стиль для контейнера иконки
  static BoxDecoration getIconContainerDecoration(
    BuildContext context,
    Color baseColor,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    if (isDark) {
      // Насыщенный фон для иконок
      return BoxDecoration(
        color: baseColor.withOpacity(0.25),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: baseColor.withOpacity(0.3),
          width: 0.5,
        ),
      );
    } else {
      // Мягкий фон для Apple стиля
      return BoxDecoration(
        color: baseColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      );
    }
  }

  /// Получить стиль для разделителей
  static Color getDividerColor(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return isDark 
        ? Colors.white.withOpacity(0.08) 
        : Colors.grey.withOpacity(0.2);
  }

  /// Получить цвет фона для выбранного элемента календаря
  static BoxDecoration getSelectedDayDecoration(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    if (isDark) {
      // Премиум-криптовый стиль с градиентом
      return BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF1E3A8A).withOpacity(0.8),
            const Color(0xFF3B5BDB).withOpacity(0.6),
          ],
        ),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: const Color(0xFF3B5BDB).withOpacity(0.5),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF3B5BDB).withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      );
    } else {
      // Нативный Apple стиль
      return BoxDecoration(
        color: Colors.blue.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Colors.blue.withOpacity(0.3),
          width: 1,
        ),
      );
    }
  }

  /// Получить цвет фона для тега потока
  static Color getFlowTagColor(BuildContext context, bool isPositive) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    if (isDark) {
      // Насыщенные цвета для премиум-эффекта
      return isPositive 
          ? Colors.green.withOpacity(0.25)
          : Colors.red.withOpacity(0.25);
    } else {
      // Мягкие цвета для Apple стиля
      return isPositive 
          ? Colors.green.withOpacity(0.1)
          : Colors.red.withOpacity(0.1);
    }
  }

  /// Получить цвет текста для тега потока
  static Color getFlowTagTextColor(BuildContext context, bool isPositive) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    if (isDark) {
      // Более яркие цвета для контраста
      return isPositive ? Colors.green[300]! : Colors.red[300]!;
    } else {
      return isPositive ? Colors.green[700]! : Colors.red[700]!;
    }
  }

  /// Получить цвет фона для элемента списка компаний
  static BoxDecoration getCompanyItemDecoration(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    if (isDark) {
      return BoxDecoration(
        color: const Color(0xFF2A2A2A),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Colors.white.withOpacity(0.08),
          width: 1,
        ),
      );
    } else {
      return BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Colors.grey.withOpacity(0.15),
          width: 0.5,
        ),
      );
    }
  }

  /// Получить отступы для карточки
  static EdgeInsets getCardPadding(BuildContext context) {
    return const EdgeInsets.all(20);
  }

  /// Получить отступы между элементами
  static double getSpacing(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    // Больше воздуха для Apple стиля
    return isDark ? 16.0 : 20.0;
  }
}

