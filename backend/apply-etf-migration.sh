#!/bin/bash

# Скрипт для применения миграции etf_new_records на продакшене
# Использование: ./apply-etf-migration.sh

set -e

echo "🚀 Применение миграции для таблиц ETF уведомлений..."
echo "=================================================="

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    echo "Убедитесь, что вы находитесь в директории backend и файл .env существует"
    exit 1
fi

echo "✅ Файл .env найден"

# Загружаем переменные окружения
export $(cat .env | grep -v '^#' | xargs)

echo "📊 Подключение к базе данных..."

# Проверяем подключение к базе данных
echo "🔍 Проверка подключения к базе данных..."
if ! npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Ошибка подключения к базе данных"
    echo "Проверьте настройки в файле .env"
    exit 1
fi

echo "✅ Подключение к базе данных успешно"

# Проверяем, существует ли таблица
echo "🔍 Проверка наличия таблицы etf_new_records..."
TABLE_EXISTS=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      await prisma.\$queryRawUnsafe('SELECT 1 FROM \"etf_new_records\" LIMIT 1');
      console.log('exists');
    } catch (e) {
      console.log('not_exists');
    } finally {
      await prisma.\$disconnect();
    }
  })();
" 2>/dev/null)

if [ "$TABLE_EXISTS" = "exists" ]; then
    echo "✅ Таблица etf_new_records уже существует"
    echo "Миграция не требуется"
    exit 0
fi

echo "⚠️ Таблица etf_new_records не существует"
echo "🔄 Применение миграции..."

# Проверяем, помечена ли миграция как примененная
MIGRATION_MARKED=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      const result = await prisma.\$queryRawUnsafe('SELECT 1 FROM \"_prisma_migrations\" WHERE \"migration_name\" = \\'20251017095150_add_etf_notification_tables\\' LIMIT 1');
      console.log('marked');
    } catch (e) {
      console.log('not_marked');
    } finally {
      await prisma.\$disconnect();
    }
  })();
" 2>/dev/null)

if [ "$MIGRATION_MARKED" = "marked" ]; then
    echo "📝 Миграция помечена как примененная, но таблицы нет. Откатываем пометку..."
    npx prisma migrate resolve --rolled-back 20251017095150_add_etf_notification_tables 2>/dev/null || true
fi

# Применяем миграции
echo "🔄 Применение миграций через Prisma migrate deploy..."
npx prisma migrate deploy

# Проверяем снова
echo "🔍 Проверка создания таблицы..."
TABLE_EXISTS_AFTER=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      await prisma.\$queryRawUnsafe('SELECT 1 FROM \"etf_new_records\" LIMIT 1');
      console.log('exists');
    } catch (e) {
      console.log('not_exists');
    } finally {
      await prisma.\$disconnect();
    }
  })();
" 2>/dev/null)

if [ "$TABLE_EXISTS_AFTER" = "exists" ]; then
    echo "✅ Таблица etf_new_records успешно создана!"
    echo "🔄 Перегенерация Prisma Client..."
    npx prisma generate
    echo "✅ Prisma Client перегенерирован"
    echo ""
    echo "🎉 Миграция применена успешно!"
else
    echo "❌ Не удалось создать таблицу через Prisma migrate deploy"
    echo "Попробуйте применить миграцию вручную:"
    echo "  npx prisma migrate deploy"
    exit 1
fi

