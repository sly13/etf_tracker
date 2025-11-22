import { create } from "zustand";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  mounted: boolean;
  setMounted: (mounted: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  mounted: false,

  setMounted: (mounted: boolean) => {
    set({ mounted });
    // После монтирования инициализируем тему
    if (mounted) {
      get().initializeTheme();
    }
  },

  initializeTheme: () => {
    if (typeof window === "undefined") return;
    
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      get().setTheme(savedTheme);
    } else {
      // Если тема не сохранена, используем светлую по умолчанию
      get().setTheme("light");
    }
  },

  setTheme: (theme: Theme) => {
    set({ theme });
    
    // Сохраняем в localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
    
    // Синхронизируем DOM
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      root.style.colorScheme = theme === "dark" ? "dark" : "light";
    }
  },

  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    get().setTheme(newTheme);
  },
}));

