#!/bin/sh

echo "🔧 Создание baseline для существующей базы данных..."
echo "=================================================="

# Проверяем, что DATABASE_URL установлена
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Ошибка: DATABASE_URL не установлена"
  exit 1
fi

echo "📊 База данных: $DATABASE_URL"
echo ""

# Список всех миграций в хронологическом порядке
MIGRATIONS="20251011105336_init_clean_schema 20251017095150_add_etf_notification_tables 20251029184712_add_sol_flow"

echo "📋 Доступные миграции:"
for migration in $MIGRATIONS; do
  echo "   - $migration"
done

echo ""
echo "🔍 Проверяем, какие таблицы уже существуют в базе данных..."

# Проверяем наличие ключевых таблиц
HAS_ETH_FLOW=false
HAS_BTC_FLOW=false
HAS_SOL_FLOW=false
HAS_ETF_NEW_RECORDS=false

# Проверяем через prisma (используем db execute для проверки)
if npx prisma db execute --stdin <<< "SELECT 1 FROM eth_flow LIMIT 1;" > /dev/null 2>&1; then
  HAS_ETH_FLOW=true
  echo "✅ Таблица eth_flow существует"
fi

if npx prisma db execute --stdin <<< "SELECT 1 FROM btc_flows LIMIT 1;" > /dev/null 2>&1; then
  HAS_BTC_FLOW=true
  echo "✅ Таблица btc_flows существует"
fi

if npx prisma db execute --stdin <<< "SELECT 1 FROM sol_flow LIMIT 1;" > /dev/null 2>&1; then
  HAS_SOL_FLOW=true
  echo "✅ Таблица sol_flow существует"
fi

if npx prisma db execute --stdin <<< "SELECT 1 FROM etf_new_records LIMIT 1;" > /dev/null 2>&1; then
  HAS_ETF_NEW_RECORDS=true
  echo "✅ Таблица etf_new_records существует"
fi

echo ""
echo "🔧 Определяем, какие миграции нужно пометить как примененные..."

# Создаем таблицу _prisma_migrations если её нет
echo "📝 Создание таблицы _prisma_migrations..."
npx prisma db execute --stdin <<'SQL'
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
SQL

if [ $? -ne 0 ]; then
  echo "⚠️ Не удалось создать таблицу через Prisma, пробуем напрямую..."
  # Пробуем через psql если доступен
  if command -v psql > /dev/null 2>&1; then
    psql "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
SQL
  fi
fi

# Помечаем миграции как примененные в зависимости от существующих таблиц
echo ""
echo "📝 Помечаем миграции как примененные..."

# Миграция 1: init_clean_schema (создает eth_flow, btc_flows и базовые таблицы)
if [ "$HAS_ETH_FLOW" = true ] || [ "$HAS_BTC_FLOW" = true ]; then
  echo "✅ Помечаем 20251011105336_init_clean_schema как примененную..."
  npx prisma migrate resolve --applied 20251011105336_init_clean_schema 2>/dev/null || \
  npx prisma migrate resolve --rolled-back 20251011105336_init_clean_schema 2>/dev/null || \
  echo "⚠️ Не удалось пометить миграцию автоматически"
fi

# Миграция 2: add_etf_notification_tables (создает etf_new_records и связанные таблицы)
if [ "$HAS_ETF_NEW_RECORDS" = true ]; then
  echo "✅ Помечаем 20251017095150_add_etf_notification_tables как примененную..."
  npx prisma migrate resolve --applied 20251017095150_add_etf_notification_tables 2>/dev/null || \
  echo "⚠️ Не удалось пометить миграцию автоматически"
fi

# Миграция 3: add_sol_flow (создает sol_flow)
if [ "$HAS_SOL_FLOW" = true ]; then
  echo "✅ Помечаем 20251029184712_add_sol_flow как примененную..."
  npx prisma migrate resolve --applied 20251029184712_add_sol_flow 2>/dev/null || \
  echo "⚠️ Не удалось пометить миграцию автоматически"
fi

echo ""
echo "🔄 Применяем оставшиеся миграции..."
npx prisma migrate deploy

echo ""
echo "✅ Baseline создан!"
echo "📊 Проверяем статус миграций..."
npx prisma migrate status

