import axios from "axios";
import {
  ApiResponse,
  MonitoringStatus,
  FlowData,
  DailyFlowData,
  TradingPosition,
  TradingStats,
  OKXConnection,
  TickerData,
  OrderData,
  BalanceData,
  MarketOrderForm,
  LimitOrderForm,
  CancelOrderForm,
} from "../types";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3088";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// Bot Management API
export const botApi = {
  // Мониторинг
  startMonitoring: (): Promise<ApiResponse<MonitoringStatus>> =>
    api.post("/api/bot/monitoring/start").then(res => res.data),

  stopMonitoring: (): Promise<ApiResponse<MonitoringStatus>> =>
    api.post("/api/bot/monitoring/stop").then(res => res.data),

  getMonitoringStatus: (): Promise<ApiResponse<MonitoringStatus>> =>
    api.get("/api/bot/monitoring/status").then(res => res.data),

  getMonitoringStats: (): Promise<ApiResponse<any>> =>
    api.get("/api/bot/monitoring/stats").then(res => res.data),

  resetStats: (): Promise<ApiResponse<any>> =>
    api.post("/api/bot/monitoring/reset-stats").then(res => res.data),

  // Flow данные
  getFlowData: (
    asset: "btc" | "eth",
    limit = 10
  ): Promise<ApiResponse<FlowData[]>> =>
    api.get(`/api/bot/flow/${asset}?limit=${limit}`).then(res => res.data),

  // Дневные Flow данные
  getDailyFlowData: (
    asset: "btc" | "eth",
    limit = 10
  ): Promise<ApiResponse<DailyFlowData[]>> =>
    api.get(`/api/bot/flow/${asset}?limit=${limit}`).then(res => res.data),

  // Торговые позиции
  getPositions: (
    status?: string,
    limit = 50
  ): Promise<ApiResponse<TradingPosition[]>> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("limit", limit.toString());
    return api.get(`/api/bot/positions?${params}`).then(res => res.data);
  },

  getTradingStats: (): Promise<ApiResponse<TradingStats>> =>
    api.get("/api/bot/stats").then(res => res.data),
};

// OKX API
export const okxApi = {
  // Подключение
  checkConnection: (): Promise<ApiResponse<OKXConnection>> =>
    api.get("/api/okx/status").then(res => res.data),

  // Цены
  getCurrentPrices: (): Promise<
    ApiResponse<{ BTC: TickerData; ETH: TickerData }>
  > => api.get("/api/okx/prices").then(res => res.data),

  getTicker: (symbol: string): Promise<ApiResponse<TickerData>> =>
    api.get(`/api/okx/ticker/${symbol}`).then(res => res.data),

  // Ордера
  getOpenOrders: (symbol?: string): Promise<ApiResponse<OrderData[]>> => {
    const params = symbol ? `?symbol=${symbol}` : "";
    return api.get(`/api/okx/orders/open${params}`).then(res => res.data);
  },

  getOrderHistory: (
    symbol?: string,
    limit = 100
  ): Promise<ApiResponse<OrderData[]>> => {
    const params = new URLSearchParams();
    if (symbol) params.append("symbol", symbol);
    params.append("limit", limit.toString());
    return api.get(`/api/okx/orders/history?${params}`).then(res => res.data);
  },

  getOrderInfo: (
    symbol: string,
    orderId: string
  ): Promise<ApiResponse<OrderData>> =>
    api.get(`/api/okx/orders/${symbol}/${orderId}`).then(res => res.data),

  // Торговля
  placeMarketOrder: (order: MarketOrderForm): Promise<ApiResponse<OrderData>> =>
    api.post("/api/okx/orders/market", order).then(res => res.data),

  placeLimitOrder: (order: LimitOrderForm): Promise<ApiResponse<OrderData>> =>
    api.post("/api/okx/orders/limit", order).then(res => res.data),

  cancelOrder: (order: CancelOrderForm): Promise<ApiResponse<OrderData>> =>
    api.post("/api/okx/orders/cancel", order).then(res => res.data),

  // Баланс
  getBalance: (): Promise<ApiResponse<BalanceData[]>> =>
    api.get("/api/okx/balance").then(res => res.data),
};

// Health API
export const healthApi = {
  getHealth: (): Promise<any> => api.get("/health").then(res => res.data),

  getInfo: (): Promise<any> => api.get("/").then(res => res.data),
};

export default api;
