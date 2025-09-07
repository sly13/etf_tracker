# API для управления приложениями

## Обзор

Модуль `applications` предоставляет два типа API:

- **Админские роуты** - для управления приложениями (требуют аутентификации)
- **Публичные API роуты** - для работы мобильных приложений

## Админские роуты (требуют JWT токен)

Все админские роуты требуют заголовок `Authorization: Bearer <jwt_token>`.

### 1. Создание приложения

**POST** `/applications/admin/create`

Создает новое приложение в системе.

**Тело запроса:**

```json
{
  "name": "etf-tracker",
  "displayName": "ETF Flow Tracker",
  "description": "Приложение для отслеживания ETF потоков",
  "isActive": true
}
```

**Поля:**

- `name` (обязательное) - уникальное имя приложения (1-50 символов)
- `displayName` (обязательное) - отображаемое название (1-100 символов)
- `description` (опциональное) - описание приложения (до 500 символов)
- `isActive` (опциональное) - активность приложения (по умолчанию true)

**Ответ:**

```json
{
  "success": true,
  "message": "Приложение успешно создано",
  "application": {
    "id": "clx123...",
    "name": "etf-tracker",
    "displayName": "ETF Flow Tracker",
    "description": "Приложение для отслеживания ETF потоков",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Обновление приложения

**PUT** `/applications/admin/:id`

Обновляет существующее приложение.

**Тело запроса:**

```json
{
  "displayName": "ETF Flow Tracker Pro",
  "description": "Обновленное описание",
  "isActive": false
}
```

**Ответ:**

```json
{
  "success": true,
  "message": "Приложение успешно обновлено",
  "application": {
    "id": "clx123...",
    "name": "etf-tracker",
    "displayName": "ETF Flow Tracker Pro",
    "description": "Обновленное описание",
    "isActive": false,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Удаление приложения

**DELETE** `/applications/admin/:id`

Удаляет приложение (только если в нем нет пользователей).

**Ответ:**

```json
{
  "success": true,
  "message": "Приложение успешно удалено"
}
```

**Ошибка (если есть пользователи):**

```json
{
  "statusCode": 409,
  "message": "Нельзя удалить приложение, в котором зарегистрированы пользователи (5 пользователей)"
}
```

### 4. Получение списка приложений

**GET** `/applications/admin`

Возвращает список всех приложений с количеством пользователей.

**Ответ:**

```json
{
  "success": true,
  "applications": [
    {
      "id": "clx123...",
      "name": "etf-tracker",
      "displayName": "ETF Flow Tracker",
      "description": "Приложение для отслеживания ETF потоков",
      "isActive": true,
      "userCount": 15,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 5. Получение информации о приложении

**GET** `/applications/admin/:id`

Возвращает подробную информацию о приложении с списком пользователей.

**Ответ:**

```json
{
  "success": true,
  "application": {
    "id": "clx123...",
    "name": "etf-tracker",
    "displayName": "ETF Flow Tracker",
    "description": "Приложение для отслеживания ETF потоков",
    "isActive": true,
    "userCount": 2,
    "users": [
      {
        "id": "user123...",
        "userId": "mobile_user_1",
        "deviceId": "device_123",
        "firstName": "Иван",
        "lastName": "Петров",
        "email": "ivan@example.com",
        "deviceType": "android",
        "isActive": true,
        "enableTelegramNotifications": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastUsed": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Публичные API роуты

Эти роуты используются мобильными приложениями и не требуют аутентификации.

### 1. Регистрация устройства

**POST** `/applications/register-device`

Регистрирует устройство пользователя в приложении.

**Тело запроса:**

```json
{
  "token": "fcm_token_here",
  "appName": "etf-tracker",
  "userId": "mobile_user_1",
  "deviceId": "device_123",
  "deviceInfo": {
    "deviceType": "android",
    "appVersion": "1.0.0",
    "osVersion": "13",
    "language": "ru",
    "timezone": "Europe/Moscow",
    "deviceName": "Samsung Galaxy S21",
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "ivan@example.com",
    "phone": "+79001234567"
  }
}
```

### 2. Привязка Telegram

**POST** `/applications/link-telegram`

Привязывает Telegram аккаунт к пользователю.

**Тело запроса:**

```json
{
  "deviceToken": "fcm_token_here",
  "telegramChatId": "123456789"
}
```

### 3. Получение статистики приложения

**GET** `/applications/:appName/stats`

Возвращает статистику пользователей приложения.

**Ответ:**

```json
{
  "success": true,
  "stats": {
    "total": 100,
    "active": 85,
    "inactive": 15,
    "etfUpdatesEnabled": 90,
    "significantFlowEnabled": 75,
    "telegramEnabled": 60,
    "byDeviceType": {
      "android": 60,
      "ios": 40
    },
    "byLanguage": {
      "ru": 70,
      "en": 30
    }
  }
}
```

## Коды ошибок

- `400` - Неверные данные запроса
- `401` - Не авторизован (для админских роутов)
- `404` - Приложение не найдено
- `409` - Конфликт (например, приложение с таким именем уже существует)
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Создание приложения через админку

```bash
curl -X POST http://localhost:3000/applications/admin/create \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "crypto-tracker",
    "displayName": "Crypto Tracker Pro",
    "description": "Приложение для отслеживания криптовалют",
    "isActive": true
  }'
```

### Регистрация устройства из мобильного приложения

```bash
curl -X POST http://localhost:3000/applications/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "token": "fcm_token_from_device",
    "appName": "crypto-tracker",
    "userId": "user_123",
    "deviceId": "device_456",
    "deviceInfo": {
      "deviceType": "ios",
      "appVersion": "1.0.0",
      "osVersion": "17.0",
      "language": "ru",
      "timezone": "Europe/Moscow"
    }
  }'
```
