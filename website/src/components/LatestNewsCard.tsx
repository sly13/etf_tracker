"use client";

import { useState, useEffect } from "react";
import apiClient from "../services/api";
import { ApiError } from "../types/api";
import { API_CONFIG } from "../config/api";

interface NewsItem {
  asset: string;
  title: string;
  flow: number;
  change: number;
  date: string;
  color: string;
  icon: string;
}

export default function LatestNewsCard() {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем данные из summary endpoint
        const summaryResponse = await apiClient.get(
          API_CONFIG.ENDPOINTS.SUMMARY
        );
        const summaryData = summaryResponse.data;

        // Получаем данные из holdings endpoint для более детальной информации
        const holdingsResponse = await apiClient.get(
          API_CONFIG.ENDPOINTS.FUND_HOLDINGS
        );
        const holdingsData = holdingsResponse.data;

        // Формируем новости на основе полученных данных
        const news: NewsItem[] = [
          {
            asset: "Bitcoin ETF",
            title: "Обновление потоков Bitcoin ETF",
            flow: summaryData.bitcoin.currentFlow,
            change: summaryData.bitcoin.currentFlow > 0 ? 1 : -1,
            date:
              summaryData.bitcoin.latestDate ||
              new Date().toISOString().split("T")[0],
            color: "blue",
            icon: "₿",
          },
          {
            asset: "Ethereum ETF",
            title: "Обновление потоков Ethereum ETF",
            flow: summaryData.ethereum.currentFlow,
            change: summaryData.ethereum.currentFlow > 0 ? 1 : -1,
            date:
              summaryData.ethereum.latestDate ||
              new Date().toISOString().split("T")[0],
            color: "blue",
            icon: "Ξ",
          },
          {
            asset: "Solana ETF",
            title: "Обновление потоков Solana ETF",
            flow: summaryData.solana?.currentFlow || 0,
            change: (summaryData.solana?.currentFlow || 0) > 0 ? 1 : -1,
            date:
              summaryData.solana?.latestDate ||
              new Date().toISOString().split("T")[0],
            color: "blue",
            icon: "◎",
          },
        ];

        setNewsData(news);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        let errorMessage: string;
        
        if (apiError?.timeoutError && apiError?.timeoutMessage) {
          errorMessage = apiError.timeoutMessage;
        } else {
          errorMessage =
            apiError?.response?.data?.message ||
            apiError?.message ||
            "Произошла ошибка при загрузке новостей";
        }
        
        setError(errorMessage);
        console.error("Latest News fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  const formatFlow = (flow: number): string => {
    const absFlow = Math.abs(flow);
    if (absFlow >= 1000) {
      return `${(absFlow / 1000).toFixed(1)}B`;
    } else {
      return `${absFlow.toFixed(1)}M`;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getColorClasses = (color: string) => {
    // Единый цвет для всех ETF - белый фон в светлой теме, темный в темной
    return "bg-white border-blue-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100";
  };

  const getIconColorClasses = (color: string) => {
    // Единый цвет для всех ETF
    return "bg-blue-500 text-white";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="flex flex-col lg:flex-row gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Последние новости
          </h2>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {newsData.length > 0 && formatDate(newsData[0].date)}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {newsData.map((news, index) => {
          // Определяем фоновое изображение для Bitcoin ETF, Ethereum ETF и Solana ETF
          const getBackgroundImage = () => {
            if (news.asset === "Bitcoin ETF") {
              return news.flow > 0 ? "/images/long.png" : "/images/short.png";
            }
            if (news.asset === "Ethereum ETF") {
              return news.flow > 0 ? "/images/long.png" : "/images/short.png";
            }
            if (news.asset === "Solana ETF") {
              return news.flow > 0 ? "/images/long.png" : "/images/short.png";
            }
            return null;
          };

          const backgroundImage = getBackgroundImage();

          return (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getColorClasses(
                news.color
              )} relative overflow-hidden flex-1`}
              style={{
                backgroundImage: backgroundImage
                  ? `url(${backgroundImage})`
                  : undefined,
                backgroundSize: backgroundImage ? "contain" : undefined,
                backgroundRepeat: backgroundImage ? "no-repeat" : undefined,
                backgroundPosition: backgroundImage
                  ? "right center"
                  : undefined,
                minHeight:
                  news.asset === "Bitcoin ETF" || news.asset === "Ethereum ETF" || news.asset === "Solana ETF"
                    ? "300px"
                    : undefined,
              }}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    {news.asset === "Bitcoin ETF" ? (
                      <img
                        src="/images/bitcoin.png"
                        alt="Bitcoin"
                        className="w-full h-full object-contain"
                      />
                    ) : news.asset === "Ethereum ETF" ? (
                      <img
                        src="/images/ethereum.png"
                        alt="Ethereum"
                        className="w-full h-full object-contain"
                      />
                    ) : news.asset === "Solana ETF" ? (
                      <img
                        src="/images/solana.png"
                        alt="Solana"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-lg font-bold">{news.icon}</span>
                    )}
                  </div>
                  <div className="flex-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg px-3 py-2 -ml-3">
                    <h3 className="font-semibold text-lg mb-1 text-slate-900 dark:text-slate-100">{news.asset}</h3>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        ${formatFlow(news.flow)}
                      </span>
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400 ml-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-2">
                  {news.change > 0 ? (
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-600 dark:text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Данные обновляются в реальном времени
        </p>
      </div>
    </div>
  );
}
