"use client";

import { useState, useEffect } from "react";
import apiClient from "../services/api";
import {
  CEFIIndexResponse,
  AllCEFIIndices,
  ApiError,
} from "../types/api";
import { API_CONFIG } from "../config/api";
import IndexChart from "./IndexChart";

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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return (
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      );
    }
    if (change < 0) {
      return (
        <svg
          className="w-5 h-5 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          />
        </svg>
      );
    }
    return null;
  };

  const renderIndexCard = (
    index: CEFIIndexResponse,
    title: string,
    icon: React.ReactNode,
    gradientFrom: string,
    gradientTo: string,
    borderColor: string,
    textColor: string
  ) => {
    const { current } = index;

    return (
      <div
        className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg p-6 border ${borderColor} shadow-md`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900 ml-3">
              {title}
            </h3>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${textColor}`}>
              {formatNumber(current.value)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {formatDate(current.date)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 text-sm">Изменение:</span>
            <div className={`flex items-center ${getChangeColor(current.change)}`}>
              {getChangeIcon(current.change)}
              <span className="ml-1 font-semibold">
                {current.change >= 0 ? "+" : ""}
                {formatNumber(current.change)} (
                {current.changePercent >= 0 ? "+" : ""}
                {formatNumber(current.changePercent)}%)
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 text-sm">Базовое значение:</span>
            <span className="font-semibold text-gray-900">
              {index.metadata.baseValue}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
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

  if (!data) {
    return null;
  }

  const latestBPF = data.bpf.bitcoin[data.bpf.bitcoin.length - 1];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          CryptoETF Flows Index (CEFI)
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Индекс отражает направления и интенсивность потоков капитала в
          спотовые криптовалютные ETF
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* CEFI-BTC */}
        {renderIndexCard(
          data.btc,
          "CEFI-BTC",
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">₿</span>
          </div>,
          "from-orange-50",
          "to-orange-100",
          "border-orange-200",
          "text-orange-600"
        )}

        {/* CEFI-ETH */}
        {renderIndexCard(
          data.eth,
          "CEFI-ETH",
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">Ξ</span>
          </div>,
          "from-blue-50",
          "to-blue-100",
          "border-blue-200",
          "text-blue-600"
        )}

        {/* CEFI-Composite */}
        {renderIndexCard(
          data.composite,
          "CEFI-Composite",
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
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
          "from-purple-50",
          "to-purple-100",
          "border-purple-200",
          "text-purple-600"
        )}
      </div>

      {/* BPF Section */}
      {latestBPF && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                BPF (Breadth of Positive Flows)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Процент фондов с положительным притоком капитала
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {formatNumber(latestBPF.percentage)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {latestBPF.positiveFunds} из {latestBPF.totalFunds} фондов
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Индексы обновляются ежедневно на основе данных о потоках ETF
        </p>
      </div>

      {/* График индекса CEFI-BTC */}
      <div className="mt-8">
        <IndexChart indexType="btc" title="CEFI-BTC Index Chart" />
      </div>

      {/* График индекса CEFI-ETH */}
      <div className="mt-8">
        <IndexChart indexType="eth" title="CEFI-ETH Index Chart" />
      </div>

      {/* График композитного индекса */}
      <div className="mt-8">
        <IndexChart indexType="composite" title="CEFI-Composite Index Chart" />
      </div>
    </div>
  );
}


