#!/bin/bash

# Скрипт для полного сброса и пересоздания базы данных
# Используйте этот скрипт только на сервере разработки/тестирования!

echo "🔄 Полный сброс базы данных..."

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

# Шаг 1: Сбрасываем базу данных (удаляем все таблицы и данные)
echo "🗑️  Сброс базы данных..."
npx prisma migrate reset --force --skip-seed

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при сбросе базы данных"
    exit 1
fi

# Шаг 2: Применяем миграции заново
echo "🔄 Применение миграций..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при применении миграций"
    exit 1
fi

# Шаг 3: Генерируем Prisma Client
echo "🔧 Генерация Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при генерации Prisma Client"
    exit 1
fi

# Шаг 4: Заполняем начальными данными
echo "📱 Создание базового приложения..."
npx prisma db execute --file prisma/init-data.sql --schema prisma/schema.prisma

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при заполнении начальными данными"
    exit 1
fi

# Шаг 5: Собираем приложение
echo "🔨 Сборка приложения..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при сборке приложения"
    exit 1
fi

echo "✅ База данных успешно сброшена и пересоздана!"
echo "✅ Приложение собрано и готово к запуску!"
echo ""
echo "🚀 Теперь можно запустить приложение командой:"
echo "   npm run start:prod"
