# Docker Setup для ETF Tracker

## Описание

Этот проект содержит Docker контейнеры для:

- **PostgreSQL** - база данных
- **Backend** - NestJS API сервер
- **Admin** - React админ панель

## Быстрый старт

### 1. Настройка переменных окружения

Скопируйте файл `docker.env` и настройте переменные:

```bash
cp docker.env .env
```

Обязательно измените следующие переменные:

- `JWT_SECRET` - секретный ключ для JWT токенов
- `DATABASE_URL` - URL подключения к базе данных
- `FIREBASE_*` - настройки Firebase (если используется)
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота (если используется)

### 2. Запуск всех сервисов

```bash
docker-compose up -d
```

### 3. Применение миграций базы данных

```bash
docker-compose exec backend npx prisma migrate deploy
```

### 4. Генерация Prisma клиента (если нужно)

```bash
docker-compose exec backend npx prisma generate
```

## Доступ к сервисам

- **Admin панель**: http://localhost:3065
- **Backend API**: http://localhost:3066
- **PostgreSQL**: localhost:5432

## Полезные команды

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f admin
docker-compose logs -f postgres
```

### Остановка сервисов

```bash
docker-compose down
```

### Пересборка контейнеров

```bash
docker-compose up --build -d
```

### Подключение к базе данных

```bash
docker-compose exec postgres psql -U etf_user -d etf_tracker
```

### Выполнение команд в контейнерах

```bash
# Backend
docker-compose exec backend npm run start:dev

# Admin
docker-compose exec admin npm start
```

## Структура проекта

```
├── admin/                 # React админ панель
│   ├── Dockerfile
│   └── ...
├── backend/               # NestJS API
│   ├── Dockerfile
│   ├── prisma/
│   └── ...
├── docker-compose.yml     # Конфигурация Docker Compose
├── docker.env            # Переменные окружения
└── README.md             # Этот файл
```

## Troubleshooting

### Проблемы с базой данных

Если база данных не запускается, попробуйте:

```bash
docker-compose down -v  # Удаляет volumes
docker-compose up -d
```

### Проблемы с Prisma

Если возникают проблемы с Prisma:

```bash
docker-compose exec backend npx prisma db push
docker-compose exec backend npx prisma generate
```

### Проблемы с портами

Убедитесь, что порты 3066, 3065 и 5432 свободны:

```bash
lsof -i :3066
lsof -i :3065
lsof -i :5432
```
