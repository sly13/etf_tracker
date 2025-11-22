# Настройка Firebase для отправки Push-уведомлений

## Проблема
Без файла сервисного аккаунта Firebase бэкенд не может отправлять push-уведомления на устройства.

## Решение

### Шаг 1: Получение файла сервисного аккаунта

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект **etf-flow** (PROJECT_ID из GoogleService-Info.plist)
3. Перейдите в **Настройки проекта** (иконка шестеренки) → вкладка **"Сервисные аккаунты"**
4. Нажмите **"Создать новый закрытый ключ"** (или используйте существующий)
5. Скачайте JSON-файл

### Шаг 2: Сохранение файла

**Вариант A: Файл (рекомендуется для локальной разработки)**

1. Сохраните скачанный JSON-файл как `etf-flow-firebase.json` в директории `backend/`
2. Убедитесь, что файл добавлен в `.gitignore` (не коммитьте его в репозиторий!)

**Вариант B: Переменная окружения (для Docker/продакшена)**

1. Откройте скачанный JSON-файл
2. Скопируйте всё содержимое JSON
3. Добавьте в `docker-compose.yml` или `.env` файл:

```yaml
environment:
  - FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"etf-flow",...}'
```

Или в `.env` файле:
```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"etf-flow",...}'
```

⚠️ **Важно**: Весь JSON должен быть в одной строке или правильно экранирован.

### Шаг 3: Проверка

После добавления файла или переменной окружения:

1. Перезапустите бэкенд
2. Проверьте логи - должно появиться:
   ```
   ✅ Firebase Admin SDK инициализирован
   ```
3. Попробуйте отправить тестовое уведомление

## Структура файла сервисного аккаунта

Файл должен содержать примерно следующее:
```json
{
  "type": "service_account",
  "project_id": "etf-flow",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@etf-flow.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Отличие от GoogleService-Info.plist

- **GoogleService-Info.plist** - используется в iOS приложении для инициализации Firebase на клиенте
- **etf-flow-firebase.json** - используется на бэкенде для отправки push-уведомлений через Firebase Admin SDK

Это разные файлы для разных целей!

## Безопасность

⚠️ **НИКОГДА не коммитьте файл сервисного аккаунта в Git!**

Убедитесь, что `etf-flow-firebase.json` добавлен в `.gitignore`:
```
backend/etf-flow-firebase.json
backend/*firebase*.json
```





