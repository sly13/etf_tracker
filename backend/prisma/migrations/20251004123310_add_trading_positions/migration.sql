/*
  Warnings:

  - You are about to drop the column `revenueCatUserId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_revenueCatUserId_key";

-- DropIndex
DROP INDEX "public"."idx_user_revenueCatUserId";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "revenueCatUserId";

-- CreateTable
CREATE TABLE "public"."TradingPositions" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "entry_price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "okx_order_id" TEXT,
    "profit_loss" DOUBLE PRECISION DEFAULT 0,
    "exit_price" DOUBLE PRECISION,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradingPositions_pkey" PRIMARY KEY ("id")
);
