"use client";

import { useEffect } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import { MUIThemeProviderWrapper } from "../theme/muiTheme";
import { useThemeStore } from "../stores/themeStore";

export default function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setMounted } = useThemeStore();

  // Инициализируем mounted при монтировании провайдера
  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  return (
    <ThemeProvider>
      <MUIThemeProviderWrapper>{children}</MUIThemeProviderWrapper>
    </ThemeProvider>
  );
}
