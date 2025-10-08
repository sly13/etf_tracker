"use client";

import { useState, useEffect } from "react";
import apiClient from "../services/api";
import { FundHoldingsData, ApiError } from "../types/api";
import { API_CONFIG } from "../config/api";

// Маппинг названий фондов для отображения
const FUND_NAMES: Record<string, string> = {
  blackrock: "BlackRock",
  fidelity: "Fidelity",
  bitwise: "Bitwise",
  twentyOneShares: "21Shares",
  vanEck: "VanEck",
  invesco: "Invesco",
  franklin: "Franklin Templeton",
  grayscale: "Grayscale BTC",
  grayscaleCrypto: "Grayscale Crypto",
  valkyrie: "Valkyrie",
  wisdomTree: "WisdomTree",
};

// Логотипы фондов (можно заменить на реальные изображения)
const FUND_LOGOS: Record<string, string> = {
  blackrock: "🏦",
  fidelity: "🏛️",
  bitwise: "🔷",
  twentyOneShares: "📊",
  vanEck: "🏢",
  invesco: "💼",
  franklin: "🏛️",
  grayscale: "🏗️",
  grayscaleCrypto: "🏗️",
  valkyrie: "⚡",
  wisdomTree: "🌳",
};

export default function FundHoldingsCard() {
  const [data, setData] = useState<FundHoldingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"company" | "btc" | "eth">("btc");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<FundHoldingsData>(
          API_CONFIG.ENDPOINTS.FUND_HOLDINGS
        );

        setData(response.data);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        const errorMessage =
          apiError?.response?.data?.message ||
          apiError?.message ||
          "Произошла ошибка при загрузке данных о владениях фондов";
        setError(errorMessage);
        console.error("Fund Holdings fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number): string => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}B`;
    } else if (value >= 1) {
      return `$${value.toFixed(1)}M`;
    } else if (value > 0) {
      return `$${(value * 1000).toFixed(1)}K`;
    }
    return "-";
  };

  const formatChange = (value: number): string => {
    if (value === 0) return "0.0";
    if (value > 0) return `+$${value.toFixed(1)}M`;
    return `-$${Math.abs(value).toFixed(1)}M`;
  };

  const getChangeColor = (value: number): string => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-500";
  };

  const handleSort = (column: "company" | "btc" | "eth") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getSortedFunds = () => {
    if (!data) return [];

    const funds = Object.entries(data.fundHoldings).map(([key, holdings]) => ({
      key,
      name: FUND_NAMES[key] || key,
      logo: FUND_LOGOS[key] || "🏢",
      btc: holdings.btc,
      eth: holdings.eth,
    }));

    return funds.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case "company":
          aValue = a.name;
          bValue = b.name;
          break;
        case "btc":
          aValue = a.btc;
          bValue = b.btc;
          break;
        case "eth":
          aValue = a.eth;
          bValue = b.eth;
          break;
        default:
          aValue = a.btc;
          bValue = b.btc;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
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

  const sortedFunds = getSortedFunds();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Владения фондов</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Сортировка:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={e => {
              const [column, order] = e.target.value.split("-");
              setSortBy(column as "company" | "btc" | "eth");
              setSortOrder(order as "asc" | "desc");
            }}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="btc-desc">BTC ↓</option>
            <option value="btc-asc">BTC ↑</option>
            <option value="eth-desc">ETH ↓</option>
            <option value="eth-asc">ETH ↑</option>
            <option value="company-asc">Компания ↑</option>
            <option value="company-desc">Компания ↓</option>
          </select>
        </div>
      </div>

      {/* Таблица владений */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th
                className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("company")}
              >
                Компания{" "}
                {sortBy === "company" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("btc")}
              >
                BTC владения{" "}
                {sortBy === "btc" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort("eth")}
              >
                ETH владения{" "}
                {sortBy === "eth" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedFunds.map(fund => (
              <tr
                key={fund.key}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{fund.logo}</span>
                    <span className="font-medium text-gray-900">
                      {fund.name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="space-y-1">
                    <div className="font-semibold text-orange-600">
                      {formatCurrency(fund.btc)}
                    </div>
                    <div className={`text-sm ${getChangeColor(0)}`}>
                      {formatChange(0)}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="space-y-1">
                    <div className="font-semibold text-blue-600">
                      {formatCurrency(fund.eth)}
                    </div>
                    <div className={`text-sm ${getChangeColor(0)}`}>
                      {formatChange(0)}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Данные обновляются в реальном времени
        </p>
      </div>
    </div>
  );
}
