import apiClient from "./api";
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

export const languagesService = {
  /**
   * Получить список активных языков (публичный endpoint)
   */
  async getActiveLanguages(): Promise<Language[]> {
    try {
      const response = await apiClient.get<LanguagesResponse>(
        API_CONFIG.ENDPOINTS.LANGUAGES_PUBLIC
      );
      return response.data.languages;
    } catch (error) {
      console.error("Error fetching languages:", error);
      // Возвращаем дефолтные языки в случае ошибки
      return [
        { id: 1, code: "en", name: "English", nativeName: "English", isActive: true },
        { id: 2, code: "ru", name: "Russian", nativeName: "Русский", isActive: true },
      ];
    }
  },
};

