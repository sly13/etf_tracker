#!/bin/sh

echo "🤖 Запуск ETF Trade Bot..."

# Ждем пока база данных будет готова
echo "⏳ Ожидание подключения к базе данных..."
until npx prisma db push --accept-data-loss > /dev/null 2>&1; do
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

# Запускаем приложение
echo "🎯 Запуск торгового бота..."
exec npm run start:prod
