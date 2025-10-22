import 'package:flutter/material.dart';

/// Утилита для работы с IBM Plex Mono шрифтом
class FontUtils {
  /// Семейство шрифта IBM Plex Mono
  static const String ibmPlexMonoFamily = 'IBM Plex Mono';

  /// Создать TextStyle с IBM Plex Mono шрифтом
  static TextStyle createIBMPlexMonoStyle({
    double? fontSize,
    FontWeight? fontWeight,
    Color? color,
    double? height,
    TextDecoration? decoration,
  }) {
    return TextStyle(
      fontFamily: ibmPlexMonoFamily,
      fontSize: fontSize,
      fontWeight: fontWeight ?? FontWeight.normal,
      color: color,
      height: height,
      decoration: decoration,
    );
  }

  /// Стили для финансовых данных (цифры, цены)
  static TextStyle getFinancialStyle({
    double fontSize = 16.0,
    FontWeight fontWeight = FontWeight.w500,
    Color? color,
  }) {
    return createIBMPlexMonoStyle(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: 1.2, // Более плотная высота строки для цифр
    );
  }

  /// Стили для цен (крупные числа)
  static TextStyle getPriceStyle({
    double fontSize = 20.0,
    FontWeight fontWeight = FontWeight.bold,
    Color? color,
  }) {
    return createIBMPlexMonoStyle(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: 1.1, // Очень плотная высота строки для цен
    );
  }

  /// Стили для процентов изменений
  static TextStyle getChangeStyle({
    double fontSize = 14.0,
    FontWeight fontWeight = FontWeight.w600,
    Color? color,
  }) {
    return createIBMPlexMonoStyle(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: 1.2,
    );
  }

  /// Стили для метрик (объемы, активы)
  static TextStyle getMetricStyle({
    double fontSize = 12.0,
    FontWeight fontWeight = FontWeight.w500,
    Color? color,
  }) {
    return createIBMPlexMonoStyle(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: 1.3,
    );
  }

  /// Стили для дат и времени
  static TextStyle getDateTimeStyle({
    double fontSize = 11.0,
    FontWeight fontWeight = FontWeight.normal,
    Color? color,
  }) {
    return createIBMPlexMonoStyle(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: 1.4,
    );
  }

  /// Проверить, доступен ли IBM Plex Mono шрифт
  static bool isIBMPlexMonoAvailable(BuildContext context) {
    try {
      // Пытаемся создать TextStyle с IBM Plex Mono
      final textStyle = createIBMPlexMonoStyle(fontSize: 14.0);
      return textStyle.fontFamily == ibmPlexMonoFamily;
    } catch (e) {
      return false;
    }
  }

  /// Получить fallback стиль, если IBM Plex Mono недоступен
  static TextStyle getFallbackStyle({
    double? fontSize,
    FontWeight? fontWeight,
    Color? color,
    double? height,
  }) {
    return TextStyle(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
      // Используем системный моноширинный шрифт как fallback
      fontFamily: 'monospace',
    );
  }

  /// Создать адаптивный стиль с IBM Plex Mono или fallback
  static TextStyle createAdaptiveIBMPlexMonoStyle(
    BuildContext context, {
    double? fontSize,
    FontWeight? fontWeight,
    Color? color,
    double? height,
  }) {
    if (isIBMPlexMonoAvailable(context)) {
      return createIBMPlexMonoStyle(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
        height: height,
      );
    } else {
      return getFallbackStyle(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
        height: height,
      );
    }
  }
}
