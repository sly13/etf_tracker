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

-- AddForeignKey
ALTER TABLE "public"."etf_notification_deliveries" ADD CONSTRAINT "etf_notification_deliveries_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "public"."etf_new_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."etf_notification_deliveries" ADD CONSTRAINT "etf_notification_deliveries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
