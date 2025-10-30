#!/bin/bash

# Скрипт для исправления отсутствующей таблицы sol_flow на сервере
# Использует стандартный механизм Prisma для применения миграций

echo "🔧 Исправление отсутствующей таблицы sol_flow через Prisma..."
echo "=============================================================="

# Проверяем наличие DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    if [ -f .env ]; then
        echo "📝 Загружаем DATABASE_URL из .env..."
        export $(cat .env | grep -v '^#' | xargs)
    else
        echo "❌ DATABASE_URL не установлен и файл .env не найден!"
        echo "Установите переменную окружения DATABASE_URL или создайте файл .env"
        exit 1
    fi
fi

echo "📊 Подключение к базе данных: ${DATABASE_URL%%@*}@***"

# Проверяем существование таблицы sol_flow
CHECK_TABLE=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      await prisma.\$queryRawUnsafe('SELECT 1 FROM \"sol_flow\" LIMIT 1');
      console.log('exists');
    } catch (e) {
      console.log('not_exists');
    } finally {
      await prisma.\$disconnect();
    }
  })();
" 2>/dev/null)

if [ "$CHECK_TABLE" = "exists" ]; then
    echo "✅ Таблица sol_flow уже существует"
    echo "🎯 Проверяем статус миграций..."
    npx prisma migrate status
    exit 0
fi

echo "⚠️ Таблица sol_flow не существует"
echo "📋 Проверяем статус миграций..."
npx prisma migrate status

# Проверяем, помечена ли миграция как примененная
MIGRATION_MARKED=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      const result = await prisma.\$queryRawUnsafe('SELECT 1 FROM \"_prisma_migrations\" WHERE \"migration_name\" = \\'20251029184712_add_sol_flow\\' LIMIT 1');
      console.log('marked');
    } catch (e) {
      console.log('not_marked');
    } finally {
      await prisma.\$disconnect();
    }
  })();
" 2>/dev/null)

if [ "$MIGRATION_MARKED" = "marked" ]; then
    echo "📝 Миграция помечена как примененная, но таблицы нет"
    echo "🔄 Откатываем пометку миграции..."
    npx prisma migrate resolve --rolled-back 20251029184712_add_sol_flow
    
    if [ $? -eq 0 ]; then
        echo "✅ Пометка миграции откачена"
    else
        echo "⚠️ Не удалось откатить пометку, пробуем применить миграцию напрямую"
    fi
fi

echo "🔄 Применяем миграции через Prisma migrate deploy..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Миграции применены"
    
    # Проверяем снова
    CHECK_TABLE_AFTER=$(node -e "
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      (async () => {
        try {
          await prisma.\$queryRawUnsafe('SELECT 1 FROM \"sol_flow\" LIMIT 1');
          console.log('exists');
        } catch (e) {
          console.log('not_exists');
        } finally {
          await prisma.\$disconnect();
        }
      })();
    " 2>/dev/null)
    
    if [ "$CHECK_TABLE_AFTER" = "exists" ]; then
        echo ""
        echo "✅ Проблема исправлена!"
        echo "Таблица sol_flow создана через Prisma migrate deploy"
        echo ""
        echo "📋 Финальный статус миграций:"
        npx prisma migrate status
    else
        echo ""
        echo "⚠️ Миграция применена, но таблица все еще не существует"
        echo "Проверьте логи выше для деталей"
        exit 1
    fi
else
    echo ""
    echo "❌ Ошибка при применении миграций"
    echo "Проверьте логи выше для деталей"
    exit 1
fi

