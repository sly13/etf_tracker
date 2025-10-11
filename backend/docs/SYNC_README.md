# Скрипты синхронизации криптовалютных свечей

Эти скрипты синхронизируют 5-минутные свечи BTCUSDT и ETHUSDT из Binance Spot API в PostgreSQL таблицу `btc_candles`.

## Установка зависимостей

```bash
npm install
```

## Настройка переменных окружения

Создайте файл `.env` в корне backend проекта со следующими переменными:

```env
# База данных
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Параметры синхронизации BTC (опционально)
SYMBOL=BTCUSDT
INTERVAL=5m
SOURCE=binance_spot
START_FROM=2017-09-01T00:00:00Z

# Параметры синхронизации ETH (опционально)
# SYMBOL=ETHUSDT
# INTERVAL=5m
# SOURCE=binance_spot
# START_FROM=2017-08-17T00:00:00Z
```

## Использование

### Запуск скриптов

```bash
# Синхронизация BTC
npm run sync:btc-klines
# или напрямую
node sync_btc_klines_5m.mjs

# Синхронизация ETH
npm run sync:eth-klines
# или напрямую
node sync_eth_klines_5m.mjs

# Синхронизация обеих криптовалют
npm run sync:all-klines

# Тестирование подключения к БД
npm run test:sync
npm run test:eth-sync
```

### Настройка cron для автоматического запуска

Добавьте в crontab для запуска каждые 5 минут:

```bash
# Редактировать crontab
crontab -e

# Добавить строки (замените путь на актуальный)
# Синхронизация BTC каждые 5 минут
*/5 * * * * cd /path/to/backend && npm run sync:btc-klines >> /var/log/btc-sync.log 2>&1

# Синхронизация ETH каждые 5 минут (с задержкой в 1 минуту)
1,6,11,16,21,26,31,36,41,46,51,56 * * * * cd /path/to/backend && npm run sync:eth-klines >> /var/log/eth-sync.log 2>&1

# Или синхронизация обеих криптовалют последовательно
*/5 * * * * cd /path/to/backend && npm run sync:all-klines >> /var/log/crypto-sync.log 2>&1
```

## Особенности работы

1. **Идемпотентность**: При первом запуске делает backfill от START_FROM. При последующих запусках читает последнюю open_time из БД и догружает только недостающие свечи.

2. **Батчинг**: Загружает данные батчами по 1000 свечей с паузой 200мс между запросами.

3. **Повторы**: При сетевых ошибках делает до 5 попыток с экспоненциальным backoff.

4. **Upsert**: Использует Prisma upsert для безопасного обновления существующих записей.

5. **Логирование**: Подробное логирование процесса синхронизации.

## Структура данных

Скрипты сохраняют данные в таблицу `btc_candles` со следующими полями:

- `symbol`: Символ (BTCUSDT, ETHUSDT)
- `interval`: Интервал (5m)
- `openTime`: Время открытия свечи (UTC)
- `closeTime`: Время закрытия свечи (UTC)
- `open`, `high`, `low`, `close`: Цены OHLC
- `volume`: Объем базового актива
- `quoteVolume`: Объем котируемого актива
- `trades`: Количество сделок
- `takerBuyBase`, `takerBuyQuote`: Объемы покупок
- `source`: Источник данных (binance_spot)
- `insertedAt`, `updatedAt`: Временные метки

## Безопасность

Скрипт безопасно завершается при получении сигналов SIGINT/SIGTERM и корректно закрывает соединения с БД.
