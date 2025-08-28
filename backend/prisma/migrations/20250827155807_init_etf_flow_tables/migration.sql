-- CreateTable
CREATE TABLE "public"."ETF" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "assetClass" TEXT NOT NULL,
    "expenseRatio" DOUBLE PRECISION NOT NULL,
    "aum" DOUBLE PRECISION,
    "inceptionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ETF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Price" (
    "id" TEXT NOT NULL,
    "etfId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Holding" (
    "id" TEXT NOT NULL,
    "etfId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "sector" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

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

    CONSTRAINT "BTCFlow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ETF_symbol_key" ON "public"."ETF"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Price_etfId_date_key" ON "public"."Price"("etfId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Holding_etfId_ticker_key" ON "public"."Holding"("etfId", "ticker");

-- CreateIndex
CREATE UNIQUE INDEX "ETFFlow_date_key" ON "public"."ETFFlow"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BTCFlow_date_key" ON "public"."BTCFlow"("date");

-- AddForeignKey
ALTER TABLE "public"."Price" ADD CONSTRAINT "Price_etfId_fkey" FOREIGN KEY ("etfId") REFERENCES "public"."ETF"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Holding" ADD CONSTRAINT "Holding_etfId_fkey" FOREIGN KEY ("etfId") REFERENCES "public"."ETF"("id") ON DELETE CASCADE ON UPDATE CASCADE;
