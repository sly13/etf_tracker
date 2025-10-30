#!/bin/sh

echo "🚀 Запуск ETF Tracker Backend..."

# Генерируем Prisma Client (нужно для работы приложения)
echo "🔧 Генерация Prisma Client..."
npx prisma generate

# Ждем пока база данных будет готова
echo "⏳ Ожидание подключения к базе данных..."
RETRY_COUNT=0
MAX_RETRIES=30

# Даем базе данных немного времени на запуск
sleep 2

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  # Проверяем подключение через прямой SQL запрос через Prisma Client
  CONNECTION_RESULT=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    (async () => {
      try {
        await prisma.\$queryRawUnsafe('SELECT 1');
        console.log('connected');
      } catch (e) {
        console.log('not_connected');
      } finally {
        await prisma.\$disconnect();
      }
    })();
  " 2>&1)
  
  if echo "$CONNECTION_RESULT" | grep -q "connected"; then
    echo "✅ База данных готова!"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo "   База данных еще не готова, ждем... (попытка $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Не удалось подключиться к базе данных после $MAX_RETRIES попыток"
  echo "Проверьте, что PostgreSQL запущен и DATABASE_URL настроен правильно"
  exit 1
fi

# Проверяем существование таблицы _prisma_migrations и создаем baseline если нужно
echo "🔍 Проверка состояния миграций..."
HAS_MIGRATIONS_TABLE=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      await prisma.\$queryRawUnsafe('SELECT 1 FROM \"_prisma_migrations\" LIMIT 1');
      console.log('exists');
    } catch (e) {
      console.log('not_exists');
    } finally {
      await prisma.\$disconnect();
    }
  })();
" 2>/dev/null)

