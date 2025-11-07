#!/bin/bash

# Скрипт для полного сброса базы данных и перезапуска всех сервисов
# Используйте этот скрипт только на сервере разработки/тестирования!

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Определяем режим работы
MODE=${1:-full}
ENV=${2:-dev}

# Если первый аргумент - это окружение (dev/prod), используем полный режим
if [ "$MODE" = "dev" ] || [ "$MODE" = "prod" ]; then
    ENV=$MODE
    MODE="full"
fi

if [ "$MODE" != "full" ] && [ "$MODE" != "db-only" ]; then
    echo -e "${RED}❌ Ошибка: Неверный режим. Используйте 'full' или 'db-only'${NC}"
    echo "Использование:"
    echo "  ./reset-all.sh [full|db-only] [dev|prod]"
    echo "  ./reset-all.sh [dev|prod]  # полный сброс (по умолчанию)"
    exit 1
fi

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo -e "${RED}❌ Ошибка: Неверное окружение. Используйте 'dev' или 'prod'${NC}"
    echo "Использование: ./reset-all.sh [full|db-only] [dev|prod]"
    exit 1
fi

COMPOSE_FILE="docker-compose.${ENV}.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Ошибка: Файл $COMPOSE_FILE не найден${NC}"
    exit 1
fi

if [ "$MODE" = "db-only" ]; then
    echo -e "${BLUE}🔄 Сброс только базы данных (окружение: $ENV)${NC}"
    echo -e "${YELLOW}⚠️  Контейнеры не будут перезапущены${NC}"
else
    echo -e "${BLUE}🔄 Полный сброс базы данных и перезапуск всех сервисов (окружение: $ENV)${NC}"
fi
echo ""

# Подтверждение
echo -e "${YELLOW}⚠️  ВНИМАНИЕ: Это удалит ВСЕ данные в базе данных!${NC}"
read -p "Вы уверены, что хотите продолжить? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}⏭️  Операция отменена${NC}"
    exit 0
fi

if [ "$MODE" = "full" ]; then
    # Шаг 1: Остановка контейнеров
    echo -e "${BLUE}🛑 Остановка контейнеров...${NC}"
    docker-compose -f "$COMPOSE_FILE" down

    # Шаг 2: Удаление volumes (данные БД)
    echo -e "${BLUE}🗑️  Удаление volumes (данные БД будут удалены)...${NC}"
    docker-compose -f "$COMPOSE_FILE" down -v

    # Шаг 3: Пересборка образов
    echo -e "${BLUE}🔨 Пересборка образов...${NC}"
    docker-compose -f "$COMPOSE_FILE" build --no-cache

    # Шаг 4: Запуск контейнеров
    echo -e "${BLUE}🚀 Запуск контейнеров...${NC}"
    docker-compose -f "$COMPOSE_FILE" up -d

    # Шаг 5: Ожидание готовности PostgreSQL
else
    # Режим db-only: только сброс БД через Prisma
    echo -e "${BLUE}🔄 Сброс базы данных через Prisma...${NC}"
    
    # Проверяем, запущен ли контейнер backend
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "backend.*Up"; then
        echo -e "${YELLOW}⚠️  Контейнер backend не запущен. Запускаем...${NC}"
        docker-compose -f "$COMPOSE_FILE" up -d backend
        sleep 3
    fi
    
    # Проверяем, запущен ли контейнер postgres
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "postgres.*Up"; then
        echo -e "${YELLOW}⚠️  Контейнер postgres не запущен. Запускаем...${NC}"
        docker-compose -f "$COMPOSE_FILE" up -d postgres
        sleep 5
    fi
fi

# Ожидание готовности PostgreSQL
echo -e "${BLUE}⏳ Ожидание готовности PostgreSQL...${NC}"
sleep 5

MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U etf_user > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL готов${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}⏳ Ожидание PostgreSQL... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Ошибка: PostgreSQL не запустился за отведенное время${NC}"
    exit 1
fi

