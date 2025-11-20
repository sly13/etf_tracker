# Исправление failed migration

## Проблема
Ошибка P3009: `migrate found failed migrations in the target database`

## Решение (выполнить в контейнере backend)

```bash
# Войдите в контейнер
docker exec -it etf_backend sh

# Выполните SQL команду для исправления
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    await prisma.\$executeRawUnsafe(\`
      UPDATE \"_prisma_migrations\"
      SET 
        \"finished_at\" = COALESCE(\"finished_at\", NOW()),
        \"rolled_back_at\" = NULL,
        \"applied_steps_count\" = COALESCE(\"applied_steps_count\", 1)
      WHERE \"migration_name\" = '20251011105336_init_clean_schema'
        AND (\"finished_at\" IS NULL OR \"rolled_back_at\" IS NOT NULL)
    \`);
    console.log('✅ Failed migration исправлена');
  } catch (e) {
    console.error('❌ Ошибка:', e.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
})();
"

# Затем примените миграции
npx prisma migrate deploy

# Перегенерируйте Prisma Client
npx prisma generate
```

## Или одной командой из хоста

```bash
docker exec etf_backend node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { try { await prisma.\$executeRawUnsafe(\`UPDATE \"_prisma_migrations\" SET \"finished_at\" = COALESCE(\"finished_at\", NOW()), \"rolled_back_at\" = NULL, \"applied_steps_count\" = COALESCE(\"applied_steps_count\", 1) WHERE \"migration_name\" = '20251011105336_init_clean_schema' AND (\"finished_at\" IS NULL OR \"rolled_back_at\" IS NOT NULL)\`); console.log('✅ Fixed'); } catch (e) { console.error('❌', e.message); process.exit(1); } finally { await prisma.\$disconnect(); } })();" && docker exec etf_backend npx prisma migrate deploy && docker exec etf_backend npx prisma generate
```

