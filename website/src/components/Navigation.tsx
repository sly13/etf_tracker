"use client";

import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from "next/navigation";
import { AppBar, Toolbar, Box, Button, Container, useTheme } from "@mui/material";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { Link } from '../i18n/routing';

export default function Navigation() {
  const pathname = usePathname();
  const theme = useTheme();
  const t = useTranslations('nav');
  const tBrand = useTranslations('brand');
  const locale = useLocale();

  const navItems = [
    { href: "/", label: t('home') },
    { href: "/funds", label: t('funds') },
    { href: "/app", label: t('app') },
    { href: "/blog", label: t('blog') },
  ];

  return (
    <AppBar
      position="sticky"
      suppressHydrationWarning
      sx={{
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(15, 23, 42, 0.8)"
            : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        boxShadow: "none",
        borderBottom: `1px solid ${
          theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"
        }`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              component={Link}
              href="/"
              suppressHydrationWarning
              sx={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "text.primary",
                textTransform: "none",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              {tBrand('name')}
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 3,
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  suppressHydrationWarning
                  sx={{
                    color:
                      pathname === item.href || pathname === `/${locale}${item.href}`
                        ? "primary.main"
                        : "text.secondary",
                    fontWeight: 500,
                    textTransform: "none",
                    position: "relative",
                    "&:hover": {
                      color: "text.primary",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -4,
                      left: 0,
                      right: 0,
                      height: 2,
                      backgroundColor:
                        pathname === item.href || pathname === `/${locale}${item.href}` ? "primary.main" : "transparent",
                      borderRadius: 1,
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            <LanguageToggle />
            <ThemeToggle />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
