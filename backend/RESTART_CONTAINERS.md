# Полная перезагрузка контейнеров и БД

## Полная очистка и перезапуск (удаляет ВСЕ данные БД!)

### Для production окружения:

```bash
# 1. Остановить и удалить контейнеры
docker-compose -f docker-compose.prod.yml down

# 2. Удалить volumes (это удалит ВСЕ данные в БД!)
docker-compose -f docker-compose.prod.yml down -v

# 3. Пересобрать образы (опционально, если были изменения)
docker-compose -f docker-compose.prod.yml build --no-cache

# 4. Запустить заново
docker-compose -f docker-compose.prod.yml up -d

# 5. Проверить логи
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Для development окружения:

```bash
# 1. Остановить и удалить контейнеры + volumes
docker-compose -f docker-compose.dev.yml down -v

# 2. Пересобрать (если нужно)
docker-compose -f docker-compose.dev.yml build --no-cache

# 3. Запустить
docker-compose -f docker-compose.dev.yml up -d

# 4. Логи
docker-compose -f docker-compose.dev.yml logs -f backend
```

## Быстрый перезапуск (БЕЗ удаления данных БД)

### Production:

```bash
# Перезапустить все контейнеры
docker-compose -f docker-compose.prod.yml restart

# Или только backend
docker-compose -f docker-compose.prod.yml restart backend
```

### Development:

```bash
# Перезапустить все
docker-compose -f docker-compose.dev.yml restart

# Или только backend
docker-compose -f docker-compose.dev.yml restart backend
```

## Удаление только определенного volume

Если нужно удалить только данные БД, но сохранить остальное:

```bash
# Посмотреть список volumes
docker volume ls

# Удалить конкретный volume (например, postgres_data_prod)
docker volume rm etf_app_postgres_data_prod

# Или через docker-compose
docker-compose -f docker-compose.prod.yml down -v postgres_data_prod
```

## Полная очистка Docker (если что-то пошло не так)

⚠️ **ВНИМАНИЕ: Это удалит ВСЕ неиспользуемые контейнеры, сети, volumes и образы!**

```bash
# Остановить все контейнеры
docker stop $(docker ps -aq)

# Удалить все контейнеры
docker rm $(docker ps -aq)

# Удалить все volumes
docker volume prune -f

# Удалить все неиспользуемые образы
docker image prune -a -f

# Полная очистка системы Docker
docker system prune -a --volumes -f
```

## Полезные команды для проверки

```bash
# Проверить статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Посмотреть логи
docker-compose -f docker-compose.prod.yml logs -f

# Войти в контейнер
docker exec -it etf_backend_prod sh

# Проверить подключение к БД из контейнера
docker exec -it etf_backend_prod npx prisma migrate status
```

## Скрипт для быстрой перезагрузки

Создайте файл `restart-containers.sh`:

```bash
#!/bin/bash

echo "🛑 Остановка контейнеров..."
docker-compose -f docker-compose.prod.yml down

echo "🗑️ Удаление volumes (данные БД будут удалены)..."
read -p "Вы уверены? (yes/no): " confirm
if [ "$confirm" = "yes" ]; then
    docker-compose -f docker-compose.prod.yml down -v
    echo "✅ Volumes удалены"
else
    echo "⏭️ Пропускаем удаление volumes"
fi

echo "🔨 Пересборка образов..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Запуск контейнеров..."
docker-compose -f docker-compose.prod.yml up -d

echo "📋 Статус контейнеров:"
docker-compose -f docker-compose.prod.yml ps

echo "📊 Логи backend (последние 50 строк):"
docker-compose -f docker-compose.prod.yml logs --tail=50 backend
```

Сделайте исполняемым:
```bash
chmod +x restart-containers.sh
```

Использование:
```bash
./restart-containers.sh
```

