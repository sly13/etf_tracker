"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import apiClient from "../services/api";
import { CEFIIndexResponse, ApiError } from "../types/api";
import { API_CONFIG } from "../config/api";
import { useTheme } from "../contexts/ThemeContext";

interface HistoricalValuesProps {
  indexType: "btc" | "eth" | "sol" | "composite";
}

export default function HistoricalValues({ indexType }: HistoricalValuesProps) {
  const { theme } = useTheme();
  const t = useTranslations('indices');
  const tSentiment = useTranslations('sentiment');
  const tErrors = useTranslations('errors');
  const [data, setData] = useState<CEFIIndexResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [computedDates, setComputedDates] = useState<{
    yesterday: Date;
    lastWeek: Date;
    lastMonth: Date;
    oneYearAgo: Date;
  } | null>(null);

  useEffect(() => {
    // Вычисляем даты на клиенте для избежания проблем с гидратацией
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);

    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    setComputedDates({ yesterday, lastWeek, lastMonth, oneYearAgo });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpointMap: Record<string, string> = {
          btc: API_CONFIG.ENDPOINTS.CEFI_BTC,
          eth: API_CONFIG.ENDPOINTS.CEFI_ETH,
          sol: "/cefi/sol",
          composite: API_CONFIG.ENDPOINTS.CEFI_COMPOSITE,
        };

        const response = await apiClient.get<CEFIIndexResponse>(
          endpointMap[indexType]
        );

        setData(response.data);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        let errorMessage: string;

        if (apiError?.timeoutError && apiError?.timeoutMessage) {
          errorMessage = apiError.timeoutMessage;
        } else {
          errorMessage =
            apiError?.response?.data?.message ||
            apiError?.message ||
            t('errorLoadingHistorical');
        }

        setError(errorMessage);
        console.error("Historical Values fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [indexType]);

  const getSentimentLabel = (value: number): string => {
    if (value >= 80) return tSentiment('extremeGreed');
    if (value >= 60) return tSentiment('greed');
    if (value >= 40) return tSentiment('neutral');
    if (value >= 20) return tSentiment('fear');
    return tSentiment('extremeFear');
  };

  const getSentimentColor = (value: number): string => {
    if (value >= 80) return "#16a34a"; // dark green - extreme greed
    if (value >= 60) return "#22c55e"; // green - greed
    if (value >= 40) return "#eab308"; // yellow - neutral
    if (value >= 20) return "#f97316"; // orange - fear
    return "#dc2626"; // red - extreme fear
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-red-500 dark:text-red-400 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-red-700 dark:text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  if (!data || !data.history || data.history.length === 0 || !computedDates) {
    return null;
  }

  // Находим ближайшие значения для каждого периода
  // Ищем самое последнее значение до или в указанную дату
  const findClosestValue = (targetDate: Date) => {
    const targetTime = targetDate.getTime();
    let closest = data.history[0];
    let minDiff = Math.abs(new Date(closest.date).getTime() - targetTime);

    // Сначала пытаемся найти значение до или в указанную дату
    for (const item of data.history) {
      const itemTime = new Date(item.date).getTime();
      const diff = Math.abs(itemTime - targetTime);
      
      // Предпочитаем значения до или в указанную дату
      if (itemTime <= targetTime && diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }

    // Если не нашли значение до указанной даты, ищем ближайшее
    if (minDiff === Math.abs(new Date(closest.date).getTime() - targetTime) && 
        new Date(closest.date).getTime() > targetTime) {
      for (const item of data.history) {
        const diff = Math.abs(new Date(item.date).getTime() - targetTime);
        if (diff < minDiff) {
          minDiff = diff;
          closest = item;
        }
      }
    }

    return closest;
  };

  const yesterdayValue = findClosestValue(computedDates.yesterday);
  const lastWeekValue = findClosestValue(computedDates.lastWeek);
  const lastMonthValue = findClosestValue(computedDates.lastMonth);

  // Вычисляем годовые экстремумы
  const yearlyData = data.history.filter(
    (item) => new Date(item.date) >= computedDates.oneYearAgo
  );

  // Если нет данных за год, используем все доступные данные
  const dataForExtremes = yearlyData.length > 0 ? yearlyData : data.history;

  if (dataForExtremes.length === 0) {
    return null;
  }

  let yearlyHigh = dataForExtremes[0];
  let yearlyLow = dataForExtremes[0];

  for (const item of dataForExtremes) {
    if (item.value > yearlyHigh.value) {
      yearlyHigh = item;
    }
    if (item.value < yearlyLow.value) {
      yearlyLow = item;
    }
  }

  return (
    <>
      {/* Historical Values */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">{t('historicalValues')}</h3>
        <div className="space-y-4">
          {/* Yesterday */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-slate-400 text-sm">{t('yesterday')}</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: theme === "dark" ? "#854d0e" : "#f5f5dc",
                color: theme === "dark" ? "#fef3c7" : "#333",
              }}
            >
              {getSentimentLabel(yesterdayValue.value)} - {Math.round(yesterdayValue.value)}
            </span>
          </div>

          {/* Last Week */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-slate-400 text-sm">{t('lastWeek')}</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: theme === "dark" ? "#854d0e" : "#f5f5dc",
                color: theme === "dark" ? "#fef3c7" : "#333",
              }}
            >
              {getSentimentLabel(lastWeekValue.value)} - {Math.round(lastWeekValue.value)}
            </span>
          </div>

          {/* Last Month */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-slate-400 text-sm">{t('lastMonth')}</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: theme === "dark" ? "#854d0e" : "#f5f5dc",
                color: theme === "dark" ? "#fef3c7" : "#333",
              }}
            >
              {getSentimentLabel(lastMonthValue.value)} - {Math.round(lastMonthValue.value)}
            </span>
          </div>
        </div>
      </div>

      {/* Yearly High and Low */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">{t('yearlyHigh')}</h3>
        <div className="space-y-4">
          {/* Yearly High */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-slate-400 text-sm">
              {t('yearlyHighLabel')} ({formatDateShort(yearlyHigh.date)})
            </span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: getSentimentColor(yearlyHigh.value),
                color: "#fff",
              }}
            >
              {getSentimentLabel(yearlyHigh.value)} - {Math.round(yearlyHigh.value)}
            </span>
          </div>

          {/* Yearly Low */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-slate-400 text-sm">
              {t('yearlyLowLabel')} ({formatDateShort(yearlyLow.date)})
            </span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: getSentimentColor(yearlyLow.value),
                color: "#fff",
              }}
            >
              {getSentimentLabel(yearlyLow.value)} - {Math.round(yearlyLow.value)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

