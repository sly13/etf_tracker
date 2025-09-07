# 🏗️ Мультиприложенческая архитектура

## 📋 Обзор

Система теперь поддерживает несколько приложений в одной базе данных. Каждый пользователь регистрируется в конкретном приложении и может получать уведомления, специфичные для этого приложения.

## 🗄️ Структура базы данных

### Таблица `Application`

```sql
- id: уникальный идентификатор
- name: техническое имя (например: 'etf.flow', 'crypto.tracker')
- displayName: отображаемое имя (например: 'ETF Flow Tracker')
- description: описание приложения
- isActive: активно ли приложение
- createdAt, updatedAt: временные метки
```

### Таблица `User`

```sql
- id: уникальный идентификатор
- applicationId: связь с приложением
- deviceToken: FCM токен устройства (уникальный)
- telegramChatId: Telegram Chat ID (опционально, уникальный)
- firstName, lastName, email, phone: информация о пользователе
- deviceType, appVersion, osVersion, language, timezone, deviceName: информация об устройстве
- enableETFUpdates, enableSignificantFlow, enableTestNotifications, enableTelegramNotifications: настройки уведомлений
- minFlowThreshold, significantChangePercent: пороги уведомлений
- quietHoursStart, quietHoursEnd: тихие часы
- isValid, isActive: статус пользователя
- lastUsed, lastNotificationSent, notificationCount: статистика
- telegramLinkedAt: когда привязан Telegram
- createdAt, updatedAt: временные метки
```

## 🔧 API Эндпоинты

### Регистрация пользователя

```http
POST /applications/register-device
{
  "token": "fcm_token_here",
  "appName": "etf.flow",
  "deviceInfo": {
    "deviceType": "android",
    "appVersion": "1.0.0",
    "osVersion": "14",
    "language": "ru",
    "timezone": "Europe/Moscow",
    "deviceName": "Samsung Galaxy S21",
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "ivan@example.com",
    "phone": "+7900123456"
  }
}
```

### Привязка Telegram

```http
POST /applications/link-telegram
{
  "deviceToken": "fcm_token_here",
  "telegramChatId": "123456789"
}
```

### Отвязка Telegram

```http
POST /applications/unlink-telegram
{
  "deviceToken": "fcm_token_here"
}
```

### Получение информации о приложении

```http
GET /applications/etf.flow
```

### Статистика приложения

```http
GET /applications/etf.flow/stats
```

### Информация о пользователе

```http
GET /applications/user/{deviceToken}
```

### Обновление настроек пользователя

```http
POST /applications/user/{deviceToken}/settings
{
  "enableETFUpdates": true,
  "enableTelegramNotifications": true,
  "minFlowThreshold": 0.5
}
```

### Тестовое уведомление

```http
POST /applications/user/{deviceToken}/test-notification
```

## 📱 Поддерживаемые приложения

### ETF Flow Tracker (`etf.flow`)

- **Описание**: Отслеживание потоков ETF
- **Уведомления**: ETF потоки, значительные изменения
- **Telegram**: Поддерживается

### Crypto Tracker (`crypto.tracker`)

- **Описание**: Отслеживание криптовалют
- **Уведомления**: Значительные изменения
- **Telegram**: Поддерживается

### Portfolio Manager (`portfolio.manager`)

- **Описание**: Менеджер инвестиционного портфеля
- **Уведомления**: ETF потоки, значительные изменения
- **Telegram**: Поддерживается

### Trading Bot (`trading.bot`)

- **Описание**: Автоматический торговый бот
- **Уведомления**: Торговые сигналы
- **Telegram**: Поддерживается

## 🤖 Telegram Bot интеграция

### Команды бота

- `/start` - Активация Telegram уведомлений
- `/stop` - Отключение Telegram уведомлений
- `/status` - Статус аккаунта
- `/help` - Справка

### Процесс привязки

1. Пользователь регистрируется в приложении
2. В приложении находит раздел "Telegram уведомления"
3. Нажимает "Привязать Telegram"
4. Отправляет команду `/start` боту
5. Бот показывает Chat ID
6. Пользователь вводит Chat ID в приложении
7. Приложение вызывает API для привязки

## 🔔 Система уведомлений

### Типы уведомлений

1. **ETF Updates** - обновления ETF потоков (только для ETF приложений)
2. **Significant Flow** - значительные изменения потоков
3. **Test Notifications** - тестовые уведомления
4. **Telegram Notifications** - уведомления в Telegram

### Логика отправки

- Уведомления отправляются только пользователям соответствующих приложений
- Telegram уведомления отправляются только пользователям с привязанными аккаунтами
- Firebase уведомления отправляются на основе настроек пользователя

## 🚀 Развертывание

### 1. Миграция базы данных

```bash
npx prisma migrate dev --name multi-app-architecture
```

### 2. Создание приложений

Приложения создаются автоматически при первой регистрации пользователя.

### 3. Настройка Telegram бота

```env
TELEGRAM_BOT_TOKEN=your_bot_token
```

### 4. Тестирование

```bash
# Регистрация пользователя в ETF приложении
curl -X POST http://localhost:3000/applications/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test_token",
    "appName": "etf.flow",
    "deviceInfo": {
      "deviceType": "android",
      "firstName": "Тест",
      "lastName": "Пользователь"
    }
  }'

# Привязка Telegram
curl -X POST http://localhost:3000/applications/link-telegram \
  -H "Content-Type: application/json" \
  -d '{
    "deviceToken": "test_token",
    "telegramChatId": "123456789"
  }'
```

## 📊 Мониторинг

### Логи для отслеживания

```
✅ Пользователь зарегистрирован в приложении ETF Flow Tracker: test_token...
✅ Telegram аккаунт 123456789 привязан к пользователю user_id
✅ Telegram уведомление отправлено: 5 успешно, 0 ошибок
```

### Статистика

- Количество пользователей по приложениям
- Активность Telegram уведомлений
- Статистика по типам устройств
- Статистика по языкам

## 🔒 Безопасность

- Каждый пользователь привязан к конкретному приложению
- Telegram Chat ID уникален в системе
- Валидация FCM токенов
- Логирование всех операций

## 🎯 Готово!

Система готова для работы с множественными приложениями. Каждое приложение может регистрировать своих пользователей и управлять их настройками уведомлений.
