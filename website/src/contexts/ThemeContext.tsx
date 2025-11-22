"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useThemeStore, Theme } from "../stores/themeStore";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider теперь использует Zustand store под капотом
 * Оставлен для обратной совместимости с компонентами, использующими useTheme()
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, toggleTheme, mounted, setMounted } = useThemeStore();

  // Инициализируем mounted при монтировании провайдера
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
  }, [mounted, setMounted]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Хук для использования темы (обратная совместимость)
 * Теперь использует Zustand store под капотом
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
