#!/bin/bash

# Скрипт для исправления проблемных миграций без полного сброса
# Более безопасный подход для продакшена

echo "🔧 Исправление проблемных миграций..."

# Проверяем, что мы в правильной директории
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории backend"
    exit 1
fi

# Проверяем переменную окружения DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Ошибка: DATABASE_URL не установлена"
    echo "Установите переменную окружения DATABASE_URL перед запуском"
    exit 1
fi

echo "📊 Текущая база данных: $DATABASE_URL"

# Шаг 1: Проверяем статус миграций
echo "📋 Проверка статуса миграций..."
npx prisma migrate status

# Шаг 2: Помечаем неудачную миграцию как решенную
echo "🔧 Решение проблемы с неудачной миграцией..."
npx prisma migrate resolve --applied 20251011105336_init_clean_schema

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при решении проблемы с миграцией"
    echo "Попробуйте полный сброс с помощью reset-database.sh"
    exit 1
fi

# Шаг 3: Применяем оставшиеся миграции
echo "🔄 Применение оставшихся миграций..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при применении миграций"
    exit 1
fi

# Шаг 4: Генерируем Prisma Client
echo "🔧 Генерация Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при генерации Prisma Client"
    exit 1
fi

# Шаг 5: Проверяем, что таблица applications существует
echo "🔍 Проверка существования таблицы applications..."
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM applications;" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "⚠️  Таблица applications не существует, создаем начальные данные..."
    npx prisma db execute --file prisma/init-data.sql --schema prisma/schema.prisma
else
    echo "✅ Таблица applications существует"
fi

# Шаг 6: Собираем приложение
echo "🔨 Сборка приложения..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при сборке приложения"
    exit 1
fi

echo "✅ Проблемы с миграциями исправлены!"
echo "✅ Приложение собрано и готово к запуску!"
echo ""
echo "🚀 Теперь можно запустить приложение командой:"
echo "   npm run start:prod"
