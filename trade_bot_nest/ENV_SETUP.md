# Trade Bot NestJS - Настройка окружения

## Переменные окружения

Создайте файл `.env` в корне проекта со следующими переменными:

```bash
# Database Configuration
DATABASE_URL="postgresql://etf_user:etf_password@postgres:5432/etf_tracker?schema=public"

# OKX API Configuration
OKX_API_KEY="your_api_key_here"
OKX_SECRET_KEY="your_secret_key_here"
OKX_PASSPHRASE="your_passphrase_here"
OKX_SANDBOX=false

# Server Configuration
PORT=3088
NODE_ENV=production
CORS_ORIGIN=http://localhost:3089,http://localhost:3000

# Trading Configuration
MIN_FLOW_THRESHOLD=1000000
MAX_POSITION_SIZE=1000
CHECK_INTERVAL=60000

# Timezone
TZ=Europe/Moscow
```

## Получение OKX API ключей

1. Зайдите на [OKX](https://www.okx.com)
2. Перейдите в API Management
3. Создайте новый API ключ
4. Скопируйте API Key, Secret Key и Passphrase
5. Вставьте их в файл `.env`

## Запуск

```bash
# Установка зависимостей
npm install

# Генерация Prisma Client
npx prisma generate

# Запуск в режиме разработки
npm run start:dev

# Запуск в продакшене
npm run start:prod
```

## Docker

```bash
# Сборка образа
docker build -t trade_bot_nest .

# Запуск контейнера
docker run -p 3088:3088 --env-file .env trade_bot_nest
```
