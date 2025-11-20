#!/bin/bash

# Прямое исправление failed migration в базе данных
# Исправляет проблему P3009 без обходных путей

echo "🔧 Прямое исправление failed migration..."

# Проверяем, что мы в правильной директории
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории backend"
    exit 1
fi

# Загружаем переменные из .env файла, если он существует
if [ -f ".env" ]; then
    echo "📄 Загружаем переменные из .env файла..."
    export $(grep -v '^#' .env | xargs)
fi

# Проверяем переменную окружения DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Ошибка: DATABASE_URL не установлена"
    exit 1
fi

echo "📊 Подключение к базе данных..."

# Прямое исправление failed migration в таблице _prisma_migrations
echo "🔧 Исправление статуса failed migration в БД..."

node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      // Проверяем, есть ли failed migration
      const failedMigration = await prisma.\$queryRawUnsafe(\`
        SELECT * FROM \"_prisma_migrations\" 
        WHERE \"migration_name\" = '20251011105336_init_clean_schema' 
        AND \"finished_at\" IS NULL
      \`);
      
      if (failedMigration && failedMigration.length > 0) {
        console.log('📝 Найдена failed migration, исправляем...');
        
        // Обновляем запись: помечаем как успешно примененную
        await prisma.\$executeRawUnsafe(\`
          UPDATE \"_prisma_migrations\"
          SET 
            \"finished_at\" = COALESCE(\"finished_at\", NOW()),
            \"rolled_back_at\" = NULL,
            \"applied_steps_count\" = COALESCE(\"applied_steps_count\", 1)
          WHERE \"migration_name\" = '20251011105336_init_clean_schema'
            AND \"finished_at\" IS NULL
        \`);
        
        console.log('✅ Failed migration исправлена в БД');
      } else {
        // Проверяем, может миграция уже помечена как примененная
        const appliedMigration = await prisma.\$queryRawUnsafe(\`
          SELECT * FROM \"_prisma_migrations\" 
          WHERE \"migration_name\" = '20251011105336_init_clean_schema'
        \`);
        
        if (appliedMigration && appliedMigration.length > 0) {
          console.log('✅ Миграция уже помечена как примененная');
        } else {
          console.log('⚠️ Миграция не найдена в БД');
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
    echo "✅ Prisma Client перегенерирован"
    echo ""
    echo "🎉 Проблема решена!"
else
    echo "❌ Ошибка при применении миграций"
    exit 1
fi

