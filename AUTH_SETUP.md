# Настройка аутентификации с Apple Sign-In

## Обзор

В приложении ETF Tracker реализована система аутентификации пользователей с использованием Apple Sign-In. Пользователи сохраняются в базе данных PostgreSQL на бэкенде.

## Архитектура

### Frontend (Flutter)

- **AuthProvider** - управление состоянием аутентификации
- **AuthService** - взаимодействие с API бэкенда
- **ProfileScreen** - экран профиля с Apple Sign-In
- **User Model** - модель пользователя

### Backend (NestJS)

- **AuthModule** - модуль аутентификации
- **AuthController** - API endpoints для аутентификации
- **AuthService** - бизнес-логика аутентификации
- **Prisma Models** - модели пользователей в базе данных

## Настройка

### 1. База данных

Модели пользователей уже добавлены в `backend/prisma/schema.prisma`:

```prisma
model User {
  id            String         @id @default(cuid())
  name          String?
  email        String?         @unique
  appleId      String?         @unique
  subscription Subscription?
  preferences  UserPreferences?
  createdAt    DateTime        @default(now())
  lastLoginAt  DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}

model Subscription {
  id         String   @id @default(cuid())
  plan       String   @default("free")
  expiresAt  DateTime?
  autoRenew  Boolean  @default(false)
  userId     String   @unique
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model UserPreferences {
  id           String   @id @default(cuid())
  notifications Boolean @default(true)
  theme        String   @default("system")
  favoriteETFs String[] @default([])
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 2. Зависимости

#### Flutter (pubspec.yaml)

```yaml
dependencies:
  sign_in_with_apple: ^5.0.0
```

#### Backend (package.json)

```json
{
  "dependencies": {
    "@nestjs/jwt": "^10.2.0"
  }
}
```

### 3. API Endpoints

#### POST /auth/apple

Вход через Apple Sign-In

```json
{
  "identityToken": "string",
  "authorizationCode": "string",
  "userIdentifier": "string",
  "givenName": "string?",
  "familyName": "string?",
  "email": "string?"
}
```

#### GET /auth/validate

Проверка валидности JWT токена

```
Headers: Authorization: Bearer <token>
```

#### PUT /auth/profile

Обновление профиля пользователя

```json
{
  "userId": "string",
  "name": "string?",
  "preferences": {
    "notifications": "boolean?",
    "theme": "string?",
    "favoriteETFs": "string[]?"
  }
}
```

#### PUT /auth/subscription

Обновление подписки

```json
{
  "userId": "string",
  "subscription": {
    "plan": "string",
    "expiresAt": "string?",
    "autoRenew": "boolean?"
  }
}
```

#### POST /auth/device

Регистрация устройства для push-уведомлений

```json
{
  "userId": "string",
  "deviceToken": "string",
  "platform": "string"
}
```

#### POST /auth/logout

Выход из системы

## Использование

### 1. Вход через Apple

```dart
// В ProfileScreen
Future<void> _signInWithApple(AuthProvider authProvider) async {
  try {
    await authProvider.signInWithApple();
  } catch (e) {
    // Обработка ошибки
  }
}
```

### 2. Проверка аутентификации

```dart
// В любом виджете
Consumer<AuthProvider>(
  builder: (context, authProvider, child) {
    if (authProvider.isAuthenticated) {
      return Text('Привет, ${authProvider.currentUser?.name}!');
    } else {
      return Text('Пожалуйста, войдите в систему');
    }
  },
)
```

### 3. Обновление профиля

```dart
await authProvider.updateProfile(
  name: 'Новое имя',
  preferences: UserPreferences(
    notifications: true,
    theme: 'dark',
    favoriteETFs: ['ARKB', 'IBIT'],
  ),
);
```

## Безопасность

### JWT Токены

- Секрет хранится в переменной окружения `JWT_SECRET`
- Токены действительны 30 дней
- Автоматическая валидация на каждом защищенном endpoint

### Apple Sign-In

- Валидация identity token (в реальном приложении)
- Безопасное хранение appleId
- Защита от дублирования пользователей

### База данных

- Уникальные индексы на email и appleId
- Каскадное удаление связанных данных
- Автоматические timestamps

## Платные функции

### Подписки

- **Free** - базовый доступ к данным ETF
- **Basic** - уведомления + расширенные данные
- **Premium** - полная аналитика + персонализация

### Ограничения

- Free пользователи: только базовые данные
- Premium пользователи: все функции без ограничений

## Развертывание

### 1. Переменные окружения

```env
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://user:password@localhost:5432/etf_flow_db
```

### 2. Миграции базы данных

```bash
cd backend
npx prisma migrate dev
```

### 3. Запуск

```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd app && flutter run
```

## Мониторинг

### Логи

- Все операции аутентификации логируются
- Ошибки сохраняются для анализа
- Метрики использования функций

### Аналитика

- Количество регистраций
- Конверсия в премиум
- Активность пользователей

## Будущие улучшения

1. **Google Sign-In** - альтернативный способ входа
2. **Двухфакторная аутентификация** - дополнительная безопасность
3. **Push-уведомления** - интеграция с Firebase
4. **Социальные функции** - обмен портфелями
5. **API для разработчиков** - внешние интеграции
