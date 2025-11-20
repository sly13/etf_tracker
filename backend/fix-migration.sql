-- Прямое исправление failed migration в таблице _prisma_migrations
-- Исправляет проблему P3009

-- Обновляем запись failed migration, помечая её как успешно примененную
UPDATE "_prisma_migrations"
SET 
  "finished_at" = COALESCE("finished_at", NOW()),
  "rolled_back_at" = NULL,
  "applied_steps_count" = COALESCE("applied_steps_count", 1)
WHERE "migration_name" = '20251011105336_init_clean_schema'
  AND ("finished_at" IS NULL OR "rolled_back_at" IS NOT NULL);

-- Проверяем результат
SELECT 
  "migration_name",
  "started_at",
  "finished_at",
  "rolled_back_at",
  "applied_steps_count"
FROM "_prisma_migrations"
WHERE "migration_name" = '20251011105336_init_clean_schema';

