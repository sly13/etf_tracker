// API Configuration
const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "api-etf.vadimsemenko.ru";
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || "3066";
const API_PROTOCOL = process.env.NEXT_PUBLIC_API_PROTOCOL || "https";

export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    `${API_PROTOCOL}://${API_HOST}:${API_PORT}/api`,
  HOST: API_HOST,
  PORT: API_PORT,
  PROTOCOL: API_PROTOCOL,
  ENDPOINTS: {
    SUMMARY: "/summary",
    ETF_SUMMARY: "/etf-flow/summary", // Старый endpoint для обратной совместимости
    FUND_HOLDINGS: "/etf-flow/holdings", // Новый endpoint для владений фондов
  },
};
