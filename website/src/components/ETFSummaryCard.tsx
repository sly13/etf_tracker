"use client";

import { useState, useEffect } from "react";
import apiClient from "../services/api";
import { SummaryData, ApiError } from "../types/api";
import { API_CONFIG } from "../config/api";

export default function ETFSummaryCard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<SummaryData>(
          API_CONFIG.ENDPOINTS.SUMMARY
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
            "Произошла ошибка при загрузке данных";
        }

        setError(errorMessage);
        console.error("ETF Summary fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(1);
  };

  // Форматирование потоков: данные приходят в миллионах
  // Для отдельных ETF всегда показываем в миллионах (M)
  // Для общего потока: если >= 1000M, показываем в миллиардах (B), иначе в миллионах (M)
  const formatFlow = (num: number, isOverall: boolean = false): string => {
    if (isOverall && num >= 1000) {
      return `${(num / 1000).toFixed(1)}B`;
    }
    return `${num.toFixed(1)}M`;
  };

  // Форматирование активов: данные приходят в миллионах, конвертируем в доллары
  const formatAssets = (num: number): string => {
    // Умножаем на 1,000,000 чтобы получить доллары, затем форматируем
    const dollars = num * 1000000;
    return formatNumber(dollars);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Нет данных";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
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

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
        Суммарные данные ETF фондов
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Общий итог */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Общий итог
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Общие активы:
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                ${formatAssets(data.overall.totalAssets)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Общий поток:
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                ${formatFlow(data.overall.currentFlow, true)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400 opacity-0">
                Количество дней:
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400 opacity-0">
                0
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Последнее обновление:
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-500">
                {formatDate(data.overall.lastUpdated)}
              </span>
            </div>
          </div>
        </div>

        {/* Bitcoin */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">₿</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Bitcoin ETF
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Общие активы:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                ${formatAssets(data.bitcoin.totalAssets)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Текущий поток:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                ${formatFlow(data.bitcoin.currentFlow)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Количество дней:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {data.bitcoin.count}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Последнее обновление:
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-500">
                {formatDate(data.bitcoin.latestDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Ethereum */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">Ξ</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Ethereum ETF
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Общие активы:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                ${formatAssets(data.ethereum.totalAssets)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Текущий поток:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                ${formatFlow(data.ethereum.currentFlow)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Количество дней:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {data.ethereum.count}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Последнее обновление:
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-500">
                {formatDate(data.ethereum.latestDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Solana */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">◎</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Solana ETF
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Общие активы:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                ${formatAssets(data.solana.totalAssets)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Текущий поток:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                ${formatFlow(data.solana.currentFlow)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Количество дней:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {data.solana.count}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 dark:text-slate-400">
                Последнее обновление:
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-500">
                {formatDate(data.solana.latestDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Данные обновляются в реальном времени
        </p>
      </div>
    </div>
  );
}
