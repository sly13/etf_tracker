#!/bin/bash

# Простой скрипт для применения миграции etf_new_records
# Использование: ./apply-etf-migration-now.sh

set -e

echo "🚀 Применение миграции для таблицы etf_new_records..."
echo "=================================================="

# Проверяем, что мы в правильной директории
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Файл prisma/schema.prisma не найден!"
    echo "Убедитесь, что вы находитесь в директории backend"
    exit 1
fi

echo "✅ Найдена схема Prisma"

# Применяем миграции
echo "🔄 Применение миграций через Prisma migrate deploy..."
npx prisma migrate deploy

# Проверяем, что таблица создана
echo "🔍 Проверка создания таблицы etf_new_records..."
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
    echo "✅ Таблица etf_new_records успешно создана!"
    echo "🔄 Перегенерация Prisma Client..."
    npx prisma generate
    echo "✅ Prisma Client перегенерирован"
    echo ""
    echo "🎉 Миграция применена успешно!"
else
    echo "❌ Не удалось создать таблицу"
    echo "Проверьте логи выше для выявления ошибок"
    exit 1
fi

