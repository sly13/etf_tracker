#!/bin/bash

# Скрипт для исправления failed миграции
# Использование: ./fix-failed-migration.sh

set -e

echo "🔧 Исправление failed миграции..."
echo "=================================================="

# Проверяем, что мы в правильной директории
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Файл prisma/schema.prisma не найден!"
    echo "Убедитесь, что вы находитесь в директории backend"
    exit 1
fi

echo "✅ Найдена схема Prisma"

# Проверяем, была ли миграция init_clean_schema применена (есть ли таблицы)
echo "🔍 Проверка, была ли миграция применена..."
HAS_TABLES=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      // Проверяем наличие таблиц, которые создает init_clean_schema
      await prisma.\$queryRawUnsafe('SELECT 1 FROM \"eth_flow\" LIMIT 1');
      await prisma.\$queryRawUnsafe('SELECT 1 FROM \"btc_flows\" LIMIT 1');
      console.log('applied');
    } catch (e) {
      console.log('not_applied');
    } finally {
      await prisma.\$disconnect();
    }
  })();
" 2>/dev/null)

if [ "$HAS_TABLES" = "applied" ]; then
    echo "✅ Миграция была применена (таблицы существуют)"
    echo "🔍 Проверяем статус миграции в БД..."
    
    # Проверяем статус миграции в БД
    MIGRATION_STATUS=$(node -e "
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      (async () => {
        try {
          const result = await prisma.\$queryRawUnsafe(\`
            SELECT 
              migration_name,
              finished_at,
              rolled_back_at,
              started_at
            FROM \"_prisma_migrations\" 
            WHERE \"migration_name\" = '20251011105336_init_clean_schema'
            LIMIT 1
          \`);
          if (result.length > 0) {
            const m = result[0];
            if (m.finished_at && !m.rolled_back_at) {
              console.log('applied');
            } else if (m.rolled_back_at) {
              console.log('rolled_back');
            } else {
              console.log('failed');
            }
          } else {
            console.log('not_found');
          }
        } catch (e) {
          console.log('error');
        } finally {
          await prisma.\$disconnect();
        }
      })();
    " 2>/dev/null)
    
    if [ "$MIGRATION_STATUS" = "failed" ] || [ "$MIGRATION_STATUS" = "not_found" ]; then
        echo "📝 Исправляем статус миграции в БД напрямую..."
        # Исправляем запись в БД напрямую
        node -e "
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          (async () => {
            try {
              // Обновляем запись миграции, помечая её как успешно примененную
              await prisma.\$executeRawUnsafe(\`
                UPDATE \"_prisma_migrations\"
                SET 
                  \"finished_at\" = COALESCE(\"finished_at\", NOW()),
                  \"rolled_back_at\" = NULL
                WHERE \"migration_name\" = '20251011105336_init_clean_schema'
              \`);
              console.log('✅ Миграция исправлена в БД');
            } catch (e) {
              console.error('❌ Ошибка:', e.message);
              process.exit(1);
            } finally {
              await prisma.\$disconnect();
            }
          })();
        "
        
        if [ $? -eq 0 ]; then
            echo "✅ Статус миграции исправлен"
        else
            echo "❌ Ошибка при исправлении статуса миграции"
            exit 1
        fi
    elif [ "$MIGRATION_STATUS" = "applied" ]; then
        echo "✅ Миграция уже помечена как примененная"
    else
        echo "⚠️ Неожиданный статус миграции: $MIGRATION_STATUS"
        echo "📝 Пробуем пометить миграцию как примененную..."
        npx prisma migrate resolve --applied 20251011105336_init_clean_schema 2>/dev/null || true
    fi
else
    echo "⚠️ Миграция не была применена (таблицы отсутствуют)"
    echo "📝 Помечаем миграцию как откаченную..."
    npx prisma migrate resolve --rolled-back 20251011105336_init_clean_schema 2>/dev/null || true
fi

# Применяем все миграции
echo ""
echo "🔄 Применение всех миграций..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Все миграции применены успешно!"
    echo "🔄 Перегенерация Prisma Client..."
    npx prisma generate
    echo "✅ Prisma Client перегенерирован"
    echo ""
    echo "🎉 Проблема с миграциями решена!"
else
    echo "❌ Ошибка при применении миграций"
    exit 1
fi

