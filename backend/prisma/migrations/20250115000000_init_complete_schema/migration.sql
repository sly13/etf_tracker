-- CreateTable
CREATE TABLE "public"."ETFFlow" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "blackrock" DOUBLE PRECISION,
    "fidelity" DOUBLE PRECISION,
    "bitwise" DOUBLE PRECISION,
    "twentyOneShares" DOUBLE PRECISION,
    "vanEck" DOUBLE PRECISION,
    "invesco" DOUBLE PRECISION,
    "franklin" DOUBLE PRECISION,
    "grayscale" DOUBLE PRECISION,
    "grayscaleEth" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ETFFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BTCFlow" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "blackrock" DOUBLE PRECISION,
    "fidelity" DOUBLE PRECISION,
    "bitwise" DOUBLE PRECISION,
    "twentyOneShares" DOUBLE PRECISION,
    "vanEck" DOUBLE PRECISION,
    "invesco" DOUBLE PRECISION,
    "franklin" DOUBLE PRECISION,
    "grayscale" DOUBLE PRECISION,
    "grayscaleBtc" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "valkyrie" DOUBLE PRECISION,
    "wisdomTree" DOUBLE PRECISION,

    CONSTRAINT "BTCFlow_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."Application" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "deviceId" TEXT,
    "deviceToken" TEXT NOT NULL,
    "telegramChatId" TEXT,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ETFFlow_date_key" ON "public"."ETFFlow"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BTCFlow_date_key" ON "public"."BTCFlow"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Application_name_key" ON "public"."Application"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_deviceId_key" ON "public"."User"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "User_deviceToken_key" ON "public"."User"("deviceToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramChatId_key" ON "public"."User"("telegramChatId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "public"."Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE INDEX "idx_user_settings" ON "public"."User" USING GIN ("settings");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- Создаем функции для работы с настройками
CREATE OR REPLACE FUNCTION get_user_setting(user_id TEXT, setting_key TEXT)
RETURNS JSONB AS $$
DECLARE
  user_settings JSONB;
  result JSONB;
BEGIN
  -- Получаем настройки пользователя
  SELECT "settings" INTO user_settings
  FROM "public"."User" 
  WHERE "id" = user_id;
  
  -- Возвращаем значение настройки
  result := user_settings->setting_key;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для обновления настройки пользователя
CREATE OR REPLACE FUNCTION update_user_setting(user_id TEXT, setting_key TEXT, setting_value JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  current_settings JSONB;
BEGIN
  -- Получаем текущие настройки
  SELECT "settings" INTO current_settings
  FROM "public"."User" 
  WHERE "id" = user_id;
  
  -- Если настроек нет, создаем пустой объект
  IF current_settings IS NULL THEN
    current_settings := '{}'::jsonb;
  END IF;
  
  -- Обновляем настройку
  current_settings := current_settings || jsonb_build_object(setting_key, setting_value);
  
  -- Сохраняем обратно
  UPDATE "public"."User" 
  SET "settings" = current_settings, "updatedAt" = NOW()
  WHERE "id" = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для получения пользователей с определенной настройкой
CREATE OR REPLACE FUNCTION get_users_with_setting(app_name TEXT, setting_key TEXT, setting_value JSONB)
RETURNS TABLE(user_id TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u."id"::TEXT
  FROM "public"."User" u
  JOIN "public"."Application" a ON u."applicationId" = a."id"
  WHERE a."name" = app_name
    AND u."settings"->setting_key = setting_value;
END;
$$ LANGUAGE plpgsql;

-- Создаем приложение etf.flow по умолчанию
INSERT INTO "public"."Application" ("id", "name", "displayName", "description", "isActive", "createdAt", "updatedAt")
VALUES (
  'etf-flow-default-app',
  'etf.flow',
  'ETF Flow Tracker',
  'Track ETF flows and get notifications about significant changes',
  true,
  NOW(),
  NOW()
) ON CONFLICT ("name") DO NOTHING;
