-- Migration: Create ETF Flow tables
-- Description: Creates tables for storing Ethereum and Bitcoin ETF flow data
-- Date: 2024-01-XX

-- Create ETFFlow table for Ethereum ETF data
CREATE TABLE IF NOT EXISTS "ETFFlow" (
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

-- Create BTCFlow table for Bitcoin ETF data
CREATE TABLE IF NOT EXISTS "BTCFlow" (
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

-- Create unique indexes for date fields
CREATE UNIQUE INDEX IF NOT EXISTS "ETFFlow_date_key" ON "ETFFlow"("date");
CREATE UNIQUE INDEX IF NOT EXISTS "BTCFlow_date_key" ON "BTCFlow"("date");

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "ETFFlow_date_idx" ON "ETFFlow"("date");
CREATE INDEX IF NOT EXISTS "BTCFlow_date_idx" ON "BTCFlow"("date");

-- Create indexes for total field for analytics queries
CREATE INDEX IF NOT EXISTS "ETFFlow_total_idx" ON "ETFFlow"("total");
CREATE INDEX IF NOT EXISTS "BTCFlow_total_idx" ON "BTCFlow"("total");

-- Add comments to tables
COMMENT ON TABLE "ETFFlow" IS 'Ethereum ETF flow data from various providers';
COMMENT ON TABLE "BTCFlow" IS 'Bitcoin ETF flow data from various providers';

-- Add comments to key fields
COMMENT ON COLUMN "ETFFlow"."date" IS 'Date of the ETF flow data';
COMMENT ON COLUMN "ETFFlow"."total" IS 'Total daily flow in millions USD';
COMMENT ON COLUMN "BTCFlow"."date" IS 'Date of the ETF flow data';
COMMENT ON COLUMN "BTCFlow"."total" IS 'Total daily flow in millions USD';
