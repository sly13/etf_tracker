#!/bin/sh

echo "🚀 Запуск ETF Tracker Backend..."

# Ждем пока база данных будет готова (без изменения схемы)
echo "⏳ Ожидание подключения к базе данных..."
until npx prisma migrate status > /dev/null 2>&1; do
  echo "   База данных еще не готова, ждем..."
  sleep 2
done

echo "✅ База данных готова!"

# Проверяем и применяем миграции
echo "📊 Проверка миграций..."
npx prisma migrate status

echo "🔄 Применение миграций..."
npx prisma migrate deploy

echo "✅ Миграции применены!"

# Создаем базовое приложение если его нет
echo "📱 Создание базового приложения..."
echo "Выполняем команду: npx prisma db execute --file prisma/init-data.sql --schema prisma/schema.prisma"
npx prisma db execute --file prisma/init-data.sql --schema prisma/schema.prisma
echo "Результат команды: $?"

echo "✅ Базовое приложение создано!"

# Запускаем приложение
echo "🎯 Запуск приложения..."
exec npm run start:prod
