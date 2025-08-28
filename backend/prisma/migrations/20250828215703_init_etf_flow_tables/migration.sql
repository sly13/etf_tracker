-- CreateTable
CREATE TABLE "ETFFlow" (
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
CREATE TABLE "BTCFlow" (
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
CREATE UNIQUE INDEX "ETFFlow_date_key" ON "ETFFlow"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BTCFlow_date_key" ON "BTCFlow"("date");
