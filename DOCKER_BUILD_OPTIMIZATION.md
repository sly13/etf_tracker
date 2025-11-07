# Оптимизация сборки Docker

## Проблема: медленная сборка из-за npm install

## Решения:

### 1. Использовать скрипт сборки с BuildKit (рекомендуется)
```bash
./build-dev.sh
```

Или вручную:
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker-compose -f docker-compose.dev.yml build
```

### 2. Если интернет медленный - использовать китайское зеркало npm (РЕКОМЕНДУЕТСЯ!)

В файле `docker-compose.dev.yml` раскомментируйте строки `USE_NPM_MIRROR: "true"` для нужных сервисов:

```yaml
backend:
  build:
    args:
      USE_NPM_MIRROR: "true"  # Раскомментируйте эту строку
```

Или используйте скрипт сборки:
```bash
# В build-dev.sh раскомментируйте:
# export USE_NPM_MIRROR=true
./build-dev.sh
```

### 3. Собирать образы по отдельности

Если сборка зависает, собирайте по одному сервису:
```bash
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml build trade_bot
docker-compose -f docker-compose.dev.yml build website
```

### 4. Использовать готовые зависимости локально

Если у вас уже установлены node_modules локально, можно использовать volume:
```yaml
volumes:
  - ./backend/node_modules:/app/node_modules
```

Но это может вызвать проблемы с нативными модулями (canvas, puppeteer).

### 5. Проверить интернет-соединение

```bash
# Проверить скорость загрузки npm пакетов
time npm install --dry-run
```

## Текущие оптимизации:

✅ BuildKit cache mounts для npm cache
✅ Увеличенные таймауты (10 минут)
✅ Отключен прогресс и лишние логи
✅ Одно соединение (maxsockets=1) для стабильности
✅ **Retry логика на уровне shell** (3 попытки с задержками)
✅ Опция использования быстрого npm зеркала (китайское)

## Если все еще зависает:

1. Проверьте логи: `docker-compose build --progress=plain backend`
2. Попробуйте собрать только один сервис
3. Используйте китайское зеркало npm
4. Проверьте интернет-соединение и прокси настройки

