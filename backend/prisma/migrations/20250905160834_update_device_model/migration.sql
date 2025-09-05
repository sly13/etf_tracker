/*
  Warnings:

  - You are about to drop the `FCMToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."FCMToken";

-- CreateTable
CREATE TABLE "public"."Device" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deviceType" TEXT,
    "appVersion" TEXT,
    "osVersion" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "deviceName" TEXT,
    "enableETFUpdates" BOOLEAN NOT NULL DEFAULT true,
    "enableSignificantFlow" BOOLEAN NOT NULL DEFAULT true,
    "enableTestNotifications" BOOLEAN NOT NULL DEFAULT false,
    "minFlowThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "significantChangePercent" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastNotificationSent" TIMESTAMP(3),
    "notificationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_token_key" ON "public"."Device"("token");
