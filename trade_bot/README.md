# Trade Bot API

Автоматический торговый бот для мониторинга ETF Flow данных и торговли на OKX, построенный на Fastify.

## Возможности

- ⚡ Быстрый и производительный Fastify сервер
- 🔒 Безопасность с Helmet
- 🌐 CORS поддержка
- 📚 Swagger документация
- 🏥 Health check endpoint
- 📝 Структурированное логирование с Pino
- 🗄️ Подключение к PostgreSQL базе данных
- 📊 Мониторинг BTCFlow и ETHFlow данных
- 🤖 Автоматическая торговля на OKX
- 📈 Отслеживание торговых позиций
- 🔄 Graceful shutdown

## Установка

```bash
npm install
```

## Запуск

### Режим разработки

```bash
npm run dev
```

### Продакшн

```bash
npm start
```

## API Endpoints

### Health & Info

- `GET /` - Главная страница с информацией о API
- `GET /health` - Проверка состояния сервера
- `GET /docs` - Swagger UI документация

### Bot Management

- `POST /api/bot/monitoring/start` - Запустить мониторинг Flow данных
- `POST /api/bot/monitoring/stop` - Остановить мониторинг Flow данных
- `GET /api/bot/monitoring/status` - Получить статус мониторинга
- `GET /api/bot/monitoring/stats` - Получить статистику мониторинга
- `POST /api/bot/monitoring/reset-stats` - Сбросить статистику

### Flow Data

- `GET /api/bot/flow/:asset` - Получить последние Flow данные (btc/eth)

### Trading

- `GET /api/bot/positions` - Получить торговые позиции
- `GET /api/bot/stats` - Получить статистику торговли

### OKX API

- `GET /api/okx/connection` - Проверить подключение к OKX
- `GET /api/okx/prices` - Получить текущие цены BTC и ETH
- `GET /api/okx/ticker/:symbol` - Получить цену конкретного символа
- `GET /api/okx/orders/open` - Получить открытые ордера
- `GET /api/okx/orders/history` - Получить историю ордеров
- `GET /api/okx/orders/:symbol/:orderId` - Получить информацию об ордере
- `GET /api/okx/balance` - Получить баланс аккаунта
- `POST /api/okx/orders/market` - Разместить рыночный ордер
- `POST /api/okx/orders/limit` - Разместить лимитный ордер
- `POST /api/okx/orders/cancel` - Отменить ордер

## Переменные окружения

### Server Configuration

- `PORT` - Порт для запуска сервера (по умолчанию: 3088)
- `HOST` - Хост для запуска сервера (по умолчанию: 0.0.0.0)
- `NODE_ENV` - Окружение (development/production)
- `LOG_LEVEL` - Уровень логирования (по умолчанию: info)

### Database Configuration

- `DB_HOST` - Хост базы данных (по умолчанию: localhost)
- `DB_PORT` - Порт базы данных (по умолчанию: 3080)
- `DB_NAME` - Имя базы данных (по умолчанию: etf_tracker)
- `DB_USER` - Пользователь базы данных (по умолчанию: etf_user)
- `DB_PASSWORD` - Пароль базы данных (по умолчанию: etf_password)

### OKX API Configuration

- `OKX_API_KEY` - API ключ OKX
- `OKX_SECRET_KEY` - Секретный ключ OKX
- `OKX_PASSPHRASE` - Пароль OKX
- `OKX_SANDBOX` - Использовать песочницу (true/false)

### Trading Configuration

- `MIN_FLOW_THRESHOLD` - Минимальное значение flow для торговли (по умолчанию: 1000000)
- `MAX_POSITION_SIZE` - Максимальный размер позиции в USDT (по умолчанию: 1000)
- `CHECK_INTERVAL` - Интервал проверки данных в мс (по умолчанию: 60000)
- `AUTO_START_MONITORING` - Автозапуск мониторинга (true/false)

## Структура проекта

```
trade_bot/
├── src/
│   ├── config/           # Конфигурация приложения
│   │   └── index.js
│   ├── controllers/      # Контроллеры для обработки запросов
│   │   ├── healthController.js
│   │   ├── tradeController.js
│   │   ├── botController.js
│   │   └── okxController.js
│   ├── middleware/       # Middleware функции
│   │   └── index.js
│   ├── models/          # Модели данных
│   │   ├── index.js
│   │   └── flowModels.js
│   ├── plugins/         # Плагины Fastify
│   │   └── index.js
│   ├── routes/          # Маршруты API
│   │   ├── health.js
│   │   ├── trading.js
│   │   ├── bot.js
│   │   └── okx/
│   │       └── index.js
│   ├── schemas/         # Схемы валидации
│   │   └── index.js
│   ├── services/        # Бизнес-логика
│   │   ├── healthService.js
│   │   ├── tradeService.js
│   │   ├── databaseService.js
│   │   ├── okxService.js
│   │   └── flowMonitoringService.js
│   └── utils/           # Утилиты и хелперы
│       ├── helpers.js
│       └── logger.js
├── index.js             # Основной файл сервера
├── package.json         # Зависимости и скрипты
├── Dockerfile          # Docker конфигурация
├── README.md           # Документация
└── .gitignore          # Git ignore файл
```

## Логика работы бота

### Принцип работы

1. **Мониторинг данных**: Бот постоянно проверяет таблицы `BTCFlow` и `ETHFlow` в базе данных
2. **Анализ Flow значений**:
   - Положительные значения → открытие LONG позиций
   - Отрицательные значения → открытие SHORT позиций
3. **Пороговые значения**: Торговля происходит только при превышении `MIN_FLOW_THRESHOLD`
4. **Размер позиции**: Рассчитывается на основе силы сигнала и `MAX_POSITION_SIZE`
5. **Исполнение**: Рыночные ордера размещаются на бирже OKX

### Алгоритм торговли

```
Новые данные в БД → Проверка порога → Определение направления →
Расчет размера позиции → Размещение ордера на OKX → Сохранение позиции в БД
```

### Настройка параметров

- `MIN_FLOW_THRESHOLD`: Минимальное значение flow для срабатывания (по умолчанию: 1,000,000)
- `MAX_POSITION_SIZE`: Максимальный размер позиции в USDT (по умолчанию: 1,000)
- `CHECK_INTERVAL`: Частота проверки данных в миллисекундах (по умолчанию: 60,000 = 1 минута)

## Разработка

Для разработки рекомендуется использовать nodemon для автоматической перезагрузки:

```bash
npm run dev
```

Сервер будет доступен по адресу: http://localhost:3088
Swagger документация: http://localhost:3088/docs
