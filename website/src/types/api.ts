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
  solana: {
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
      sol: number;
    }
  >;
  summary: {
    totalEth: number;
    totalBtc: number;
    totalSol: number;
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

// Типы для CEFI индексов
export interface CEFIIndexData {
  date: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface CEFIIndexResponse {
  index: string;
  current: CEFIIndexData;
  history: CEFIIndexData[];
  metadata: {
    baseValue: number;
    smoothingFactor: number;
    windowSize: number;
  };
}

export interface BPFData {
  date: string;
  percentage: number;
  positiveFunds: number;
  totalFunds: number;
}

export interface AllCEFIIndices {
  btc: CEFIIndexResponse;
  eth: CEFIIndexResponse;
  sol: CEFIIndexResponse;
  composite: CEFIIndexResponse;
  bpf: {
    bitcoin: BPFData[];
    ethereum: BPFData[];
  };
}

export interface ChartDataPoint {
  date: string;
  indexValue: number;
  btcPrice: number;
  btcVolume: number;
  flows?: {
    total: number;
    funds: Record<string, number>;
  };
}

export interface IndexChartResponse {
  index: string;
  data: ChartDataPoint[];
  current: {
    indexValue: number;
    btcPrice: number;
    btcVolume: number;
  };
}

// Расширяем типы axios для добавления metadata
declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}
