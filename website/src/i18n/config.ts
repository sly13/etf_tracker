import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getActiveLanguageCodes } from "../services/languagesService.server";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Получаем список активных языков с бэкенда
  const activeLanguageCodes = await getActiveLanguageCodes();

  // Ensure that a valid locale is used
  if (!locale) {
    locale = routing.defaultLocale;
  } else {
    // Проверяем, поддерживается ли локаль
    // Сначала проверяем статические локали из routing
    const isInRoutingLocales = (routing.locales as readonly string[]).includes(
      locale
    );
    // Затем проверяем динамические локали из API
    const isInActiveLanguages = activeLanguageCodes.includes(locale);

    if (!isInRoutingLocales && !isInActiveLanguages) {
      locale = routing.defaultLocale;
    }
  }

  // Пытаемся загрузить файл переводов для локали
  // Если файла нет, используем дефолтный
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    console.warn(
      `Translation file for locale "${locale}" not found, using default`
    );
    messages = (await import(`../messages/${routing.defaultLocale}.json`))
      .default;
  }

  return {
    locale,
    messages,
  };
});
