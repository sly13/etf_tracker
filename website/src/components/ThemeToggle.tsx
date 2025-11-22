"use client";

import { useEffect } from "react";
import { IconButton, useTheme as useMUITheme } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useThemeStore } from "../stores/themeStore";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted, setMounted } = useThemeStore();
  const muiTheme = useMUITheme();

  // Предотвращаем ошибку гидратации, рендерим иконку только после монтирования
  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  // Пока компонент не смонтирован, показываем заглушку
  if (!mounted) {
    return (
      <IconButton
        aria-label="Переключить тему"
        size="small"
        suppressHydrationWarning
        sx={{
          color: "text.primary",
        }}
      >
        <DarkMode />
      </IconButton>
    );
  }

  return (
    <IconButton
      onClick={toggleTheme}
      aria-label="Переключить тему"
      size="small"
      sx={{
        color: "text.primary",
        "&:hover": {
          color: "primary.main",
          backgroundColor:
            muiTheme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      {theme === "light" ? <DarkMode /> : <LightMode />}
    </IconButton>
  );
}
