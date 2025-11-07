#!/bin/bash
# Скрипт для сборки с BuildKit и оптимизированными настройками

set -e

echo "🚀 Запуск сборки с BuildKit..."

# Включаем BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Опция использования npm зеркала (раскомментируйте если медленный интернет)
# export USE_NPM_MIRROR=true

# Собираем образы с BuildKit
docker-compose -f docker-compose.dev.yml build --progress=plain "$@"

echo "✅ Сборка завершена!"

