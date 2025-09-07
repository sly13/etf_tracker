# 🔗 Руководство по связыванию пользователей через User ID

## 📋 Обзор

Теперь система поддерживает связывание мобильных пользователей с Telegram ботом через уникальный `userId` из мобильного приложения. Это позволяет пользователям легко подключать свои Telegram аккаунты к своим мобильным профилям.

## 🗄️ Обновленная схема базы данных

### Поле `userId` в таблице `User`

```sql
userId String? @unique // Уникальный ID пользователя в мобильном приложении
```

## 🔧 API Эндпоинты

### 1. Регистрация устройства с User ID

```http
POST /applications/register-device
{
  "token": "fcm_token_here",
  "appName": "etf.flow",
  "userId": "user_12345", // Уникальный ID из мобильного приложения
  "deviceInfo": {
    "deviceType": "android",
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "ivan@example.com"
  }
}
```

### 2. Привязка Telegram по User ID

```http
POST /applications/link-telegram-by-user-id
{
  "userId": "user_12345",
  "telegramChatId": "123456789"
}
```

### 3. Привязка Telegram по Device Token (старый способ)

```http
POST /applications/link-telegram
{
  "deviceToken": "fcm_token_here",
  "telegramChatId": "123456789"
}
```

## 📱 Процесс связывания в мобильном приложении

### Шаг 1: Регистрация пользователя

```javascript
// В мобильном приложении
const response = await fetch('/applications/register-device', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: fcmToken,
    appName: 'etf.flow',
    userId: currentUser.id, // ID пользователя из мобильного приложения
    deviceInfo: {
      deviceType: 'android',
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
    },
  }),
});
```

### Шаг 2: Кнопка "Подписаться на Telegram"

```javascript
// В мобильном приложении
async function subscribeToTelegram() {
  // Открываем Telegram бота
  const botUrl = 'https://t.me/your_bot_username';
  window.open(botUrl, '_blank');

  // Показываем инструкции пользователю
  showInstructions();
}

function showInstructions() {
  alert(`
    Для подписки на Telegram уведомления:
    
    1. Отправьте команду /start боту
    2. Скопируйте Chat ID из ответа бота
    3. Введите Chat ID в поле ниже
  `);
}
```

### Шаг 3: Ввод Chat ID

```javascript
// В мобильном приложении
async function linkTelegramAccount(chatId) {
  const response = await fetch('/applications/link-telegram-by-user-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser.id,
      telegramChatId: chatId,
    }),
  });

  const result = await response.json();
  if (result.success) {
    alert('✅ Telegram аккаунт успешно привязан!');
  } else {
    alert('❌ Ошибка: ' + result.message);
  }
}
```

## 🤖 Обновленный Telegram Bot

### Команда /start

```
👋 Добро пожаловать в ETF Flow Tracker!

Для получения уведомлений вам нужно:
1. 📱 Открыть мобильное приложение
2. 🔗 Перейти в раздел "Telegram уведомления"
3. 📝 Ввести этот Chat ID: `123456789`
4. ✅ Нажать "Привязать аккаунт"

После этого вы будете получать уведомления о:
• 📊 Обновлениях ETF потоков
• 📈 Значительных изменениях потоков
```

### Команда /status

```
📊 Статус аккаунта:

✅ Telegram уведомления: Включены
📱 Приложение: ETF Flow Tracker
👤 Пользователь: Иван Петров
🆔 User ID: user_12345
📅 Привязан: 06.09.2024 19:23

🔔 Активные уведомления:
• ETF потоки
• Значительные изменения
```

## 🔄 Логика работы

### 1. Регистрация пользователя

- Пользователь регистрируется в мобильном приложении
- Приложение отправляет `userId` на сервер
- Сервер создает запись в таблице `User` с `userId`

### 2. Подписка на Telegram

- Пользователь нажимает "Подписаться на Telegram"
- Приложение открывает Telegram бота
- Пользователь отправляет `/start` боту
- Бот показывает Chat ID
- Пользователь вводит Chat ID в приложении
- Приложение вызывает API для привязки

### 3. Отправка уведомлений

- Сервер находит пользователей с `enableTelegramNotifications: true`
- Отправляет уведомления в Telegram
- Логирует результаты

## 🧪 Тестирование

### Тест регистрации с User ID

```bash
curl -X POST http://localhost:3000/applications/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test_token_123",
    "appName": "etf.flow",
    "userId": "user_12345",
    "deviceInfo": {
      "deviceType": "android",
      "firstName": "Тест",
      "lastName": "Пользователь"
    }
  }'
```

### Тест привязки Telegram

```bash
curl -X POST http://localhost:3000/applications/link-telegram-by-user-id \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_12345",
    "telegramChatId": "123456789"
  }'
```

### Проверка статуса пользователя

```bash
curl http://localhost:3000/applications/user/test_token_123
```

## 📊 Преимущества новой системы

1. **Удобство**: Пользователь может связать Telegram с любого устройства
2. **Безопасность**: `userId` уникален и привязан к конкретному пользователю
3. **Гибкость**: Поддержка как старого (deviceToken), так и нового (userId) способа
4. **Масштабируемость**: Легко добавлять новые приложения
5. **Отслеживаемость**: Полная история связывания аккаунтов

## 🔒 Безопасность

- `userId` должен быть уникальным в рамках приложения
- Telegram Chat ID уникален в системе
- Валидация всех входящих данных
- Логирование всех операций связывания

## 🎯 Готово!

Система готова для работы с `userId`. Пользователи могут легко связывать свои Telegram аккаунты с мобильными приложениями через уникальный идентификатор.
