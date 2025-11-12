"use client";

import { useState, useEffect } from "react";
import apiClient from "../services/api";
import { CEFIIndexResponse, ApiError } from "../types/api";
import { API_CONFIG } from "../config/api";
import IndexGauge from "./IndexGauge";

interface CurrentIndexValueProps {
  indexType: "btc" | "eth" | "sol" | "composite";
}

export default function CurrentIndexValue({
  indexType,
}: CurrentIndexValueProps) {
  const [data, setData] = useState<CEFIIndexResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            "Произошла ошибка при загрузке данных";
        }

        setError(errorMessage);
        console.error("Current Index Value fetch error:", err);
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

  const getGaugeColors = (): string[] => {
    return ["#dc2626", "#f97316", "#eab308", "#22c55e", "#16a34a"];
  };

  const formatIndexValue = (value: number): string => {
    return value.toFixed(0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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

  if (!data || !data.current) {
    return null;
  }

  const currentValue = data.current.value;
  const currentColor = getSentimentColor(currentValue);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
        Текущее значение индекса
      </h3>
      <div className="max-w-md mx-auto">
        <IndexGauge
          value={currentValue}
          colors={getGaugeColors()}
          arcWidth={0.15}
          className="w-full"
          id={`current-gauge-${indexType}`}
        />
        <div className="text-center mt-16">
          <div
            className="text-4xl font-bold mb-2"
            style={{ color: currentColor }}
          >
            {formatIndexValue(currentValue)}
          </div>
          <div className="text-lg text-gray-600 mb-1">
            {getSentimentLabel(currentValue)}
          </div>
        </div>
      </div>
    </div>
  );
}
