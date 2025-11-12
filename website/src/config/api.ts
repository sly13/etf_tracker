// API Configuration
const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "api-etf.vadimsemenko.ru";
const API_PROTOCOL = process.env.NEXT_PUBLIC_API_PROTOCOL || "https";

// Определяем порт по умолчанию в зависимости от протокола
// Для HTTPS стандартный порт 443, для HTTP - 80
// Если порт указан явно, используем его
const getDefaultPort = (): string => {
  if (process.env.NEXT_PUBLIC_API_PORT) {
    return process.env.NEXT_PUBLIC_API_PORT;
  }
  return API_PROTOCOL === "https" ? "443" : "80";
};

const API_PORT = getDefaultPort();

// Функция для построения URL с учетом стандартных портов
const buildApiUrl = (): string => {
  // Если задан полный URL, используем его
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  const protocol = API_PROTOCOL;
  const host = API_HOST;
  const port = API_PORT;

  // Для HTTPS стандартный порт 443 - не добавляем порт в URL
  // Для HTTP стандартный порт 80 - не добавляем порт в URL
  // Для других портов - добавляем
  const isStandardPort =
    (protocol === "https" && port === "443") ||
    (protocol === "http" && port === "80");

  if (isStandardPort) {
    return `${protocol}://${host}/api`;
  }

  return `${protocol}://${host}:${port}/api`;
};

export const API_CONFIG = {
  BASE_URL: buildApiUrl(),
  HOST: API_HOST,
  PORT: API_PORT,
  PROTOCOL: API_PROTOCOL,
  ENDPOINTS: {
    SUMMARY: "/summary",
    ETF_SUMMARY: "/etf-flow/summary", // Старый endpoint для обратной совместимости
    FUND_HOLDINGS: "/etf-flow/holdings", // Новый endpoint для владений фондов
    CEFI_BTC: "/cefi/btc",
    CEFI_ETH: "/cefi/eth",
    CEFI_COMPOSITE: "/cefi/composite",
    CEFI_BPF: "/cefi/bpf",
    CEFI_ALL: "/cefi/all",
    CEFI_CHART: "/cefi/chart", // Endpoint для получения данных графика
  },
};
