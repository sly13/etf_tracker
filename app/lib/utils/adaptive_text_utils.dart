import 'package:flutter/material.dart';
import 'font_utils.dart';

/// Утилита для создания адаптивных размеров шрифтов с поддержкой Dynamic Type
class AdaptiveTextUtils {
  /// Базовые размеры шрифтов для разных типов текста
  static const Map<String, double> _baseFontSizes = {
    'displayLarge': 32.0,
    'displayMedium': 28.0,
    'displaySmall': 24.0,
    'headlineLarge': 22.0,
    'headlineMedium': 20.0,
    'headlineSmall': 18.0,
    'titleLarge': 16.0,
    'titleMedium': 14.0,
    'titleSmall': 12.0,
    'bodyLarge': 16.0,
    'bodyMedium': 14.0,
    'bodySmall': 12.0,
    'labelLarge': 14.0,
    'labelMedium': 12.0,
    'labelSmall': 10.0,
  };

  /// Получить адаптивный размер шрифта с учетом масштаба текста
  static double getAdaptiveFontSize(
    BuildContext context,
    String textType, {
    double? customBaseSize,
  }) {
    final baseSize = customBaseSize ?? _baseFontSizes[textType] ?? 14.0;
    final textScaleFactor = MediaQuery.textScaleFactorOf(context);

    // Ограничиваем максимальный масштаб для предотвращения "плывущих" блоков
    final clampedScaleFactor = textScaleFactor.clamp(0.8, 1.3);

    return baseSize * clampedScaleFactor;
  }

  /// Получить адаптивную высоту строки
  static double getAdaptiveLineHeight(
    BuildContext context,
    double fontSize, {
    double? customLineHeight,
  }) {
    final textScaleFactor = MediaQuery.textScaleFactorOf(context);
    final clampedScaleFactor = textScaleFactor.clamp(0.8, 1.3);

    // Базовое соотношение высоты строки к размеру шрифта
    final baseLineHeight = customLineHeight ?? 1.4;

    return fontSize * baseLineHeight * clampedScaleFactor;
  }

  /// Получить адаптивные отступы с учетом масштаба текста
  static EdgeInsets getAdaptivePadding(
    BuildContext context, {
    double? basePadding,
  }) {
    final textScaleFactor = MediaQuery.textScaleFactorOf(context);
    final clampedScaleFactor = textScaleFactor.clamp(0.8, 1.3);
    final padding = basePadding ?? 16.0;

    return EdgeInsets.all(padding * clampedScaleFactor);
  }

  /// Получить адаптивную высоту элемента с учетом масштаба текста
  static double getAdaptiveHeight(
    BuildContext context,
    double baseHeight, {
    double minHeight = 40.0,
    double maxHeight = 80.0,
  }) {
    final textScaleFactor = MediaQuery.textScaleFactorOf(context);
    final clampedScaleFactor = textScaleFactor.clamp(0.8, 1.3);

    final adaptiveHeight = baseHeight * clampedScaleFactor;
    return adaptiveHeight.clamp(minHeight, maxHeight);
  }

  /// Создать адаптивный TextStyle
  static TextStyle createAdaptiveTextStyle(
    BuildContext context,
    String textType, {
    Color? color,
    FontWeight? fontWeight,
    double? customBaseSize,
    double? customLineHeight,
  }) {
    final fontSize = getAdaptiveFontSize(
      context,
      textType,
      customBaseSize: customBaseSize,
    );
    final lineHeight = getAdaptiveLineHeight(
      context,
      fontSize,
      customLineHeight: customLineHeight,
    );

    return TextStyle(
      fontSize: fontSize,
      height:
          lineHeight /
          fontSize, // Flutter использует относительную высоту строки
      color: color,
      fontWeight: fontWeight,
    );
  }

  /// Создать адаптивный TextStyle с IBM Plex Mono для финансовых данных
  static TextStyle createAdaptiveFinancialStyle(
    BuildContext context,
    String textType, {
    Color? color,
    FontWeight? fontWeight,
    double? customBaseSize,
    double? customLineHeight,
  }) {
    final fontSize = getAdaptiveFontSize(
      context,
      textType,
      customBaseSize: customBaseSize,
    );
    final lineHeight = getAdaptiveLineHeight(
      context,
      fontSize,
      customLineHeight: customLineHeight,
    );

    return FontUtils.createAdaptiveIBMPlexMonoStyle(
      context,
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: lineHeight / fontSize,
    );
  }

