#!/bin/bash

echo "🚀 Применение миграций для базы данных etf_flow_db"
echo "=================================================="

# Проверяем, существует ли файл .env
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    echo "Создайте файл .env с содержимым:"
    echo "DATABASE_URL=\"postgresql://etf_user:etf_password@localhost:5432/etf_flow_db?schema=public\""
    exit 1
fi

echo "✅ Файл .env найден"

# Загружаем переменные окружения
export $(cat .env | grep -v '^#' | xargs)

echo "📊 Подключение к базе данных: $DATABASE_URL"

# Проверяем подключение к базе данных
echo "🔍 Проверка подключения к базе данных..."
npx prisma db pull --force

if [ $? -eq 0 ]; then
    echo "✅ Подключение к базе данных успешно"
else
    echo "❌ Ошибка подключения к базе данных"
    echo "Проверьте настройки в файле .env"
    exit 1
fi

# Применяем миграции
echo "📝 Применение миграций..."
npx prisma migrate dev --name init_etf_flow_tables

if [ $? -eq 0 ]; then
    echo "✅ Миграции применены успешно"
else
    echo "❌ Ошибка при применении миграций"
    exit 1
fi

# Генерируем Prisma Client
echo "🔧 Генерация Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma Client сгенерирован"
else
    echo "❌ Ошибка при генерации Prisma Client"
    exit 1
fi

# Показываем статус базы данных
echo "📊 Статус базы данных:"
npx prisma db seed

echo ""
echo "🎯 Миграции успешно применены!"
echo "База данных etf_flow_db готова к использованию"
echo ""
echo "Следующие шаги:"
echo "1. Запустите приложение: npm run start:dev"
echo "2. Проверьте API endpoints:"
echo "   - GET /etf-flow - получить данные Ethereum ETF"
echo "   - POST /etf-flow/parse - запустить парсинг"
echo "   - GET /etf-flow/status - статус последнего парсинга"
