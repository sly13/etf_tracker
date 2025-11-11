import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_CONFIG } from "../config/api";

// Таймаут по умолчанию: 30 секунд (можно настроить через переменную окружения)
const API_TIMEOUT = parseInt(
  process.env.NEXT_PUBLIC_API_TIMEOUT || "30000",
  10
);

// Создаем экземпляр axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Интерцептор запросов
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Логируем запрос
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );

    // Добавляем timestamp к запросу
    config.metadata = { startTime: new Date() };

    return config;
  },
  error => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Интерцептор ответов
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Логируем успешный ответ
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? new Date().getTime() - startTime.getTime() : 0;
    console.log(
      `✅ API Response: ${response.status} ${response.config.url} (${duration}ms)`
    );

    return response;
  },
  error => {
    // Логируем ошибку
    console.error("❌ API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
    });

    // Обрабатываем различные типы ошибок
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const status = error.response.status;
      switch (status) {
        case 401:
          console.error("🔐 Unauthorized - проверьте авторизацию");
          break;
        case 403:
          console.error("🚫 Forbidden - недостаточно прав");
          break;
        case 404:
          console.error("🔍 Not Found - ресурс не найден");
          break;
        case 500:
          console.error("💥 Server Error - внутренняя ошибка сервера");
          break;
        default:
          console.error(`⚠️ HTTP Error ${status}`);
      }
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        console.error(
          `⏱️ Timeout Error - запрос превысил таймаут ${API_TIMEOUT}ms`
        );
        // Добавляем более понятное сообщение об ошибке таймаута
        error.timeoutError = true;
        error.timeoutMessage = `Запрос превысил таймаут ${API_TIMEOUT / 1000} секунд. Сервер может быть перегружен или недоступен.`;
      } else {
        console.error("🌐 Network Error - нет соединения с сервером");
      }
    } else {
      // Что-то пошло не так при настройке запроса
      console.error("⚙️ Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
