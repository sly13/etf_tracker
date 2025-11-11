// Типы для API
export interface SummaryData {
  bitcoin: {
    totalAssets: number;
    currentFlow: number;
    count: number;
    latestDate: string | null;
  };
  ethereum: {
    totalAssets: number;
    currentFlow: number;
    count: number;
    latestDate: string | null;
  };
  overall: {
    totalAssets: number;
    currentFlow: number;
    totalCount: number;
    lastUpdated: string;
  };
}

// Старый тип для обратной совместимости
export interface ETFSummaryData {
  ethereum: {
    total: number;
    totalAssets: number;
    count: number;
    average: number;
    latestDate: string | null;
  };
  bitcoin: {
    total: number;
    totalAssets: number;
    count: number;
    average: number;
    latestDate: string | null;
  };
  overall: {
    total: number;
    totalAssets: number;
    count: number;
    latestDate: string | null;
  };
}

// Типы для владений фондов
export interface FundHoldingsData {
  fundHoldings: Record<
    string,
    {
      eth: number;
      btc: number;
    }
  >;
  summary: {
    totalEth: number;
    totalBtc: number;
    totalHoldings: number;
    fundCount: number;
  };
}

// Типы для ошибок API
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
  config?: {
    url?: string;
  };
  code?: string;
  timeoutError?: boolean;
  timeoutMessage?: string;
}

// Расширяем типы axios для добавления metadata
declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}
