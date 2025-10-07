// Типы для API ответов
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Типы для мониторинга бота
export interface MonitoringStatus {
  isRunning: boolean;
  lastCheckTime: {
    btc: string;
    eth: string;
  };
  stats: {
    totalSignals: number;
    btcSignals: number;
    ethSignals: number;
    successfulTrades: number;
    failedTrades: number;
    lastSignal: {
      asset: string;
      flowValue: number;
      side: string;
      timestamp: string;
    } | null;
  };
  config: {
    checkInterval: number;
    minFlowThreshold: number;
    maxPositionSize: number;
  };
}

// Типы для Flow данных
export interface FlowData {
  id: number;
  timestamp: string;
  flow_value: number;
  price?: number;
  volume?: number;
  created_at: string;
  updated_at: string;
}

// Типы для дневных Flow данных
export interface DailyFlowData {
  id: string;
  date: string;
  blackrock: number;
  fidelity: number;
  bitwise: number;
  twentyOneShares: number;
  vanEck: number;
  invesco: number;
  franklin: number;
  grayscale: number;
  grayscaleBtc: number;
  valkyrie: number;
  wisdomTree: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Типы для торговых позиций
export interface TradingPosition {
  id: number;
  symbol: string;
  side: "long" | "short";
  size: number;
  entry_price: number;
  flow_value: number;
  status: "open" | "closed" | "cancelled";
  okx_order_id?: string;
  profit_loss?: number;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

// Типы для статистики торговли
export interface TradingStats {
  totalPositions: number;
  openPositions: number;
  closedPositions: number;
  stats: Array<{
    status: string;
    count: string;
    total_pnl: string;
  }>;
}

// Типы для OKX API
export interface OKXConnection {
  connected: boolean;
  accountInfo?: any;
}

export interface TickerData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
}

export interface OrderData {
  instId: string;
  ordId: string;
  side: string;
  sz: string;
  px?: string;
  state: string;
  fillSz: string;
  fillPx: string;
  createTime: string;
}

export interface BalanceData {
  ccy: string;
  bal: string;
  frozenBal: string;
  availBal: string;
}

// Типы для форм
export interface MarketOrderForm {
  symbol: string;
  side: "buy" | "sell";
  size: number;
}

export interface LimitOrderForm {
  symbol: string;
  side: "buy" | "sell";
  size: number;
  price: number;
}

export interface CancelOrderForm {
  symbol: string;
  orderId: string;
}
