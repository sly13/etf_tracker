# Реализация пуш-уведомлений для ETF Tracker

## 🎯 Что реализовано

### 1. База данных (PostgreSQL)

Добавлены новые таблицы:

- **FCMToken** - хранение токенов устройств с метаданными
- **NotificationLog** - логирование всех отправленных уведомлений
- **NotificationSettings** - глобальные настройки уведомлений

### 2. Backend (NestJS)

- **FirebaseAdminService** - работа с Firebase Admin SDK
- **NotificationService** - бизнес-логика уведомлений
- **NotificationController** - API эндпоинты
- **Интеграция с ETF Scheduler** - автоматическая отправка при обновлении данных

### 3. Frontend (Flutter)

- **NotificationService** - работа с Firebase Messaging
- **NotificationProvider** - управление состоянием уведомлений
- **NotificationSettingsScreen** - экран настроек
- **Интеграция в Settings** - доступ к настройкам уведомлений

## 📊 Что хранится в БД

### FCMToken

```sql
- id: уникальный идентификатор
- token: FCM токен устройства
- isValid: валидность токена
- lastUsed: время последнего использования
- deviceType: тип устройства (android/ios/web)
- appVersion: версия приложения
- osVersion: версия ОС
- language: язык устройства
- timezone: часовой пояс
- notificationsEnabled: включены ли уведомления
```

### NotificationLog

```sql
- id: уникальный идентификатор
- type: тип уведомления (etf_update/significant_flow/test)
- title: заголовок уведомления
- body: текст уведомления
- data: дополнительные данные (JSON)
- sentToTokens: количество токенов
- successCount: успешно отправлено
- failureCount: неудачно отправлено
- createdAt: время создания
```

### NotificationSettings

```sql
- id: уникальный идентификатор
- enableETFUpdates: включить уведомления об обновлениях ETF
- enableSignificantFlow: включить уведомления о значительных изменениях
- enableTestNotifications: включить тестовые уведомления
- minFlowThreshold: минимальный порог для уведомлений (0.1M$)
- significantChangePercent: процент значительного изменения (20%)
- quietHoursStart: время начала тихих часов
- quietHoursEnd: время окончания тихих часов
```

## 🔄 Как это работает

### 1. Регистрация устройства

1. Приложение получает FCM токен
2. Отправляет токен + метаданные на `/notifications/register-token`
3. Сервер сохраняет токен в БД с информацией об устройстве

### 2. Автоматические уведомления

1. Каждый час запускается cron задача парсинга ETF данных
2. При получении новых данных вызывается `sendETFUpdateNotification`
3. Уведомление отправляется на топик `etf_updates`
4. Результат логируется в `NotificationLog`

### 3. Обработка уведомлений

1. **Foreground**: показывается локальное уведомление
2. **Background**: открывается приложение при нажатии
3. **Terminated**: приложение запускается при нажатии

## 🛠️ API Эндпоинты

### Регистрация токена

```http
POST /notifications/register-token
{
  "token": "fcm_token_here",
  "deviceType": "android",
  "appVersion": "1.0.0",
  "osVersion": "14",
  "language": "ru",
  "timezone": "Europe/Moscow"
}
```

### Тестовое уведомление

```http
POST /notifications/test
```

### Статистика токенов

```http
GET /notifications/stats
```

### Настройки уведомлений

```http
GET /notifications/settings
POST /notifications/settings
```

## 📱 Типы уведомлений

### 1. Обновления ETF потоков

- **Триггер**: каждый час при получении новых данных
- **Условие**: потоки > 0.1M$
- **Формат**: "Bitcoin: +12.5M$, Ethereum: -3.2M$"

### 2. Значительные изменения

- **Триггер**: изменение потока > 20%
- **Формат**: "📈 Bitcoin ETF: Приток: 15.2M$ (25.3%)"

### 3. Тестовые уведомления

- **Триггер**: ручной запрос через API или приложение
- **Формат**: "🧪 Тестовое уведомление"

## 🔧 Настройка

### 1. Firebase

- Создать проект в Firebase Console
- Добавить Android/iOS/macOS приложения
- Скачать конфигурационные файлы
- Настроить Firebase Admin SDK на бэкэнде

### 2. Переменные окружения

```env
FIREBASE_PROJECT_ID=etf-tracker-app
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@etf-tracker-app.iam.gserviceaccount.com
```

### 3. Зависимости

```bash
# Flutter
flutter pub get

# Backend
npm install
npx prisma migrate dev
```

## 📈 Мониторинг

### Логи уведомлений

- Все отправки логируются в `NotificationLog`
- Статистика успешности доставки
- Аналитика по типам устройств и языкам

### Очистка токенов

- Автоматическая проверка валидности токенов
- Удаление неактивных токенов
- Обновление статуса токенов

## 🚀 Следующие шаги

1. **Настроить Firebase проект** согласно `FIREBASE_SETUP.md`
2. **Запустить приложение** и проверить регистрацию токенов
3. **Протестировать уведомления** через API или приложение
4. **Настроить мониторинг** и алерты
5. **Оптимизировать** время отправки и частоту уведомлений

## 🔍 Troubleshooting

### Проблемы с токенами

- Проверить настройки Firebase
- Убедиться в правильности конфигурации
- Проверить разрешения на уведомления

### Проблемы с отправкой

- Проверить Firebase Admin SDK
- Убедиться в валидности токенов
- Проверить логи сервера

### Проблемы с получением

- Проверить настройки устройства
- Убедиться в правильности обработчиков
- Проверить статус приложения (foreground/background)
