"use client";

import { createTheme, ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { useTheme as useCustomTheme } from "../contexts/ThemeContext";
import { ReactNode, useMemo } from "react";

interface MUIThemeProviderWrapperProps {
  children: ReactNode;
}

export function MUIThemeProviderWrapper({
  children,
}: MUIThemeProviderWrapperProps) {
  const { theme } = useCustomTheme();

  const muiTheme = useMemo(
    () =>
      createTheme({
    palette: {
      mode: theme === "dark" ? "dark" : "light",
      primary: {
        main: "#3b82f6",
        light: "#60a5fa",
        dark: "#2563eb",
      },
      secondary: {
        main: "#64748b",
        light: "#94a3b8",
        dark: "#475569",
      },
      background: {
        default: theme === "dark" ? "#0f172a" : "#ffffff",
        paper: theme === "dark" ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: theme === "dark" ? "#f1f5f9" : "#0f172a",
        secondary: theme === "dark" ? "#cbd5e1" : "#64748b",
      },
      error: {
        main: "#ef4444",
      },
      warning: {
        main: "#f59e0b",
      },
      info: {
        main: "#3b82f6",
      },
      success: {
        main: "#22c55e",
      },
    },
    typography: {
      fontFamily: "var(--font-ibm-plex-mono), 'Courier New', Courier, monospace",
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: theme === "dark" 
              ? "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.24)"
              : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            borderBottom: `1px solid ${theme === "dark" ? "#334155" : "#e2e8f0"}`,
          },
        },
      },
    },
      }),
    [theme]
  );

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </MUIThemeProvider>
  );
}

