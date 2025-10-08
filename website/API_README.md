# API Configuration

## Настройка переменных окружения

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```bash
# API Configuration
# Полный URL API (приоритет над отдельными компонентами)
NEXT_PUBLIC_API_URL=https://api-etf.vadimsemenko.ru/api

# Или настройте отдельные компоненты:
NEXT_PUBLIC_API_HOST=api-etf.vadimsemenko.ru
NEXT_PUBLIC_API_PORT=3066
NEXT_PUBLIC_API_PROTOCOL=https
```

## Переменные окружения

### Приоритет конфигурации:

1. `NEXT_PUBLIC_API_URL` - полный URL (если задан, используется вместо отдельных компонентов)
2. Отдельные компоненты:
   - `NEXT_PUBLIC_API_HOST` - хост API (по умолчанию: api-etf.vadimsemenko.ru)
   - `NEXT_PUBLIC_API_PORT` - порт API (по умолчанию: 3066)
   - `NEXT_PUBLIC_API_PROTOCOL` - протокол (по умолчанию: https)

### Примеры конфигурации:

**Продакшн:**

```bash
NEXT_PUBLIC_API_URL=https://api-etf.vadimsemenko.ru/api
```

**Локальная разработка:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:3066/api
# или
NEXT_PUBLIC_API_HOST=localhost
NEXT_PUBLIC_API_PORT=3066
NEXT_PUBLIC_API_PROTOCOL=http
```

## Структура проекта

- `src/config/api.ts` - конфигурация API endpoints с поддержкой переменных окружения
- `src/services/api.ts` - axios клиент с интерцепторами
- `src/types/api.ts` - TypeScript типы для API
- `src/components/ETFSummaryCard.tsx` - компонент использующий API

## Особенности axios клиента

### Интерцепторы запросов

- Логирование всех запросов с методом и URL
- Добавление timestamp для измерения времени выполнения

### Интерцепторы ответов

- Логирование успешных ответов с временем выполнения
- Детальная обработка ошибок с категоризацией:
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Server Error
  - Network errors
  - Request setup errors

### Типизация

- Полная типизация для всех API ответов
- Специальные типы для ошибок API
- Расширение типов axios для metadata
