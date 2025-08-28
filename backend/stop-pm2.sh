#!/bin/bash

echo "🛑 Остановка ETF Tracker Backend..."

# Останавливаем процесс
pm2 stop etf-tracker-backend

# Удаляем процесс из PM2
pm2 delete etf-tracker-backend

echo "✅ Приложение остановлено и удалено из PM2"

# Показываем статус
pm2 status
