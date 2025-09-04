import 'package:flutter/services.dart';

class HapticUtils {
  /// Легкая вибрация для нажатий на кнопки и карточки
  static void lightImpact() {
    HapticFeedback.lightImpact();
  }

  /// Средняя вибрация для важных действий
  static void mediumImpact() {
    HapticFeedback.mediumImpact();
  }

  /// Тяжелая вибрация для критических действий
  static void heavyImpact() {
    HapticFeedback.heavyImpact();
  }

  /// Вибрация для выбора (как в системных настройках)
  static void selectionChanged() {
    HapticFeedback.lightImpact();
  }

  /// Вибрация для успешных действий
  static void notificationSuccess() {
    HapticFeedback.lightImpact();
  }

  /// Вибрация для предупреждений
  static void notificationWarning() {
    HapticFeedback.mediumImpact();
  }

  /// Вибрация для ошибок
  static void notificationError() {
    HapticFeedback.heavyImpact();
  }
}
