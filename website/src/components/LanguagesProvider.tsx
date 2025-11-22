"use client";

import { useEffect } from "react";
import { useLanguagesStore } from "../stores/languagesStore";

/**
 * Провайдер для загрузки языков при старте приложения
 */
export default function LanguagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { languages, loading, fetchLanguages } = useLanguagesStore();

  useEffect(() => {
    // Загружаем языки только если они еще не загружены
    if (languages.length === 0 && !loading) {
      fetchLanguages();
    }
  }, [languages.length, loading, fetchLanguages]);

  return <>{children}</>;
}

