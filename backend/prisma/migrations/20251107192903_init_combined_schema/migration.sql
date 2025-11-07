-- CreateTable
CREATE TABLE "public"."eth_flow" (
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

    CONSTRAINT "eth_flow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."btc_flows" (
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

    CONSTRAINT "btc_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "sentToTokens" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
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
    "os" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "revenueCatUserId" TEXT,
    "originalTransactionId" TEXT,
    "productId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "purchaseDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "originalPurchaseDate" TIMESTAMP(3),
    "environment" TEXT,
    "platform" TEXT,
    "price" DOUBLE PRECISION,
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
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

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trading_positions" (
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

    CONSTRAINT "trading_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fund_details" (
    "id" SERIAL NOT NULL,
    "fund_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "ticker" TEXT,
    "fund_type" TEXT,
    "fee_percentage" DOUBLE PRECISION,
    "launch_date" TIMESTAMP(3),
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fund_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fund_translations" (
    "id" SERIAL NOT NULL,
    "fund_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fund_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."btc_candles" (
    "id" BIGSERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "open_time" TIMESTAMP(3) NOT NULL,
    "close_time" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "quote_volume" DOUBLE PRECISION NOT NULL,
    "trades" INTEGER NOT NULL,
    "taker_buy_base" DOUBLE PRECISION NOT NULL,
    "taker_buy_quote" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'binance_spot',
    "inserted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "btc_candles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."etf_new_records" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "assetType" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "previousAmount" DOUBLE PRECISION,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dedupeKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_new_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."etf_notification_deliveries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "channel" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sol_flow" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bitwise" DOUBLE PRECISION,
    "grayscale" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sol_flow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "eth_flow_date_key" ON "public"."eth_flow"("date");

-- CreateIndex
CREATE UNIQUE INDEX "btc_flows_date_key" ON "public"."btc_flows"("date");

-- CreateIndex
CREATE UNIQUE INDEX "applications_name_key" ON "public"."applications"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_deviceId_key" ON "public"."users"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "users_deviceToken_key" ON "public"."users"("deviceToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramChatId_key" ON "public"."users"("telegramChatId");

-- CreateIndex
CREATE INDEX "idx_user_settings" ON "public"."users" USING GIN ("settings");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "public"."subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_revenueCatUserId_idx" ON "public"."subscriptions"("revenueCatUserId");

-- CreateIndex
CREATE INDEX "subscriptions_originalTransactionId_idx" ON "public"."subscriptions"("originalTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "public"."admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fund_details_fund_key_key" ON "public"."fund_details"("fund_key");

-- CreateIndex
CREATE UNIQUE INDEX "fund_translations_fund_id_language_key" ON "public"."fund_translations"("fund_id", "language");

-- CreateIndex
CREATE INDEX "idx_btc_candles_symbol_interval_time" ON "public"."btc_candles"("symbol", "interval", "open_time");

-- CreateIndex
CREATE UNIQUE INDEX "btc_candles_symbol_interval_open_time_key" ON "public"."btc_candles"("symbol", "interval", "open_time");

-- CreateIndex
CREATE UNIQUE INDEX "etf_new_records_dedupeKey_key" ON "public"."etf_new_records"("dedupeKey");

-- CreateIndex
CREATE INDEX "etf_new_records_date_assetType_idx" ON "public"."etf_new_records"("date", "assetType");

-- CreateIndex
CREATE INDEX "etf_new_records_detectedAt_idx" ON "public"."etf_new_records"("detectedAt");

-- CreateIndex
CREATE INDEX "etf_notification_deliveries_sent_createdAt_idx" ON "public"."etf_notification_deliveries"("sent", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "etf_notification_deliveries_userId_recordId_key" ON "public"."etf_notification_deliveries"("userId", "recordId");

-- CreateIndex
CREATE UNIQUE INDEX "sol_flow_date_key" ON "public"."sol_flow"("date");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fund_translations" ADD CONSTRAINT "fund_translations_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "public"."fund_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etf_notification_deliveries" ADD CONSTRAINT "etf_notification_deliveries_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "public"."etf_new_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etf_notification_deliveries" ADD CONSTRAINT "etf_notification_deliveries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

