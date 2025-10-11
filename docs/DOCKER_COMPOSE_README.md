# ETF Tracker - Docker Compose Конфигурации

## 📁 Файлы конфигурации

- `docker-compose.yml` - Базовый файл (по умолчанию для разработки)
- `docker-compose.dev.yml` - Конфигурация для локальной разработки
- `docker-compose.prod.yml` - Конфигурация для продакшена

## 🚀 Запуск

### Локальная разработка (localhost)

```bash
# Использование dev конфигурации
docker-compose -f docker-compose.dev.yml up -d

# Или просто базовый файл (по умолчанию dev)
docker-compose up -d
```

**URLs для разработки:**

- Backend API: http://localhost:3066
- Admin Panel: http://localhost:3065
- Trade Bot API: http://localhost:3088
- Trade Monitoring: http://localhost:3089
- PostgreSQL: localhost:3080

### Продакшен (vadimsemenko.ru домены)

```bash
# Использование prod конфигурации
docker-compose -f docker-compose.prod.yml up -d
```

**URLs для продакшена:**

- Backend API: https://api-etf.vadimsemenko.ru
- Admin Panel: https://admin-etf.vadimsemenko.ru
- Trade Bot API: https://trade-bot.vadimsemenko.ru
- Trade Monitoring: https://trade-monitoring.vadimsemenko.ru

## 🔧 Основные различия

### Development (dev)

- `NODE_ENV=development`
- URLs: `localhost:PORT`
- Volume mapping для hot reload
- Отдельные сети и volumes с суффиксом `_dev`
- OKX_SANDBOX=true (для тестирования)

### Production (prod)

- `NODE_ENV=production`
- URLs: `vadimsemenko.ru` домены
- Без volume mapping (только код в контейнере)
- Отдельные сети и volumes с суффиксом `_prod`
- CORS настроен для продакшен доменов
- OKX_SANDBOX=false (реальная торговля)

## 📊 Сервисы

1. **postgres** - PostgreSQL база данных
2. **backend** - NestJS API сервер
3. **admin** - React админ панель
4. **trade_bot_nest** - NestJS торговый бот
5. **trade_monitoring** - React мониторинг торговли

## 🛠️ Полезные команды

```bash
# Просмотр логов
docker-compose -f docker-compose.dev.yml logs -f

# Пересборка сервиса
docker-compose -f docker-compose.dev.yml build backend

# Остановка всех сервисов
docker-compose -f docker-compose.dev.yml down

# Остановка с удалением volumes
docker-compose -f docker-compose.dev.yml down -v
```

## 🔐 Переменные окружения

**ВСЕ переменные окружения настроены в docker-compose файлах!**

### Backend сервисы (NestJS/Fastify)

Все переменные окружения для `backend` и `trade_bot_nest` настроены в секции `environment` каждого сервиса.

### Frontend сервисы (React)

Для React приложений (`admin`, `trade_monitoring`) переменные окружения встраиваются в сборку через Docker build args.

**НЕ НУЖНЫ .env файлы!** Все настройки в docker-compose файлах.

### Настройка для продакшена

Перед запуском в продакшене замените placeholder значения на реальные:

**В `docker-compose.prod.yml`:**

- `JWT_SECRET=your_production_jwt_secret_here` → реальный JWT секрет
- `OKX_API_KEY=your_production_api_key_here` → реальный OKX API ключ
- `OKX_SECRET_KEY=your_production_secret_key_here` → реальный OKX секрет
- `OKX_PASSPHRASE=your_production_passphrase_here` → реальный OKX пароль
