#!/bin/bash

# Скрипт для обновления данных Solana ETF после добавления новых полей

echo "🔄 Обновление данных Solana ETF..."

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

# Определяем API URL (по умолчанию localhost:3066)
API_URL="${API_URL:-http://localhost:3066}"

echo "📊 Вызов API для парсинга Solana данных..."
echo "URL: ${API_URL}/api/etf-flow/parse-solana"

# Вызываем API эндпоинт
response=$(curl -s -X POST "${API_URL}/api/etf-flow/parse-solana" \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✅ Данные Solana успешно обновлены!"
    echo "Ответ: $body"
else
    echo "❌ Ошибка при обновлении данных (HTTP $http_code)"
    echo "Ответ: $body"
    exit 1
fi

echo ""
echo "🎉 Готово! Все записи в таблице sol_flow обновлены с новыми полями."

