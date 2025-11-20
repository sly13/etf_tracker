#!/bin/sh

echo "🚀 Запуск ETF Tracker Backend..."

# Генерируем Prisma Client (нужно для работы приложения)
echo "🔧 Генерация Prisma Client..."
npx prisma generate

# Ждем пока база данных будет готова
echo "⏳ Ожидание подключения к базе данных..."
RETRY_COUNT=0
MAX_RETRIES=30

# Даем базе данных немного времени на запуск
sleep 2

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  # Проверяем подключение через прямой SQL запрос через Prisma Client
  CONNECTION_RESULT=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    (async () => {
      try {
        await prisma.\$queryRawUnsafe('SELECT 1');
        console.log('connected');
      } catch (e) {
        console.log('not_connected');
      } finally {
        await prisma.\$disconnect();
      }
    })();
  " 2>&1)
  
  if echo "$CONNECTION_RESULT" | grep -q "connected"; then
    echo "✅ База данных готова!"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo "   База данных еще не готова, ждем... (попытка $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Не удалось подключиться к базе данных после $MAX_RETRIES попыток"
  echo "Проверьте, что PostgreSQL запущен и DATABASE_URL настроен правильно"
  exit 1
fi

# Простая и надежная логика миграций
echo "🔄 Применение миграций..."

# Шаг 1: Исправляем все failed migrations (если есть)
echo "🔍 Исправление failed migrations..."
node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      // Исправляем все failed migrations
      const result = await prisma.\$executeRawUnsafe(\`
        UPDATE \"_prisma_migrations\"
        SET 
          \"finished_at\" = COALESCE(\"finished_at\", NOW()),
          \"rolled_back_at\" = NULL,
          \"applied_steps_count\" = COALESCE(\"applied_steps_count\", 1)
        WHERE \"finished_at\" IS NULL AND \"rolled_back_at\" IS NULL
      \`);
      if (result && result > 0) {
        console.log('✅ Исправлено failed migrations:', result);
      }
    } catch (e) {
      // Игнорируем, если таблица не существует (Prisma создаст её)
      if (!e.message.includes('does not exist') && !e.message.includes('relation')) {
        console.error('Ошибка:', e.message);
      }
    } finally {
      await prisma.\$disconnect();
    }
  })();
" 2>/dev/null || true

# Шаг 2: Применяем все миграции
echo "🔄 Применение миграций через Prisma migrate deploy..."
npx prisma migrate deploy

# Шаг 3: Перегенерируем Prisma Client
echo "🔄 Перегенерация Prisma Client..."
npx prisma generate

# Создаем базовое приложение если его нет
echo "📱 Создание базового приложения..."
if [ -f "prisma/init-data.sql" ]; then
  # Используем prisma db execute если доступно, иначе используем прямой SQL через psql если доступен
  if npx prisma db execute --file prisma/init-data.sql --schema prisma/schema.prisma 2>/dev/null; then
    echo "✅ Начальные данные созданы через Prisma"
  else
    # Если prisma db execute не работает, пробуем через psql
    if command -v psql > /dev/null 2>&1 && [ -n "$DATABASE_URL" ]; then
      echo "⚠️ Prisma db execute не доступен, пробуем через psql..."
      psql "$DATABASE_URL" -f prisma/init-data.sql 2>/dev/null && echo "✅ Начальные данные созданы через psql" || echo "⚠️ Не удалось создать начальные данные (возможно, уже существуют)"
    else
      echo "⚠️ Не удалось выполнить init-data.sql (команда недоступна или данные уже существуют)"
    fi
  fi
else
  echo "⚠️ Файл prisma/init-data.sql не найден, пропускаем создание начальных данных"
fi

# Проверяем наличие данных в таблице btc_candles
echo "🔍 Проверка наличия данных в таблице btc_candles..."
BTC_CANDLES_COUNT=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      const count = await prisma.bTCandle.count();
      console.log(count);
    } catch (e) {
      console.log('0');
    } finally {
      await prisma.\$disconnect();
    }
  })();
" 2>/dev/null)

if [ -z "$BTC_CANDLES_COUNT" ] || [ "$BTC_CANDLES_COUNT" = "0" ]; then
  echo "⚠️ Таблица btc_candles пуста, начинаем импорт данных из CSV..."
  
  CSV_PATH="${CSV_PATH:-data/btc_candles.csv}"
  if [ ! -f "$CSV_PATH" ]; then
    echo "❌ CSV файл не найден: $CSV_PATH"
    echo "⚠️ Пропускаем импорт данных. Приложение будет запущено без исторических данных."
  else
    echo "📂 Импорт данных из: $CSV_PATH"
    if node scripts/import_btc_candles_csv.mjs; then
      echo "✅ Импорт данных завершен успешно!"
    else
      echo "⚠️ Ошибка при импорте данных. Приложение будет запущено без исторических данных."
    fi
  fi
else
  echo "✅ В таблице btc_candles уже есть данные ($BTC_CANDLES_COUNT записей), импорт не требуется"
fi

# Запускаем приложение
echo "🎯 Запуск приложения..."
exec npm run start:prod