# Сброс БД через Prisma (для режима db-only)
if [ "$MODE" = "db-only" ]; then
    echo -e "${BLUE}🗑️  Сброс базы данных (удаление всех данных)...${NC}"
    docker-compose -f "$COMPOSE_FILE" exec -T backend npx prisma migrate reset --force --skip-seed || {
        echo -e "${YELLOW}⚠️  Не удалось сбросить БД через migrate reset. Пробуем альтернативный способ...${NC}"
        # Альтернативный способ: удаляем все таблицы через SQL
        docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U etf_user -d etf_tracker -c "
            DO \$\$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END \$\$;
        " 2>/dev/null || true
        # После удаления таблиц нужно пересоздать таблицу миграций
        echo -e "${BLUE}🔄 Пересоздание таблицы миграций...${NC}"
        sleep 2
    }
fi

# Применение миграций
echo -e "${BLUE}🔄 Применение миграций базы данных...${NC}"
MIGRATION_ATTEMPTS=0
MAX_MIGRATION_ATTEMPTS=3

while [ $MIGRATION_ATTEMPTS -lt $MAX_MIGRATION_ATTEMPTS ]; do
    if docker-compose -f "$COMPOSE_FILE" exec -T backend npx prisma migrate deploy 2>&1 | tee /tmp/migrate_output.log; then
        echo -e "${GREEN}✅ Миграции применены успешно${NC}"
        break
    else
        MIGRATION_ATTEMPTS=$((MIGRATION_ATTEMPTS + 1))
        if [ $MIGRATION_ATTEMPTS -lt $MAX_MIGRATION_ATTEMPTS ]; then
            echo -e "${YELLOW}⚠️  Попытка $MIGRATION_ATTEMPTS/$MAX_MIGRATION_ATTEMPTS не удалась. Повторяем через 3 секунды...${NC}"
            sleep 3
        else
            echo -e "${RED}❌ Не удалось применить миграции после $MAX_MIGRATION_ATTEMPTS попыток${NC}"
            echo -e "${YELLOW}💡 Проверьте логи выше и попробуйте вручную:${NC}"
            echo -e "${YELLOW}   docker-compose -f $COMPOSE_FILE exec backend npx prisma migrate deploy${NC}"
            exit 1
        fi
    fi
done

# Ждем немного, чтобы убедиться, что все таблицы созданы
sleep 2

# Проверка, что таблица btc_candles создана
echo -e "${BLUE}🔍 Проверка создания таблицы btc_candles...${NC}"
TABLE_EXISTS=$(docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U etf_user -d etf_tracker -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'btc_candles');" 2>/dev/null | tr -d ' \n')

if [ "$TABLE_EXISTS" != "t" ]; then
    echo -e "${RED}❌ Ошибка: Таблица btc_candles не создана после применения миграций!${NC}"
    echo -e "${YELLOW}💡 Проверьте статус миграций:${NC}"
    echo -e "${YELLOW}   docker-compose -f $COMPOSE_FILE exec backend npx prisma migrate status${NC}"
    echo -e "${YELLOW}💡 Проверьте логи миграций выше${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Таблица btc_candles успешно создана${NC}"
fi

# Генерация Prisma Client
echo -e "${BLUE}🔧 Генерация Prisma Client...${NC}"
docker-compose -f "$COMPOSE_FILE" exec -T backend npx prisma generate

# Импорт данных из CSV (если файл существует)
# ВАЖНО: Импорт запускается ТОЛЬКО после того, как таблица создана
echo -e "${BLUE}📥 Проверка наличия CSV файла для импорта...${NC}"
CSV_PATH="backend/data/btc_candles.csv"

# Дополнительная проверка: убеждаемся, что таблица существует перед импортом
TABLE_EXISTS_CHECK=$(docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U etf_user -d etf_tracker -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'btc_candles');" 2>/dev/null | tr -d ' \n')

