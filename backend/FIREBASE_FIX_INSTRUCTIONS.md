# Исправление ошибки Firebase на сервере

## Проблема

Приложение не может найти файл `etf-flow-firebase.json` по пути `/var/www/etf_tracker_app/backend/etf-flow-firebase.json`.

## Решение

Обновлен `FirebaseAdminService` для использования переменной окружения `FIREBASE_SERVICE_ACCOUNT_PATH`.

## Шаги для применения исправления на сервере:

### 1. Остановить PM2 процесс

```bash
pm2 stop etf-tracker-backend
```

### 2. Обновить код на сервере

```bash
cd /var/www/etf_tracker_app/backend
git pull origin main
```

### 3. Пересобрать приложение

```bash
npm run build
```

### 4. Перезапустить PM2 с новой конфигурацией

```bash
pm2 start ecosystem.config.js --env production
```

### 5. Проверить логи

```bash
pm2 logs etf-tracker-backend
```

## Что изменилось:

1. **FirebaseAdminService** теперь использует переменную окружения `FIREBASE_SERVICE_ACCOUNT_PATH`
2. **ecosystem.config.js** обновлен с правильным путем к файлу Firebase
3. **env-template.txt** обновлен с новой переменной окружения

## Переменная окружения:

- `FIREBASE_SERVICE_ACCOUNT_PATH=/var/www/etf_tracker_app/backend/etf-flow-firebase.json`

## Проверка:

После перезапуска в логах должно появиться сообщение:

```
🔍 Ищем файл Firebase по пути: /var/www/etf_tracker_app/backend/etf-flow-firebase.json
✅ Firebase Admin SDK инициализирован
```

Если файл все еще не найден, убедитесь что:

1. Файл `etf-flow-firebase.json` существует в `/var/www/etf_tracker_app/backend/`
2. У процесса есть права на чтение файла
3. Переменная окружения установлена корректно
