"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Инициализируем тему из localStorage, по умолчанию светлая
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }
    }
    return "light";
  });

  useEffect(() => {
    // При монтировании и изменении темы синхронизируем DOM
    const root = document.documentElement;

    // Принудительно устанавливаем правильный класс
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      // Для светлой темы обязательно удаляем класс
      root.classList.remove("dark");
    }

    // Принудительно обновляем стили для надежности
    // Это гарантирует, что Tailwind CSS применит изменения
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      // Сохраняем в localStorage
      localStorage.setItem("theme", newTheme);
      // Обновление DOM произойдет автоматически через useEffect
      return newTheme;
    });
  };

  // Всегда возвращаем Provider, даже если еще не смонтирован
  // Это важно для того, чтобы useTheme работал на всех страницах
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
