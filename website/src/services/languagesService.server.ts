import { API_CONFIG } from "../config/api";

export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
}

export interface LanguagesResponse {
  success: boolean;
  languages: Language[];
}

/**
 * Серверная функция для получения активных языков
 * Используется в server components и middleware
 */
export async function getActiveLanguagesServer(): Promise<Language[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LANGUAGES_PUBLIC}`,
      {
        cache: "no-store", // Всегда получаем свежие данные
        next: { revalidate: 3600 }, // Перевалидируем каждый час
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch languages: ${response.statusText}`);
    }

    const data: LanguagesResponse = await response.json();
    return data.languages || [];
  } catch (error) {
    console.error("Error fetching languages on server:", error);
    // Возвращаем дефолтные языки в случае ошибки
    return [
      { id: 1, code: "en", name: "English", nativeName: "English", isActive: true },
      { id: 2, code: "ru", name: "Russian", nativeName: "Русский", isActive: true },
    ];
  }
}

/**
 * Получить список кодов активных языков
 */
export async function getActiveLanguageCodes(): Promise<string[]> {
  const languages = await getActiveLanguagesServer();
  return languages.filter((lang) => lang.isActive).map((lang) => lang.code);
}