if [ "$TABLE_EXISTS_CHECK" != "t" ]; then
    echo -e "${RED}❌ Критическая ошибка: Таблица btc_candles не существует! Пропускаем импорт.${NC}"
    echo -e "${YELLOW}💡 Сначала примените миграции:${NC}"
    echo -e "${YELLOW}   docker-compose -f $COMPOSE_FILE exec backend npx prisma migrate deploy${NC}"
elif [ -f "$CSV_PATH" ]; then
    echo -e "${GREEN}✅ Найден CSV файл: $CSV_PATH${NC}"
    echo -e "${BLUE}📊 Импорт данных из CSV (это может занять некоторое время для больших файлов)...${NC}"
    
    # Проверяем, смонтирована ли папка data в контейнере
    # Если нет, копируем файл в контейнер
    if ! docker-compose -f "$COMPOSE_FILE" exec -T backend test -f /app/data/btc_candles.csv 2>/dev/null; then
        echo -e "${BLUE}📋 Копирование CSV файла в контейнер...${NC}"
        docker-compose -f "$COMPOSE_FILE" cp "$CSV_PATH" backend:/app/data/btc_candles.csv 2>/dev/null || {
            echo -e "${YELLOW}⚠️  Не удалось скопировать файл в контейнер. Пробуем использовать переменную окружения...${NC}"
        }
    fi
    
    # Проверяем еще раз перед импортом
    sleep 1
    TABLE_EXISTS_FINAL=$(docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U etf_user -d etf_tracker -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'btc_candles');" 2>/dev/null | tr -d ' \n')
    
    if [ "$TABLE_EXISTS_FINAL" = "t" ]; then
        # Запускаем импорт
        echo -e "${BLUE}🚀 Запуск импорта данных...${NC}"
        if docker-compose -f "$COMPOSE_FILE" exec -T backend npm run import:btc-csv; then
            echo -e "${GREEN}✅ Импорт CSV данных завершен успешно!${NC}"
            
            # Проверяем количество импортированных записей
            RECORD_COUNT=$(docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U etf_user -d etf_tracker -t -c "SELECT COUNT(*) FROM btc_candles;" 2>/dev/null | tr -d ' \n')
            echo -e "${GREEN}📊 Импортировано записей: $RECORD_COUNT${NC}"
        else
            echo -e "${YELLOW}⚠️  Ошибка при импорте CSV данных. Продолжаем без импорта.${NC}"
            echo -e "${YELLOW}   Вы можете импортировать данные вручную позже командой:${NC}"
            echo -e "${YELLOW}   docker-compose -f $COMPOSE_FILE exec backend npm run import:btc-csv${NC}"
        fi
    else
        echo -e "${RED}❌ Таблица btc_candles исчезла! Пропускаем импорт.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  CSV файл не найден: $CSV_PATH${NC}"
    echo -e "${YELLOW}   Пропускаем импорт данных.${NC}"
    echo -e "${YELLOW}   Для импорта данных позже используйте:${NC}"
    echo -e "${YELLOW}   docker-compose -f $COMPOSE_FILE exec backend npm run import:btc-csv${NC}"
fi

# Проверка статуса
echo ""
echo -e "${GREEN}✅ Готово!${NC}"
echo ""

if [ "$MODE" = "full" ]; then
    echo -e "${BLUE}📋 Статус контейнеров:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps

    echo ""
    echo -e "${BLUE}📊 Логи backend (последние 20 строк):${NC}"
    docker-compose -f "$COMPOSE_FILE" logs --tail=20 backend

    echo ""
    echo -e "${GREEN}🎉 Все сервисы перезапущены и готовы к работе!${NC}"
else
    echo -e "${BLUE}📋 Статус контейнеров:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps backend postgres

    echo ""
    echo -e "${GREEN}🎉 База данных сброшена и миграции применены!${NC}"
    echo -e "${YELLOW}💡 Контейнеры не были перезапущены. Для полного сброса используйте:${NC}"
    echo -e "${YELLOW}   ./reset-all.sh full $ENV${NC}"
fi

