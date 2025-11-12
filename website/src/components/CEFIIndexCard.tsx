"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "../services/api";
import {
  CEFIIndexResponse,
  AllCEFIIndices,
  ApiError,
} from "../types/api";
import { API_CONFIG } from "../config/api";
import IndexGauge from "./IndexGauge";

export default function CEFIIndexCard() {
  const [data, setData] = useState<AllCEFIIndices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<AllCEFIIndices>(
          API_CONFIG.ENDPOINTS.CEFI_ALL,
          {
            params: {
              limit: 30, // Последние 30 дней для истории
            },
          }
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
            "Произошла ошибка при загрузке индексов CEFI";
        }

        setError(errorMessage);
        console.error("CEFI Index fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number): string => {
    return num.toFixed(2);
  };

  const getGaugeColors = (): string[] => {
    // Цвета для индекса Fear & Greed: красный -> оранжевый -> желтый -> светло-зеленый -> темно-зеленый
    return ["#dc2626", "#f97316", "#eab308", "#22c55e", "#16a34a"];
  };

  const renderIndexCard = (
    index: CEFIIndexResponse,
    title: string,
    icon: React.ReactNode,
    gradientFrom: string,
    gradientTo: string,
    borderColor: string,
    textColor: string,
    indexType: string
  ) => {
    const { current } = index;
    const gaugeColors = getGaugeColors();

    return (
      <Link
        href={`/indices/${indexType}`}
        className={`bg-white dark:bg-slate-800 rounded-xl p-6 border ${borderColor} dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer block`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 ml-3">
              {title}
            </h3>
          </div>
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-slate-400 dark:text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Gauge Chart */}
        <div className="mb-4">
          <IndexGauge
            value={current.value}
            colors={gaugeColors}
            arcWidth={0.15}
            className="w-full"
            id={`gauge-${indexType}`}
          />
          <div className="text-center -mt-2">
            <div className={`text-3xl font-bold ${textColor}`}>
              {formatNumber(current.value)}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
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

  const latestBPF = data.bpf.bitcoin[data.bpf.bitcoin.length - 1];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-center">
          CryptoETF Flows Index (CEFI)
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-400 text-center">
          Индекс отражает направления и интенсивность потоков капитала в
          спотовые криптовалютные ETF
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* CEFI-Composite */}
        {renderIndexCard(
          data.composite,
          "CEFI-Composite Index",
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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
          </div>,
          "from-blue-50",
          "to-blue-100",
          "border-blue-200",
          "text-blue-600 dark:text-blue-400",
          "composite"
        )}

        {/* CEFI-BTC */}
        {renderIndexCard(
          data.btc,
          "CEFI-BTC Index",
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">₿</span>
          </div>,
          "from-blue-50",
          "to-blue-100",
          "border-blue-200",
          "text-blue-600 dark:text-blue-400",
          "btc"
        )}

        {/* CEFI-ETH */}
        {renderIndexCard(
          data.eth,
          "CEFI-ETH Index",
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">Ξ</span>
          </div>,
          "from-blue-50",
          "to-blue-100",
          "border-blue-200",
          "text-blue-600 dark:text-blue-400",
          "eth"
        )}

        {/* CEFI-SOL */}
        {data.sol && renderIndexCard(
          data.sol,
          "CEFI-SOL Index",
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">◎</span>
          </div>,
          "from-blue-50",
          "to-blue-100",
          "border-blue-200",
          "text-blue-600 dark:text-blue-400",
          "sol"
        )}
      </div>

      {/* BPF Section */}
      {latestBPF && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                BPF (Breadth of Positive Flows)
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-400 mb-4">
                Процент фондов с положительным притоком капитала
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatNumber(latestBPF.percentage)}%
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-400 mt-1">
                {latestBPF.positiveFunds} из {latestBPF.totalFunds} фондов
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Нажмите на карточку индекса, чтобы просмотреть подробный график
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          Индексы обновляются ежедневно на основе данных о потоках ETF
        </p>
      </div>
    </div>
  );
}


