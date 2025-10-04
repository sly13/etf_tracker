#!/bin/bash

echo "🧹 Очистка проекта от ненужных файлов..."

# Удаляем node_modules во всех проектах
echo "📦 Удаление node_modules..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# Удаляем build директории
echo "🏗️ Удаление build директорий..."
find . -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true

# Удаляем .env файлы (они содержат секретные данные)
echo "🔐 Удаление .env файлов..."
find . -name ".env" -type f -exec rm -f {} + 2>/dev/null || true

# Удаляем Firebase ключи
echo "🔥 Удаление Firebase ключей..."
find . -name "*firebase*.json" -type f -exec rm -f {} + 2>/dev/null || true

# Удаляем логи
echo "📝 Удаление логов..."
find . -name "*.log" -type f -exec rm -f {} + 2>/dev/null || true

# Удаляем временные файлы
echo "🗑️ Удаление временных файлов..."
find . -name "*.tmp" -type f -exec rm -f {} + 2>/dev/null || true
find . -name "*.temp" -type f -exec rm -f {} + 2>/dev/null || true

# Удаляем OS файлы
echo "💻 Удаление OS файлов..."
find . -name ".DS_Store" -type f -exec rm -f {} + 2>/dev/null || true
find . -name "Thumbs.db" -type f -exec rm -f {} + 2>/dev/null || true

echo "✅ Очистка завершена!"
echo ""
echo "📊 Размер проекта после очистки:"
du -sh . 2>/dev/null || echo "Не удалось определить размер"

echo ""
echo "⚠️  ВАЖНО: Не забудьте создать .env файлы с вашими настройками!"
echo "📖 Смотрите ENV_SETUP.md в каждом проекте для инструкций"
