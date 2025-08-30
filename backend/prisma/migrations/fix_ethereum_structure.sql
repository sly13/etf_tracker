-- Удаляем поля valkyrie и wisdomTree из таблицы ETFFlow (Ethereum)
ALTER TABLE "ETFFlow" DROP COLUMN IF EXISTS "valkyrie";
ALTER TABLE "ETFFlow" DROP COLUMN IF EXISTS "wisdomTree";

-- Убеждаемся, что поля valkyrie и wisdomTree есть в таблице BTCFlow (Bitcoin)
ALTER TABLE "BTCFlow" ADD COLUMN IF NOT EXISTS "valkyrie" DOUBLE PRECISION;
ALTER TABLE "BTCFlow" ADD COLUMN IF NOT EXISTS "wisdomTree" DOUBLE PRECISION;
