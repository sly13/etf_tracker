"use client";

import { useState, useEffect } from "react";
import apiClient from "../services/api";
import { CEFIIndexResponse, ApiError } from "../types/api";
import { API_CONFIG } from "../config/api";

interface HistoricalValuesProps {
  indexType: "btc" | "eth" | "sol" | "composite";
}

export default function HistoricalValues({ indexType }: HistoricalValuesProps) {
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
            "Произошла ошибка при загрузке исторических данных";
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
    if (value >= 80) return "Extreme Greed";
    if (value >= 60) return "Greed";
    if (value >= 40) return "Neutral";
    if (value >= 20) return "Fear";
    return "Extreme Fear";
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-red-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-red-700">{error}</span>
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Historical Values</h3>
        <div className="space-y-4">
          {/* Yesterday */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Yesterday</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: "#f5f5dc",
                color: "#333",
              }}
            >
              {getSentimentLabel(yesterdayValue.value)} - {Math.round(yesterdayValue.value)}
            </span>
          </div>

          {/* Last Week */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Last Week</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: "#f5f5dc",
                color: "#333",
              }}
            >
              {getSentimentLabel(lastWeekValue.value)} - {Math.round(lastWeekValue.value)}
            </span>
          </div>

          {/* Last Month */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Last Month</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: "#f5f5dc",
                color: "#333",
              }}
            >
              {getSentimentLabel(lastMonthValue.value)} - {Math.round(lastMonthValue.value)}
            </span>
          </div>
        </div>
      </div>

      {/* Yearly High and Low */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Yearly High and Low</h3>
        <div className="space-y-4">
          {/* Yearly High */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">
              Yearly High ({formatDateShort(yearlyHigh.date)})
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
            <span className="text-gray-600 text-sm">
              Yearly Low ({formatDateShort(yearlyLow.date)})
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

