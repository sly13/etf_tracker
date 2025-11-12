"use client";

import { useState, useEffect } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import apiClient from "../services/api";
import { IndexChartResponse, ApiError } from "../types/api";
import { API_CONFIG } from "../config/api";

interface IndexChartProps {
  indexType: "btc" | "eth" | "composite";
  title?: string;
}

type TimeRange = "30d" | "1y" | "all";

export default function IndexChart({ indexType, title }: IndexChartProps) {
  const [data, setData] = useState<IndexChartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<IndexChartResponse>(
          `${API_CONFIG.ENDPOINTS.CEFI_CHART}/${indexType}`,
          {
            params: {
              timeRange,
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
            "Произошла ошибка при загрузке данных графика";
        }

        setError(errorMessage);
        console.error("Index Chart fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [indexType, timeRange]);

  const formatPrice = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const formatVolume = (value: number): string => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const formatIndexValue = (value: number): string => {
    return value.toFixed(0);
  };

  const formatFlow = (value: number): string => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}B`;
    }
    if (value >= 1) {
      return `$${value.toFixed(1)}M`;
    }
    if (value > 0) {
      return `$${(value * 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(1)}M`;
  };

  const getFundDisplayName = (fundKey: string): string => {
    const fundNames: Record<string, string> = {
      blackrock: "BlackRock",
      fidelity: "Fidelity",
      bitwise: "Bitwise",
      twentyOneShares: "21Shares",
      vanEck: "VanEck",
      invesco: "Invesco",
      franklin: "Franklin",
      grayscale: "Grayscale",
      grayscaleBtc: "Grayscale BTC",
      grayscaleEth: "Grayscale ETH",
      valkyrie: "Valkyrie",
      wisdomTree: "WisdomTree",
    };
    return fundNames[fundKey] || fundKey;
  };

  const getIndexColor = (indexType: string): string => {
    switch (indexType) {
      case "btc":
        return "#f97316"; // orange
      case "eth":
        return "#3b82f6"; // blue
      case "composite":
        return "#a855f7"; // purple
      default:
        return "#6b7280"; // gray
    }
  };

  const getSentimentColor = (value: number): string => {
    if (value >= 80) return "#16a34a"; // dark green - extreme greed
    if (value >= 60) return "#22c55e"; // green - greed
    if (value >= 40) return "#eab308"; // yellow - neutral
    if (value >= 20) return "#f97316"; // orange - fear
    return "#dc2626"; // red - extreme fear
  };

  interface TooltipPayload {
    dataKey?: string;
    value?: number;
    color?: string;
    payload?: {
      date: string;
      indexValue: number;
      btcPrice: number;
      btcVolume: number;
      flows?: {
        total: number;
        funds: Record<string, number>;
      };
      index?: string;
    };
  }

  interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data) return null;
      
      // Преобразуем timestamp обратно в дату, если это число
      const dateValue = typeof data.date === 'number' ? new Date(data.date) : new Date(data.date);
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-md">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {dateValue.toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
          <div className="space-y-1 mb-3">
            {payload.map((entry: TooltipPayload, index: number) => {
              if (entry.dataKey === "indexValue" && entry.value !== undefined) {
                return (
                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                    {`Индекс: ${formatIndexValue(entry.value)}`}
                  </p>
                );
              }
              if (entry.dataKey === "btcPrice" && entry.value !== undefined) {
                return (
                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                    {`Цена Bitcoin: $${formatPrice(entry.value)}`}
                  </p>
                );
              }
              if (entry.dataKey === "btcVolume" && entry.value !== undefined) {
                return (
                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                    {`Объем Bitcoin: $${formatVolume(entry.value)}`}
                  </p>
                );
              }
              return null;
            })}
          </div>
          
          {/* Притоки ETF */}
          {data.flows && data.flows.total !== undefined && (
            <div className="border-t border-gray-200 pt-2 mt-2">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Притоки ETF:
              </p>
              <p className="text-xs text-gray-600 mb-2">
                Всего: <span className="font-semibold">{formatFlow(data.flows.total)}</span>
              </p>
              {data.flows.funds && Object.keys(data.flows.funds).length > 0 && (
                <div className="max-h-40 overflow-y-auto">
                  {Object.entries(data.flows.funds)
                    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                    .map(([fundKey, value]) => (
                      <div
                        key={fundKey}
                        className="flex justify-between items-center text-xs py-0.5"
                      >
                        <span className="text-gray-600">{getFundDisplayName(fundKey)}:</span>
                        <span
                          className={`font-medium ${
                            value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-gray-500"
                          }`}
                        >
                          {value > 0 ? "+" : ""}
                          {formatFlow(value)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
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

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">Нет данных для отображения</p>
      </div>
    );
  }

  const chartData = data.data.map((point) => ({
    ...point,
    date: new Date(point.date).getTime(),
  }));

  const indexColor = getIndexColor(indexType);
  const currentIndexValue = data.current.indexValue;
  const currentIndexColor = getSentimentColor(currentIndexValue);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {title || `${data.index} Chart`}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === "30d"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              30d
            </button>
            <button
              onClick={() => setTimeRange("1y")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === "1y"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              1y
            </button>
            <button
              onClick={() => setTimeRange("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: indexColor }}
            ></div>
            <span>{data.index}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
            <span>Bitcoin Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-700"></div>
            <span>Bitcoin Volume</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="extremeGreed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="greed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="neutral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eab308" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#eab308" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="extremeFear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("ru-RU", {
                month: "short",
                year: "numeric",
              });
            }}
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            label={{
              value: "USD",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: "#6b7280" },
            }}
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tickFormatter={formatPrice}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            label={{
              value: "F&G",
              angle: 90,
              position: "insideRight",
              style: { textAnchor: "middle", fill: "#6b7280" },
            }}
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tickFormatter={formatIndexValue}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {/* Зоны настроений для индекса (0-100) - фоновые области */}
          {/* Эти зоны будут отображаться как фон, но не в легенде */}
          {/* Линия индекса с динамическим цветом */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="indexValue"
            stroke={indexColor}
            strokeWidth={3}
            dot={false}
            name={data.index}
            strokeDasharray="0"
          />
          {/* Линия цены Bitcoin */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="btcPrice"
            stroke="#6b7280"
            strokeWidth={2}
            dot={false}
            name="Bitcoin Price"
          />
          {/* Область объема Bitcoin */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="btcVolume"
            stroke="#374151"
            strokeWidth={1}
            fill="#374151"
            fillOpacity={0.3}
            name="Bitcoin Volume"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {data.current && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Текущее значение индекса</p>
              <p
                className="text-2xl font-bold"
                style={{ color: currentIndexColor }}
              >
                {formatIndexValue(data.current.indexValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Цена Bitcoin</p>
              <p className="text-xl font-semibold text-gray-900">
                ${formatPrice(data.current.btcPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Объем Bitcoin</p>
              <p className="text-xl font-semibold text-gray-900">
                ${formatVolume(data.current.btcVolume)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

