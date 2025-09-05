-- AlterTable
ALTER TABLE "public"."BTCFlow" ADD COLUMN     "valkyrie" DOUBLE PRECISION,
ADD COLUMN     "wisdomTree" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."FCMToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceType" TEXT,
    "appVersion" TEXT,
    "osVersion" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FCMToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "sentToTokens" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationSettings" (
    "id" TEXT NOT NULL,
    "enableETFUpdates" BOOLEAN NOT NULL DEFAULT true,
    "enableSignificantFlow" BOOLEAN NOT NULL DEFAULT true,
    "enableTestNotifications" BOOLEAN NOT NULL DEFAULT false,
    "minFlowThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "significantChangePercent" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FCMToken_token_key" ON "public"."FCMToken"("token");
