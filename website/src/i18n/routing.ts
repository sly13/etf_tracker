import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/**
 * Базовые локали, для которых есть файлы переводов
 * Остальные языки будут загружаться динамически из API
 * и использовать дефолтный язык (en) для переводов
 */
export const routing = defineRouting({
  // A list of all locales that are supported
  // Расширяем список для поддержки большего количества языков
  // Если язык не в списке, но есть в API, он будет работать с дефолтными переводами
  locales: [
    "en",
    "ru",
    // Добавляем популярные языки для поддержки в routing
    "ar",
    "es",
    "ja",
    "ko",
    "pt",
    "tr",
    "vi",
    "zh",
  ],

  // Used when no locale matches
  defaultLocale: "en",

  // The prefix strategy: 'as-needed' means no prefix for default locale
  localePrefix: "as-needed",
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
