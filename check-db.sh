#!/bin/bash

# Скрипт для проверки состояния базы данных

ENV=${1:-dev}
COMPOSE_FILE="docker-compose.${ENV}.yml"

echo "🔍 Проверка состояния базы данных (окружение: $ENV)"
echo ""

# Проверка статуса миграций
echo "📋 Статус миграций:"
docker-compose -f "$COMPOSE_FILE" exec -T backend npx prisma migrate status
echo ""

# Проверка существования таблицы btc_candles
echo "🔍 Проверка таблицы btc_candles:"
TABLE_EXISTS=$(docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U etf_user -d etf_tracker -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'btc_candles');" 2>/dev/null | tr -d ' \n')

if [ "$TABLE_EXISTS" = "t" ]; then
    echo "✅ Таблица btc_candles существует"
    
    # Количество записей
    COUNT=$(docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U etf_user -d etf_tracker -t -c "SELECT COUNT(*) FROM btc_candles;" 2>/dev/null | tr -d ' \n')
    echo "📊 Количество записей: $COUNT"
else
    echo "❌ Таблица btc_candles НЕ существует"
fi
echo ""

# Список всех таблиц
echo "📋 Все таблицы в базе данных:"
docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U etf_user -d etf_tracker -c "\dt" 2>/dev/null
echo ""

# Проверка таблицы _prisma_migrations
echo "📋 Примененные миграции:"
docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U etf_user -d etf_tracker -c "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 10;" 2>/dev/null

