export const schedulerConfig = {
  // Интервал обновления ETF данных (в часах)
  etfUpdateInterval: 1,

  // Время ежедневного обновления (в формате cron)
  dailyUpdateTime: '0 9 * * *', // 9:00 утра каждый день

  // Включить/выключить автоматическое обновление
  enableAutoUpdate: true,

  // Логирование обновлений
  enableLogging: true,

  // Retry настройки при ошибках
  maxRetries: 3,
  retryDelay: 5000, // 5 секунд
};
