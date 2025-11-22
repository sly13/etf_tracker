"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { Language as LanguageIcon } from "@mui/icons-material";
import { useRouter as useIntlRouter } from "../i18n/routing";
import { useLanguagesStore } from "../stores/languagesStore";

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useIntlRouter();
  const pathname = usePathname();
  const tCommon = useTranslations("common");
  const { loading, getActiveLanguages } = useLanguagesStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const switchLanguage = (newLocale: string) => {
    handleClose();

    // Получаем путь без префикса локали
    let pathWithoutLocale = pathname;

    // Удаляем префикс локали, если он есть
    if (pathWithoutLocale.startsWith(`/${locale}/`)) {
      pathWithoutLocale = pathWithoutLocale.replace(`/${locale}/`, "/");
    } else if (pathWithoutLocale === `/${locale}`) {
      pathWithoutLocale = "/";
    } else if (pathWithoutLocale.startsWith(`/${locale}`)) {
      pathWithoutLocale = pathWithoutLocale.replace(`/${locale}`, "");
    }

    // Используем next-intl router для переключения языка
    router.replace(pathWithoutLocale, { locale: newLocale });
  };

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          minWidth: "auto",
          px: 1.5,
          color: "text.secondary",
          textTransform: "none",
          "&:hover": {
            color: "text.primary",
          },
        }}
      >
        <LanguageIcon sx={{ fontSize: 20, mr: 0.5 }} />
        {locale.toUpperCase()}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {loading ? (
          <MenuItem disabled>{tCommon("loading")}</MenuItem>
        ) : (
          getActiveLanguages().map(lang => (
            <MenuItem
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              selected={locale === lang.code}
            >
              {lang.nativeName}
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
