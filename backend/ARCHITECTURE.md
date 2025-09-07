# Архитектура Backend

## Обзор структуры

Backend разделен на три основные части для лучшей организации кода:

### 📁 `admin-panel/` - Админская панель

Содержит модули для управления администраторами и приложениями:

- **`admin/`** - Управление администраторами
  - `admin.controller.ts` - API для управления администраторами
  - `admin.service.ts` - Бизнес-логика администраторов
  - `admin.module.ts` - Модуль администраторов

- **`applications/`** - Управление приложениями
  - `applications.controller.ts` - API для управления приложениями
  - `applications.service.ts` - Бизнес-логика приложений
  - `applications.module.ts` - Модуль приложений
  - `dto/` - DTO классы для валидации
    - `create-application.dto.ts` - DTO для создания приложения
    - `update-application.dto.ts` - DTO для обновления приложения

- **`services/image-generator/`** - Генерация изображений
  - `image-generator.controller.ts` - API для генерации изображений
  - `image-generator.service.ts` - Сервис генерации изображений
  - `image-generator.module.ts` - Модуль генерации изображений

### 📁 `api/` - API для приложений

Содержит модули для работы с мобильными приложениями:

- **`etf/`** - ETF данные и потоки
  - `etf.controller.ts` - API для получения ETF данных
  - `etf.service.ts` - Сервис ETF данных
  - `etf-flow.controller.ts` - API для ETF потоков
  - `universal-etf-flow.service.ts` - Универсальный сервис ETF потоков
  - `etf-scheduler.service.ts` - Планировщик ETF данных

- **`notifications/`** - Уведомления
  - `notification.controller.ts` - API для уведомлений
  - `notification.service.ts` - Сервис уведомлений
  - `firebase-admin.service.ts` - Firebase интеграция

- **`telegram/`** - Telegram интеграция
  - `telegram.service.ts` - Сервис Telegram
  - `telegram-bot.service.ts` - Telegram бот
  - `telegram.module.ts` - Модуль Telegram

- **`auth/`** - Аутентификация
  - `jwt-auth.guard.ts` - JWT guard для защиты роутов

### 📁 `shared/` - Общие компоненты

Содержит модули, используемые во всех частях приложения:

- **`prisma/`** - База данных
  - `prisma.service.ts` - Prisma сервис
  - `prisma.module.ts` - Prisma модуль

- **`config/`** - Конфигурация
  - `scheduler.config.ts` - Конфигурация планировщика

## Основные модули

### `AppModule`

Главный модуль приложения, который импортирует:

- `SharedModule` - общие компоненты
- `AdminPanelModule` - админская панель
- `ApiModule` - API для приложений

### `AdminPanelModule`

Объединяет все модули админской панели:

- `AdminModule`
- `ApplicationsModule`
- `ImageGeneratorModule`

### `ApiModule`

Объединяет все API модули:

- `EtfModule`
- `ETFFlowModule`
- `NotificationModule`
- `TelegramModule`

### `SharedModule`

Объединяет общие компоненты:

- `PrismaModule`

## Преимущества новой структуры

1. **Четкое разделение ответственности** - админка и API разделены
2. **Легкость поддержки** - каждый модуль имеет свою область ответственности
3. **Масштабируемость** - легко добавлять новые модули в соответствующие секции
4. **Переиспользование** - общие компоненты вынесены в shared
5. **Безопасность** - админские роуты отделены от публичных API

## Маршруты

### Админские роуты (требуют аутентификации)

- `/api/admin/*` - управление администраторами
- `/applications/admin/*` - управление приложениями
- `/image-generator/*` - генерация изображений

### Публичные API роуты

- `/etf/*` - данные ETF
- `/etf-flow/*` - потоки ETF
- `/notifications/*` - уведомления
- `/telegram/*` - Telegram интеграция
