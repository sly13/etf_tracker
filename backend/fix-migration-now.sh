#!/bin/bash

# Быстрое исправление failed migration
# Выполняет SQL напрямую в базе данных

echo "🔧 Быстрое исправление failed migration..."

# Проверяем, что мы в правильной директории
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории backend"
    exit 1
fi

# Загружаем переменные из .env файла, если он существует
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Проверяем переменную окружения DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Ошибка: DATABASE_URL не установлена"
    exit 1
fi

echo "📊 Исправление failed migration через SQL..."

# Выполняем SQL напрямую
node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      // Обновляем failed migration
      const result = await prisma.\$executeRawUnsafe(\`
        UPDATE \"_prisma_migrations\"
        SET 
          \"finished_at\" = COALESCE(\"finished_at\", NOW()),
          \"rolled_back_at\" = NULL,
          \"applied_steps_count\" = COALESCE(\"applied_steps_count\", 1)
        WHERE \"migration_name\" = '20251011105336_init_clean_schema'
          AND (\"finished_at\" IS NULL OR \"rolled_back_at\" IS NOT NULL)
      \`);
      
      console.log('✅ Failed migration исправлена');
      
      // Проверяем результат
      const check = await prisma.\$queryRawUnsafe(\`
        SELECT 
          \"migration_name\",
          \"finished_at\",
          \"rolled_back_at\"
        FROM \"_prisma_migrations\"
        WHERE \"migration_name\" = '20251011105336_init_clean_schema'
      \`);
      
      if (check && check.length > 0) {
        const m = check[0];
        if (m.finished_at && !m.rolled_back_at) {
          console.log('✅ Миграция помечена как примененная');
        } else {
          console.log('⚠️ Миграция все еще имеет проблемы');
        }
      }
    } catch (e) {
      console.error('❌ Ошибка:', e.message);
      process.exit(1);
    } finally {
      await prisma.\$disconnect();
    }
  })();
"

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при исправлении миграции"
    exit 1
fi

echo ""
echo "🔄 Применение всех миграций..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Все миграции применены успешно!"
    echo "🔄 Перегенерация Prisma Client..."
    npx prisma generate
    echo "✅ Готово!"
else
    echo "❌ Ошибка при применении миграций"
    exit 1
fi

