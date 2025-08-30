#!/bin/bash

echo "🚀 Настройка базы данных etf_flow_db для ETF Flow приложения"
echo "================================================================"

# Проверяем, установлен ли PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL не установлен. Установите PostgreSQL и попробуйте снова."
    exit 1
fi

echo "✅ PostgreSQL найден"

# Создаем базу данных если она не существует
echo "📊 Создание базы данных etf_flow_db..."
psql -U postgres -c "CREATE DATABASE etf_flow_db;" 2>/dev/null || echo "База данных уже существует"

echo "✅ База данных etf_flow_db готова"

# Создаем пользователя для приложения (если нужно)
echo "👤 Создание пользователя etf_user..."
psql -U postgres -c "CREATE USER etf_user WITH PASSWORD '130013';" 2>/dev/null || echo "Пользователь уже существует"

# Даем права пользователю на базу данных
echo "🔐 Настройка прав доступа..."
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE etf_flow_db TO etf_user;"
psql -U postgres -c "GRANT ALL ON SCHEMA public TO etf_user;"

echo "✅ Права доступа настроены"

echo ""
echo "📝 Следующие шаги:"
echo "1. Создайте файл .env в папке backend с содержимым:"
echo "   DATABASE_URL=\"postgresql://etf_user:etf_password@localhost:5432/etf_flow_db?schema=public\""
echo "2. Запустите миграции: npx prisma migrate dev"
echo "3. Сгенерируйте Prisma Client: npx prisma generate"
echo ""
echo "🎯 База данных готова к использованию!"
