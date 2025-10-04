/**
 * Безопасное форматирование чисел для отображения в UI
 */

/**
 * Безопасно форматирует число с помощью toLocaleString()
 * @param value - значение для форматирования
 * @param defaultValue - значение по умолчанию, если value равно null/undefined
 * @returns отформатированная строка
 */
export const safeFormatNumber = (
  value: number | null | undefined,
  defaultValue: number = 0
): string => {
  const numValue = value ?? defaultValue;
  return numValue.toLocaleString();
};

/**
 * Безопасно форматирует число в миллионах/миллиардах с автоматическим выбором единицы
 * @param value - значение для форматирования (в миллионах)
 * @param decimals - количество знаков после запятой (по умолчанию 1)
 * @param defaultValue - значение по умолчанию, если value равно null/undefined
 * @returns отформатированная строка с суффиксом M или B
 * @example
 * safeFormatMillions(500) // "500.0M"
 * safeFormatMillions(1500) // "1.5B"
 * safeFormatMillions(-2000) // "-2.0B"
 */
export const safeFormatMillions = (
  value: number | null | undefined,
  decimals: number = 1,
  defaultValue: number = 0
): string => {
  const numValue = value ?? defaultValue;

  // Если значение больше или равно 1000 миллионов, показываем в миллиардах
  if (Math.abs(numValue) >= 1000) {
    const billions = numValue / 1000;
    return `${billions.toFixed(decimals)}B`;
  }

  // Для значений меньше 1000 миллионов показываем в миллионах
  return `${numValue.toFixed(decimals)}M`;
};

/**
 * Безопасно форматирует число с валютным символом
 * @param value - значение для форматирования
 * @param currency - символ валюты (по умолчанию '$')
 * @param defaultValue - значение по умолчанию, если value равно null/undefined
 * @returns отформатированная строка с валютой
 */
export const safeFormatCurrency = (
  value: number | null | undefined,
  currency: string = "$",
  defaultValue: number = 0
): string => {
  const numValue = value ?? defaultValue;
  return `${currency}${numValue.toLocaleString()}`;
};

/**
 * Безопасно форматирует процентное значение
 * @param value - значение для форматирования
 * @param decimals - количество знаков после запятой (по умолчанию 2)
 * @param defaultValue - значение по умолчанию, если value равно null/undefined
 * @returns отформатированная строка с символом %
 */
export const safeFormatPercentage = (
  value: number | null | undefined,
  decimals: number = 2,
  defaultValue: number = 0
): string => {
  const numValue = value ?? defaultValue;
  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Безопасно форматирует дату
 * @param date - дата для форматирования
 * @param options - опции форматирования
 * @returns отформатированная строка даты
 */
export const safeFormatDate = (
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return "-";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Если переданные опции, используем их
    if (options) {
      return dateObj.toLocaleDateString("ru-RU", options);
    }

    // По умолчанию показываем день и месяц
    return dateObj.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch (error) {
    console.warn("Ошибка форматирования даты:", error);
    return "-";
  }
};

/**
 * Безопасно форматирует дату для графиков (короткий формат)
 * @param date - дата для форматирования
 * @returns отформатированная строка даты для графиков
 */
export const safeFormatChartDate = (
  date: string | Date | null | undefined
): string => {
  if (!date) return "-";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch (error) {
    console.warn("Ошибка форматирования даты для графика:", error);
    return "-";
  }
};

/**
 * Безопасно форматирует дату и время
 * @param date - дата для форматирования
 * @param options - опции форматирования
 * @returns отформатированная строка даты и времени
 */
export const safeFormatDateTime = (
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return "-";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("ru-RU", options);
  } catch (error) {
    console.warn("Ошибка форматирования даты и времени:", error);
    return "-";
  }
};
