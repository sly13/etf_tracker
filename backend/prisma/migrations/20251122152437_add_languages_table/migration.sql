-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."languages" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "native_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "languages_code_key" ON "public"."languages"("code");

-- AlterTable: Добавляем колонку language_id в fund_translations
ALTER TABLE "public"."fund_translations" ADD COLUMN IF NOT EXISTS "language_id" INTEGER;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fund_translations_language_id_idx" ON "public"."fund_translations"("language_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fund_translations_language_id_fkey'
    ) THEN
        ALTER TABLE "public"."fund_translations" 
        ADD CONSTRAINT "fund_translations_language_id_fkey" 
        FOREIGN KEY ("language_id") 
        REFERENCES "public"."languages"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

