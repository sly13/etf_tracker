#!/bin/bash

echo "🐳 Запуск ETF Tracker Backend в Docker..."

# Проверяем, установлен ли Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

# Проверяем, установлен ли Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

# Переходим в корневую директорию проекта
cd "$(dirname "$0")/.."

# Останавливаем существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Собираем и запускаем контейнеры
echo "🔨 Сборка и запуск контейнеров..."
docker-compose up --build -d

# Проверяем статус контейнеров
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "✅ ETF Tracker Backend запущен в Docker!"
echo ""
echo "📋 Полезные команды:"
echo "  docker-compose logs backend    - просмотр логов backend"
echo "  docker-compose logs postgres   - просмотр логов базы данных"
echo "  docker-compose restart backend - перезапуск backend"
echo "  docker-compose down            - остановка всех контейнеров"
echo "  docker-compose up -d           - запуск контейнеров"
echo ""
echo "🌐 Backend API доступен по адресу: http://localhost:3066"
echo "🌐 Admin панель доступна по адресу: http://localhost:3065"
echo "🗄️ PostgreSQL доступна по адресу: localhost:3080"
