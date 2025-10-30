# Исправление проблемы с таблицей sol_flow

## Проблема
Ошибка: `The table 'public.sol_flow' does not exist in the current database`

Хотя таблица существует в базе данных, Prisma Client не знает о ней.

## Причина
Prisma Client генерируется при сборке Docker образа. Если образ был собран до добавления модели `SolFlow` или Prisma Client не был перегенерирован после применения миграций, он не будет содержать модель `SolFlow`.

## Решение

### Вариант 1: Перегенерировать Prisma Client в контейнере (быстро)

```bash
# Войдите в контейнер backend
docker exec -it etf_backend_prod sh

# Перегенерируйте Prisma Client
npx prisma generate

# Выйдите из контейнера
exit

# Перезапустите контейнер
docker restart etf_backend_prod
```

### Вариант 2: Пересобрать образ (правильно)

```bash
# Пересоберите образ backend без кэша
docker-compose -f docker-compose.prod.yml build --no-cache backend

# Перезапустите контейнеры
docker-compose -f docker-compose.prod.yml up -d backend
```

### Вариант 3: Использовать скрипт исправления

```bash
# Зайдите в контейнер или на сервер
docker exec -it etf_backend_prod sh

# Запустите скрипт исправления
cd /app
./fix-sol-flow.sh

# Или вручную
npx prisma migrate deploy
npx prisma generate
```

## Проверка

После исправления проверьте:

1. **Проверьте, что таблица существует:**
```bash
docker exec etf_backend_prod node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      const result = await prisma.\$queryRaw\`SELECT COUNT(*) FROM sol_flow\`;
      console.log('✅ Таблица существует, записей:', result[0].count);
    } catch (e) {
      console.error('❌ Ошибка:', e.message);
    } finally {
      await prisma.\$disconnect();
    }
  })();
"
```

2. **Проверьте, что Prisma Client знает о модели:**
```bash
docker exec etf_backend_prod node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  console.log('Доступные модели:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
  prisma.\$disconnect();
"
```

Должна быть модель `solFlow` в списке.

## Что было исправлено

1. Добавлена проверка наличия таблицы `sol_flow` в `start.sh`
2. Добавлена автоматическая перегенерация Prisma Client после применения миграций
3. Создан скрипт `fix-sol-flow.sh` для ручного исправления

При следующем запуске приложения проблема должна быть исправлена автоматически.

