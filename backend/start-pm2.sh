#!/bin/bash

echo "🚀 Запуск ETF Tracker Backend через PM2..."

# Проверяем, установлен ли PM2
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 не установлен. Установите его командой: npm install -g pm2"
    exit 1
fi

# Создаем папку для логов если её нет
mkdir -p logs

# Собираем проект
echo "📦 Сборка проекта..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки проекта"
    exit 1
fi

# Останавливаем существующий процесс если он запущен
echo "🛑 Остановка существующего процесса..."
pm2 stop etf-tracker-backend 2>/dev/null || true
pm2 delete etf-tracker-backend 2>/dev/null || true

# Запускаем приложение через PM2
echo "▶️ Запуск приложения..."
pm2 start ecosystem.config.js

# Проверяем статус
echo "📊 Статус приложения:"
pm2 status

echo ""
echo "✅ Приложение запущено через PM2!"
echo ""
echo "📋 Полезные команды:"
echo "  pm2 logs etf-tracker-backend    - просмотр логов"
echo "  pm2 monit                       - мониторинг процессов"
echo "  pm2 restart etf-tracker-backend - перезапуск"
echo "  pm2 stop etf-tracker-backend    - остановка"
echo "  pm2 delete etf-tracker-backend  - удаление процесса"
echo ""
echo "🌐 Приложение доступно по адресу: http://localhost:3066"
