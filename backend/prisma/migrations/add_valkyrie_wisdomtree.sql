-- Добавляем поля valkyrie и wisdomTree в таблицу ETFFlow
ALTER TABLE "ETFFlow" ADD COLUMN "valkyrie" DOUBLE PRECISION;
ALTER TABLE "ETFFlow" ADD COLUMN "wisdomTree" DOUBLE PRECISION;

-- Добавляем поля valkyrie и wisdomTree в таблицу BTCFlow
ALTER TABLE "BTCFlow" ADD COLUMN "valkyrie" DOUBLE PRECISION;
ALTER TABLE "BTCFlow" ADD COLUMN "wisdomTree" DOUBLE PRECISION;
