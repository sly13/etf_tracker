# Настройка Firebase для пуш-уведомлений

## 1. Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Создать проект"
3. Введите название проекта: `etf-tracker-app`
4. Включите Google Analytics (опционально)
5. Создайте проект

## 2. Настройка Android

### 2.1 Добавление Android приложения

1. В Firebase Console выберите ваш проект
2. Нажмите "Добавить приложение" → Android
3. Введите:
   - **Имя пакета Android**: `com.example.etf_tracker` (или ваш реальный package name)
   - **Псевдоним приложения**: `ETF Tracker`
   - **Отпечаток сертификата SHA-1**: (опционально, для production)

### 2.2 Скачивание google-services.json

1. Скачайте файл `google-services.json`
2. Поместите его в папку `app/android/app/`

### 2.3 Обновление build.gradle

Добавьте в `app/android/build.gradle`:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

Добавьте в `app/android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.4.0'
}
```

## 3. Настройка iOS

### 3.1 Добавление iOS приложения

1. В Firebase Console выберите ваш проект
2. Нажмите "Добавить приложение" → iOS
3. Введите:
   - **ID пакета iOS**: `com.example.etfTracker` (или ваш реальный bundle ID)
   - **Псевдоним приложения**: `ETF Tracker`

### 3.2 Скачивание GoogleService-Info.plist

1. Скачайте файл `GoogleService-Info.plist`
2. Добавьте его в Xcode проект в папку `Runner`

### 3.3 Обновление Podfile

Добавьте в `app/ios/Podfile`:

```ruby
pod 'Firebase/Messaging'
```

Запустите:

```bash
cd app/ios && pod install
```

## 4. Настройка macOS

### 4.1 Добавление macOS приложения

1. В Firebase Console выберите ваш проект
2. Нажмите "Добавить приложение" → macOS
3. Введите:
   - **ID пакета macOS**: `com.example.etfTracker` (или ваш реальный bundle ID)
   - **Псевдоним приложения**: `ETF Tracker`

### 4.2 Скачивание GoogleService-Info.plist

1. Скачайте файл `GoogleService-Info.plist`
2. Добавьте его в Xcode проект в папку `Runner`

### 4.3 Обновление Podfile

Добавьте в `app/macos/Podfile`:

```ruby
pod 'Firebase/Messaging'
```

Запустите:

```bash
cd app/macos && pod install
```

## 5. Настройка Firebase Admin SDK (Backend)

### 5.1 Создание Service Account

1. В Firebase Console перейдите в "Настройки проекта" → "Учетные записи служб"
2. Нажмите "Создать новый закрытый ключ"
3. Скачайте JSON файл с ключом

### 5.2 Настройка переменных окружения

Создайте файл `.env` в папке `backend/`:

```env
FIREBASE_PROJECT_ID=etf-tracker-app
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@etf-tracker-app.iam.gserviceaccount.com
```

### 5.3 Обновление Firebase Admin Service

Обновите `backend/src/notifications/firebase-admin.service.ts`:

```typescript
private initializeFirebase() {
  try {
    if (admin.apps.length === 0) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
  } catch (error) {
    this.logger.error('❌ Ошибка инициализации Firebase Admin SDK:', error);
  }
}
```

## 6. Обновление конфигурации Flutter

### 6.1 Генерация firebase_options.dart

Установите Firebase CLI:

```bash
npm install -g firebase-tools
```

Установите FlutterFire CLI:

```bash
dart pub global activate flutterfire_cli
```

Сгенерируйте конфигурацию:

```bash
cd app
flutterfire configure
```

### 6.2 Обновление firebase_options.dart

Замените содержимое файла `app/firebase_options.dart` на сгенерированное.

## 7. Установка зависимостей

### 7.1 Flutter зависимости

```bash
cd app
flutter pub get
```

### 7.2 Backend зависимости

```bash
cd backend
npm install
```

## 8. Миграция базы данных

```bash
cd backend
npx prisma migrate dev --name add-fcm-tokens
npx prisma generate
```

## 9. Тестирование

### 9.1 Запуск приложения

```bash
cd app
flutter run
```

### 9.2 Запуск бэкэнда

```bash
cd backend
npm run start:dev
```

### 9.3 Тестирование уведомлений

1. Откройте приложение
2. Перейдите в "Настройки" → "Настройки уведомлений"
3. Убедитесь, что уведомления включены
4. Нажмите "Тест" для отправки тестового уведомления

### 9.4 Тестирование через API

```bash
curl -X POST http://localhost:3000/notifications/test
```

## 10. Разрешения для уведомлений

### 10.1 Android

Добавьте в `app/android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### 10.2 iOS

Добавьте в `app/ios/Runner/Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

## 11. Troubleshooting

### 11.1 Проблемы с токенами

- Убедитесь, что Firebase правильно настроен
- Проверьте, что приложение имеет разрешения на уведомления
- Проверьте логи бэкэнда на наличие ошибок

### 11.2 Проблемы с отправкой

- Убедитесь, что Firebase Admin SDK правильно настроен
- Проверьте переменные окружения
- Проверьте, что токены валидны

### 11.3 Проблемы с получением

- Убедитесь, что приложение в foreground/background
- Проверьте настройки уведомлений устройства
- Проверьте логи приложения

## 12. Production настройки

### 12.1 Безопасность

- Никогда не коммитьте файлы с ключами в репозиторий
- Используйте переменные окружения для всех секретов
- Настройте правильные правила безопасности Firebase

### 12.2 Мониторинг

- Включите Firebase Analytics
- Настройте мониторинг ошибок
- Отслеживайте статистику уведомлений

## 13. Дополнительные возможности

### 13.1 Топики

- Подписка на разные топики (bitcoin_updates, ethereum_updates)
- Персонализированные уведомления
- Уведомления по расписанию

### 13.2 Аналитика

- Отслеживание открытий уведомлений
- A/B тестирование уведомлений
- Оптимизация времени отправки
