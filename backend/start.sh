#!/bin/sh

echo "🚀 Запуск ETF Tracker Backend..."

# Генерируем Prisma Client (нужно для работы приложения)
echo "🔧 Генерация Prisma Client..."
npx prisma generate

# Ждем пока база данных будет готова и применяем миграции
echo "⏳ Ожидание подключения к базе данных и применение миграций..."
RETRY_COUNT=0
MAX_RETRIES=30

# Пробуем применить миграции с повторными попытками
# migrate deploy автоматически создаст таблицу _prisma_migrations если её нет
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "🔄 Попытка применения миграций... (попытка $((RETRY_COUNT + 1))/$MAX_RETRIES)"
  
  # Показываем вывод команды для диагностики
  if npx prisma migrate deploy; then
    echo "✅ Миграции применены успешно!"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "   База данных еще не готова или ошибка подключения, ждем 2 секунды..."
      sleep 2
    fi
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Не удалось применить миграции после $MAX_RETRIES попыток"
  echo "Проверяем статус миграций..."
  npx prisma migrate status || true
  echo "⚠️ Продолжаем запуск, но возможны проблемы с базой данных"
fi

# Создаем базовое приложение если его нет
echo "📱 Создание базового приложения..."
if [ -f "prisma/init-data.sql" ]; then
  # Используем prisma db execute если доступно, иначе используем прямой SQL через psql если доступен
  if npx prisma db execute --file prisma/init-data.sql --schema prisma/schema.prisma 2>/dev/null; then
    echo "✅ Начальные данные созданы через Prisma"
  else
    # Если prisma db execute не работает, пробуем через psql
    if command -v psql > /dev/null 2>&1 && [ -n "$DATABASE_URL" ]; then
      echo "⚠️ Prisma db execute не доступен, пробуем через psql..."
      psql "$DATABASE_URL" -f prisma/init-data.sql 2>/dev/null && echo "✅ Начальные данные созданы через psql" || echo "⚠️ Не удалось создать начальные данные (возможно, уже существуют)"
    else
      echo "⚠️ Не удалось выполнить init-data.sql (команда недоступна или данные уже существуют)"
    fi
  fi
else
  echo "⚠️ Файл prisma/init-data.sql не найден, пропускаем создание начальных данных"
fi

# Запускаем приложение
echo "🎯 Запуск приложения..."
exec npm run start:prod
