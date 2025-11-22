"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Select from "react-select";
import { useTranslations } from 'next-intl';
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

// Логотипы фондов
const FUND_LOGOS: Record<string, string> = {
  blackrock: "/images/fund_logos/blackrock.jpg",
  fidelity: "/images/fund_logos/fidelity.jpg",
  bitwise: "/images/fund_logos/bitwise.jpg",
  twentyOneShares: "/images/fund_logos/ark.jpg", // используем ark.jpg для 21Shares
  vanEck: "/images/fund_logos/vaneck.jpg",
  invesco: "/images/fund_logos/invesco.jpg",
  franklin: "/images/fund_logos/franklin.jpg",
  grayscale: "/images/fund_logos/grayscale-gbtc.jpg",
  grayscaleCrypto: "/images/fund_logos/grayscale.jpg",
  valkyrie: "/images/fund_logos/valkyrie.jpg",
  wisdomTree: "/images/fund_logos/wtree.jpg",
};

export default function FundHoldingsCard() {
  const t = useTranslations('funds.holdings');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const [data, setData] = useState<FundHoldingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"company" | "btc" | "eth" | "sol">("btc");
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
        let errorMessage: string;
        
        if (apiError?.timeoutError && apiError?.timeoutMessage) {
          errorMessage = apiError.timeoutMessage;
        } else {
          errorMessage =
            apiError?.response?.data?.message ||
            apiError?.message ||
            tErrors('loadingHoldings');
        }
        
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
    return "text-slate-500 dark:text-slate-400";
  };

  const handleSort = (column: "company" | "btc" | "eth" | "sol") => {
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
      sol: holdings.sol,
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
        case "sol":
          aValue = a.sol;
          bValue = b.sol;
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
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
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

  const sortedFunds = getSortedFunds();

  const getSortLabel = (sortBy: string, sortOrder: string) => {
    const labels: Record<string, Record<string, string>> = {
      btc: { desc: t('btcDesc'), asc: t('btcAsc') },
      eth: { desc: t('ethDesc'), asc: t('ethAsc') },
      sol: { desc: t('solDesc'), asc: t('solAsc') },
      company: { desc: t('companyDesc'), asc: t('companyAsc') },
    };
    return labels[sortBy]?.[sortOrder] || t('btcDesc');
  };

  const getFundUrl = (fundKey: string) => {
    return `/funds/${fundKey}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">{t('sortBy')}</span>
          <div className="w-48">
            <Select
              value={{
                value: `${sortBy}-${sortOrder}`,
                label: getSortLabel(sortBy, sortOrder),
              }}
              onChange={option => {
                if (option) {
                  const [column, order] = option.value.split("-");
                  setSortBy(column as "company" | "btc" | "eth" | "sol");
                  setSortOrder(order as "asc" | "desc");
                }
              }}
              options={[
                { value: "btc-desc", label: t('btcDesc') },
                { value: "btc-asc", label: t('btcAsc') },
                { value: "eth-desc", label: t('ethDesc') },
                { value: "eth-asc", label: t('ethAsc') },
                { value: "sol-desc", label: t('solDesc') },
                { value: "sol-asc", label: t('solAsc') },
                { value: "company-asc", label: t('companyAsc') },
                { value: "company-desc", label: t('companyDesc') },
              ]}
              styles={{
                control: provided => ({
                  ...provided,
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  "&:hover": {
                    borderColor: "#9ca3af",
                  },
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? "#3b82f6"
                    : state.isFocused
                    ? "#f3f4f6"
                    : "white",
                  color: state.isSelected ? "white" : "#374151",
                }),
              }}
              isSearchable={false}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Таблица владений */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th
                className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                onClick={() => handleSort("company")}
              >
                {t('company')}{" "}
                {sortBy === "company" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                onClick={() => handleSort("btc")}
              >
                {t('btcHoldings')}{" "}
                {sortBy === "btc" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                onClick={() => handleSort("eth")}
              >
                {t('ethHoldings')}{" "}
                {sortBy === "eth" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                onClick={() => handleSort("sol")}
              >
                {t('solHoldings')}{" "}
                {sortBy === "sol" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedFunds.map(fund => (
              <tr
                key={fund.key}
                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <img
                      src={fund.logo}
                      alt={fund.name}
                      className="w-8 h-8 rounded-full mr-3 object-cover"
                      onError={e => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <Link
                      href={getFundUrl(fund.key)}
                      className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {fund.name}
                    </Link>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="space-y-1">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(fund.btc)}
                    </div>
                    <div className={`text-sm ${getChangeColor(0)}`}>
                      {formatChange(0)}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="space-y-1">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(fund.eth)}
                    </div>
                    <div className={`text-sm ${getChangeColor(0)}`}>
                      {formatChange(0)}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="space-y-1">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(fund.sol)}
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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {tCommon('dataUpdatesRealtime')}
        </p>
      </div>
    </div>
  );
}
