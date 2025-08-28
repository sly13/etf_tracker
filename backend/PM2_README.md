# 🚀 PM2 Deployment Guide - ETF Tracker Backend

## 📋 Описание

Руководство по запуску и управлению ETF Tracker Backend через PM2 (Process Manager 2).

## ⚙️ Установка PM2

```bash
# Глобальная установка PM2
npm install -g pm2

# Проверка установки
pm2 --version
```

## 🚀 Запуск приложения

### Автоматический запуск (рекомендуется):

```bash
# Сделать скрипты исполняемыми
chmod +x start-pm2.sh stop-pm2.sh

# Запуск приложения
./start-pm2.sh
```

### Ручной запуск:

```bash
# Сборка проекта
npm run build

# Запуск через PM2
pm2 start ecosystem.config.js

# Или через npm скрипт
npm run pm2:start
```

## 🛑 Остановка приложения

### Автоматическая остановка:

```bash
./stop-pm2.sh
```

### Ручная остановка:

```bash
# Остановка процесса
npm run pm2:stop

# Удаление процесса
npm run pm2:delete
```

## 📊 Управление приложением

### Основные команды:

```bash
# Статус всех процессов
npm run pm2:status
# или
pm2 status

# Просмотр логов
npm run pm2:logs
# или
pm2 logs etf-tracker-backend

# Мониторинг в реальном времени
npm run pm2:monit
# или
pm2 monit

# Перезапуск приложения
npm run pm2:restart
# или
pm2 restart etf-tracker-backend
```

### Прямые PM2 команды:

```bash
# Запуск
pm2 start ecosystem.config.js

# Остановка
pm2 stop etf-tracker-backend

# Перезапуск
pm2 restart etf-tracker-backend

# Удаление
pm2 delete etf-tracker-backend

# Просмотр логов
pm2 logs etf-tracker-backend

# Мониторинг
pm2 monit

# Статус
pm2 status

# Список всех процессов
pm2 list
```

## 🔧 Конфигурация

### Файл `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'etf-tracker-backend',
    script: 'dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3066,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3066,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
  }],
};
```

### Переменные окружения:

Создайте файл `.env` в корне проекта:

```env
DATABASE_URL="postgresql://etf_user:130013@localhost:6001/etf_flow_db?schema=public"
NODE_ENV=production
PORT=3066
```

## 📁 Структура логов

```
backend/
├── logs/
│   ├── err.log      # Логи ошибок
│   ├── out.log      # Стандартный вывод
│   └── combined.log # Все логи
```

## 🚨 Мониторинг и отладка

### Проверка статуса:

```bash
# Статус процесса
pm2 status etf-tracker-backend

# Детальная информация
pm2 show etf-tracker-backend

# Логи в реальном времени
pm2 logs etf-tracker-backend --lines 100
```

### Автоматический перезапуск:

PM2 автоматически перезапускает приложение при:
- Сбоях (crash)
- Превышении лимита памяти (1GB)
- Изменении файлов в папке `dist`

### Планировщик задач:

Приложение автоматически:
- Обновляет ETF данные каждый час
- Выполняет полное обновление каждый день в 9:00
- Логирует все операции

## 🔄 Обновление приложения

```bash
# Остановка
./stop-pm2.sh

# Обновление кода (git pull)

# Пересборка и запуск
./start-pm2.sh
```

## 📝 Полезные команды

```bash
# Очистка всех процессов PM2
pm2 kill

# Сброс счетчиков
pm2 reset

# Сохранение текущей конфигурации
pm2 save

# Восстановление сохраненной конфигурации
pm2 resurrect

# Обновление PM2
pm2 update
```

## 🚨 Troubleshooting

### Приложение не запускается:

1. Проверьте логи: `pm2 logs etf-tracker-backend`
2. Убедитесь, что порт 3066 свободен
3. Проверьте подключение к базе данных
4. Проверьте переменные окружения

### Планировщик не работает:

1. Проверьте логи планировщика
2. Убедитесь, что `enableAutoUpdate: true` в конфигурации
3. Проверьте подключение к интернету для парсинга данных

### Высокое потребление памяти:

1. Проверьте настройки `max_memory_restart`
2. Анализируйте логи на утечки памяти
3. Рассмотрите увеличение лимита памяти

## 🌐 Доступ к приложению

После запуска приложение доступно по адресу:
- **Локально**: http://localhost:3066
- **API**: http://localhost:3066/etf-flow
- **Документация**: http://localhost:3066/docs (если настроен Swagger)
