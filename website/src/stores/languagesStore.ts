import { create } from "zustand";
import { languagesService, Language } from "../services/languagesService";

interface LanguagesState {
  languages: Language[];
  loading: boolean;
  error: string | null;
  fetchLanguages: () => Promise<void>;
  getLanguageByCode: (code: string) => Language | undefined;
  getActiveLanguages: () => Language[];
}

export const useLanguagesStore = create<LanguagesState>((set, get) => ({
  languages: [],
  loading: false,
  error: null,

  fetchLanguages: async () => {
    set({ loading: true, error: null });
    try {
      const languages = await languagesService.getActiveLanguages();
      set({ languages, loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch languages";
      set({ error: errorMessage, loading: false });
      console.error("Error fetching languages:", error);
    }
  },

  getLanguageByCode: (code: string) => {
    return get().languages.find((lang) => lang.code === code);
  },

  getActiveLanguages: () => {
    return get().languages.filter((lang) => lang.isActive);
  },
}));