if [ "$HAS_MIGRATIONS_TABLE" != "exists" ]; then
  echo "⚠️ Таблица _prisma_migrations не существует, создаем baseline..."
  
  # Создаем таблицу и baseline через Node скрипт
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const fs = require('fs');
    const prisma = new PrismaClient();
    
    (async () => {
      try {
        // Сначала создаем таблицу _prisma_migrations
        await prisma.\$executeRawUnsafe(\`
          CREATE TABLE IF NOT EXISTS \"_prisma_migrations\" (
            \"id\" VARCHAR(36) PRIMARY KEY,
            \"checksum\" VARCHAR(64) NOT NULL,
            \"finished_at\" TIMESTAMP(3),
            \"migration_name\" VARCHAR(255) NOT NULL,
            \"logs\" TEXT,
            \"rolled_back_at\" TIMESTAMP(3),
            \"started_at\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \"applied_steps_count\" INTEGER NOT NULL DEFAULT 0
          );
        \`);
        console.log('✅ Таблица _prisma_migrations создана');
        
        // Проверяем существующие таблицы и помечаем миграции
        const tables = await prisma.\$queryRawUnsafe(\`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        \`);
        const tableNames = tables.map(t => t.table_name);
        
        // Миграция 1: init_clean_schema
        if (tableNames.includes('eth_flow') || tableNames.includes('btc_flows')) {
          const existing = await prisma.\$queryRawUnsafe('SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = \'20251011105336_init_clean_schema\' LIMIT 1').catch(() => []);
          if (existing.length === 0) {
            const id = 'init-' + Date.now();
            await prisma.\$executeRawUnsafe('INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "started_at", "finished_at", "applied_steps_count") VALUES (\'' + id + '\', \'baseline\', \'20251011105336_init_clean_schema\', NOW(), NOW(), 1)');
            console.log('✅ Миграция 20251011105336_init_clean_schema помечена');
          }
        }
        
        // Миграция 2: add_etf_notification_tables
        if (tableNames.includes('etf_new_records')) {
          const existing = await prisma.\$queryRawUnsafe('SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = \'20251017095150_add_etf_notification_tables\' LIMIT 1').catch(() => []);
          if (existing.length === 0) {
            const id = 'notif-' + Date.now();
            await prisma.\$executeRawUnsafe('INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "started_at", "finished_at", "applied_steps_count") VALUES (\'' + id + '\', \'baseline\', \'20251017095150_add_etf_notification_tables\', NOW(), NOW(), 1)');
            console.log('✅ Миграция 20251017095150_add_etf_notification_tables помечена');
          }
        }
        
        // Миграция 3: add_sol_flow
        if (tableNames.includes('sol_flow')) {
          const existing = await prisma.\$queryRawUnsafe('SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = \'20251029184712_add_sol_flow\' LIMIT 1').catch(() => []);
          if (existing.length === 0) {
            const id = 'sol-' + Date.now();
            await prisma.\$executeRawUnsafe('INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "started_at", "finished_at", "applied_steps_count") VALUES (\'' + id + '\', \'baseline\', \'20251029184712_add_sol_flow\', NOW(), NOW(), 1)');
            console.log('✅ Миграция 20251029184712_add_sol_flow помечена');
          }
        }
        
        console.log('✅ Baseline создан успешно');
      } catch (error) {
        console.error('❌ Ошибка создания baseline:', error.message);
        process.exit(1);
      } finally {
        await prisma.\$disconnect();
      }
    })();
  " || {
    echo "⚠️ Не удалось создать baseline через Node, пробуем альтернативный способ..."
    # Альтернативный способ через prisma migrate resolve (требует наличия таблицы)
    npx prisma migrate resolve --applied 20251011105336_init_clean_schema 2>/dev/null || true
    npx prisma migrate resolve --applied 20251017095150_add_etf_notification_tables 2>/dev/null || true
    npx prisma migrate resolve --applied 20251029184712_add_sol_flow 2>/dev/null || true
  }
fi

# Применяем миграции через Prisma
echo "🔄 Применение миграций через Prisma..."
npx prisma migrate deploy

# Проверяем статус миграций и исправляем если нужно
echo "🔍 Проверка статуса миграций..."
MIGRATION_STATUS=$(npx prisma migrate status 2>&1)

# Проверяем наличие критически важных таблиц
echo "🔍 Проверка наличия таблиц ETF..."
HAS_ETF_TABLES=$(node -e "
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

if [ "$HAS_ETF_TABLES" != "exists" ]; then
  echo "⚠️ Таблица etf_new_records отсутствует, исправляем через Prisma..."
  
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
  
  echo "🔄 Применяем миграцию заново..."
  npx prisma migrate deploy
  
  # Проверяем снова
  HAS_ETF_TABLES_AFTER=$(node -e "
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
  
  if [ "$HAS_ETF_TABLES_AFTER" = "exists" ]; then
    echo "✅ Таблицы ETF успешно созданы через Prisma migrate deploy!"
    # Перегенерируем Prisma Client после создания таблиц
    echo "🔄 Перегенерация Prisma Client после применения миграций..."
    npx prisma generate
  else
    echo "⚠️ Не удалось создать таблицы через Prisma migrate deploy"
    echo "Попробуйте запустить вручную: npx prisma migrate deploy"
  fi
else
  echo "✅ Таблицы ETF существуют"
fi

# Проверяем наличие таблицы sol_flow
echo "🔍 Проверка наличия таблицы sol_flow..."
HAS_SOL_FLOW=$(node -e "
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

if [ "$HAS_SOL_FLOW" != "exists" ]; then
  echo "⚠️ Таблица sol_flow отсутствует, исправляем через Prisma..."
  
  # Проверяем, помечена ли миграция как примененная
  SOL_MIGRATION_MARKED=$(node -e "
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
  
  if [ "$SOL_MIGRATION_MARKED" = "marked" ]; then
    echo "📝 Миграция sol_flow помечена как примененная, но таблицы нет. Откатываем пометку..."
    npx prisma migrate resolve --rolled-back 20251029184712_add_sol_flow 2>/dev/null || true
  fi
  
  echo "🔄 Применяем миграцию sol_flow заново..."
  npx prisma migrate deploy
  
  # Проверяем снова
  HAS_SOL_FLOW_AFTER=$(node -e "
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
  
  if [ "$HAS_SOL_FLOW_AFTER" = "exists" ]; then
    echo "✅ Таблица sol_flow успешно создана через Prisma migrate deploy!"
    # Перегенерируем Prisma Client после создания таблицы
    echo "🔄 Перегенерация Prisma Client после применения миграций..."
    npx prisma generate
  else
    echo "⚠️ Не удалось создать таблицу sol_flow через Prisma migrate deploy"
    echo "Попробуйте запустить вручную: npx prisma migrate deploy"
  fi
else
  echo "✅ Таблица sol_flow существует"
fi

# Перегенерируем Prisma Client после всех миграций (на случай если были применены новые миграции)
echo "🔄 Финальная перегенерация Prisma Client..."
npx prisma generate

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