  /// Проверить, включен ли крупный шрифт
  static bool isLargeTextEnabled(BuildContext context) {
    return MediaQuery.textScaleFactorOf(context) > 1.1;
  }

  /// Получить коэффициент масштабирования текста
  static double getTextScaleFactor(BuildContext context) {
    return MediaQuery.textScaleFactorOf(context);
  }

  /// Адаптивные размеры для карточек ETF
  static Map<String, double> getETFCardSizes(BuildContext context) {
    final textScaleFactor = getTextScaleFactor(context);
    final clampedScaleFactor = textScaleFactor.clamp(0.8, 1.3);

    return {
      'cardPadding': 16.0 * clampedScaleFactor,
      'logoSize': 40.0 * clampedScaleFactor,
      'titleFontSize': 18.0 * clampedScaleFactor,
      'subtitleFontSize': 14.0 * clampedScaleFactor,
      'priceFontSize': 20.0 * clampedScaleFactor,
      'changeFontSize': 14.0 * clampedScaleFactor,
      'iconSize': 16.0 * clampedScaleFactor,
      'spacing': 8.0 * clampedScaleFactor,
      'cardSpacing': 16.0 * clampedScaleFactor,
    };
  }

  /// Адаптивные размеры для графиков
  static Map<String, double> getChartSizes(BuildContext context) {
    final textScaleFactor = getTextScaleFactor(context);
    // Очень консервативное масштабирование для графиков, чтобы избежать переполнения
    final clampedScaleFactor = textScaleFactor.clamp(0.7, 1.0);

    return {
      'axisFontSize': 9.0 * clampedScaleFactor, // Уменьшили с 11.0
      'metricFontSize': 7.0 * clampedScaleFactor, // Уменьшили с 8.0
      'valueFontSize': 9.0 * clampedScaleFactor, // Уменьшили с 11.0
      'iconSize': 10.0 * clampedScaleFactor, // Уменьшили с 12.0
      'padding': 6.0 * clampedScaleFactor, // Уменьшили с 8.0
      'axisHeight': 25.0 * clampedScaleFactor, // Уменьшили с 30.0
    };
  }

  /// Адаптивные размеры для кнопок
  static Map<String, double> getButtonSizes(BuildContext context) {
    final textScaleFactor = getTextScaleFactor(context);
    final clampedScaleFactor = textScaleFactor.clamp(0.8, 1.3);

    return {
      'height': 44.0 * clampedScaleFactor,
      'fontSize': 16.0 * clampedScaleFactor,
      'padding': 16.0 * clampedScaleFactor,
      'borderRadius': 8.0 * clampedScaleFactor,
    };
  }

  /// Стандартные отступы для контента
  static EdgeInsets getContentPadding(BuildContext context) {
    final textScaleFactor = getTextScaleFactor(context);
    final clampedScaleFactor = textScaleFactor.clamp(0.8, 1.3);

    return EdgeInsets.symmetric(
      horizontal: 8.0 * clampedScaleFactor,
      vertical: 16.0 * clampedScaleFactor,
    );
  }

  /// Отступы для карточек
  static EdgeInsets getCardPadding(BuildContext context) {
    final textScaleFactor = getTextScaleFactor(context);
    final clampedScaleFactor = textScaleFactor.clamp(0.8, 1.3);

    return EdgeInsets.all(12.0 * clampedScaleFactor);
  }

  /// Отступы для списков
  static EdgeInsets getListPadding(BuildContext context) {
    final textScaleFactor = getTextScaleFactor(context);
    final clampedScaleFactor = textScaleFactor.clamp(0.8, 1.3);

    return EdgeInsets.symmetric(
      horizontal: 8.0 * clampedScaleFactor,
      vertical: 8.0 * clampedScaleFactor,
    );
  }
}
