"use client";

import { ThemeProvider } from "../contexts/ThemeContext";
import { MUIThemeProviderWrapper } from "../theme/muiTheme";

export default function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <MUIThemeProviderWrapper>{children}</MUIThemeProviderWrapper>
    </ThemeProvider>
  );
}
