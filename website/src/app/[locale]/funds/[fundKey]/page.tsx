"use client";

import { useEffect, useState } from "react";
import Navigation from "../../../../components/Navigation";
import MoneyRain from "../../../../components/MoneyRain";
import FundLogo from "../../../../components/FundLogo";
import { fundService, FundDetail } from "../../../../services/fundService";
import { useRouter } from "../../../../i18n/routing";

// Логотипы фондов
const FUND_LOGOS: Record<string, string> = {
  blackrock: "/images/fund_logos/blackrock.jpg",
  fidelity: "/images/fund_logos/fidelity.jpg",
  bitwise: "/images/fund_logos/bitwise.jpg",
  twentyOneShares: "/images/fund_logos/ark.jpg",
  vanEck: "/images/fund_logos/vaneck.jpg",
  invesco: "/images/fund_logos/invesco.jpg",
  franklin: "/images/fund_logos/franklin.jpg",
  grayscale: "/images/fund_logos/grayscale-gbtc.jpg",
  grayscaleCrypto: "/images/fund_logos/grayscale.jpg",
  valkyrie: "/images/fund_logos/valkyrie.jpg",
  wisdomTree: "/images/fund_logos/wtree.jpg",
};

// Описания фондов
const FUND_DESCRIPTIONS: Record<string, string> = {
  blackrock:
    "BlackRock — крупнейший в мире управляющий активами с более чем $10 трлн под управлением. Компания предлагает широкий спектр инвестиционных продуктов, включая ETF фонды.",
  fidelity:
    "Fidelity Investments — одна из крупнейших инвестиционных компаний США с богатой историей управления активами и предоставления финансовых услуг.",
  bitwise:
    "Bitwise Asset Management — специализируется на криптовалютных инвестициях и управлении цифровыми активами для институциональных инвесторов.",
  twentyOneShares:
    "21Shares — европейский лидер в области криптовалютных ETF, предлагающий доступ к цифровым активам через регулируемые инвестиционные продукты.",
  vanEck:
    "VanEck — международная инвестиционная компания, известная своими инновационными ETF продуктами и экспертными знаниями в области товарных рынков.",
  invesco:
    "Invesco — глобальная инвестиционная компания с широким спектром ETF продуктов и активным управлением активами.",
  franklin:
    "Franklin Templeton — одна из старейших инвестиционных компаний США с фокусом на долгосрочных инвестиционных стратегиях.",
  grayscale:
    "Grayscale Investments — пионер в области криптовалютных инвестиций, предлагающий институциональным инвесторам доступ к цифровым активам.",
  grayscaleCrypto:
    "Grayscale Crypto — специализированное подразделение Grayscale, фокусирующееся на разнообразных криптовалютных инвестициях.",
  valkyrie:
    "Valkyrie Investments — инновационная инвестиционная компания, специализирующаяся на криптовалютных и альтернативных инвестициях.",
  wisdomTree:
    "WisdomTree — компания, известная своими дивидендными ETF и стратегиями, основанными на фундаментальных показателях.",
};

interface FundPageProps {
  params: Promise<{
    fundKey: string;
    locale: string;
  }>;
}

export default function FundPage({ params }: FundPageProps) {
  const [fund, setFund] = useState<FundDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fundKey, setFundKey] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params;
      const key = resolvedParams.fundKey;
      setFundKey(key);

      try {
        const fundData = await fundService.getFundDetails(key);
        
        // Проверяем, что данные получены
        if (!fundData || !fundData.name) {
          console.error(`Fund data is invalid for key: ${key}`, fundData);
          setError("Фонд не найден");
          return;
        }
        
        setFund(fundData);
      } catch (error) {
        console.error(`Error fetching fund details for ${key}:`, error);
        setError("Ошибка при загрузке данных фонда");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <Navigation />
        <main className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Загрузка...</div>
        </main>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <Navigation />
        <main className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || "Фонд не найден"}</p>
            <button
              onClick={() => router.replace("/funds")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться к списку фондов
            </button>
          </div>
        </main>
      </div>
    );
  }

  const formatNumber = (num: string | bigint): string => {
    const numValue = typeof num === 'string' ? Number(num) : Number(num);
    if (numValue >= 1000000000) {
      return `$${(numValue / 1000000000).toFixed(1)}B`;
    } else if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(1)}K`;
    }
    return `$${numValue.toFixed(1)}`;
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--background)' }}>
      {/* Money Rain Animation */}
      <MoneyRain />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Fund Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <FundLogo
              src={fund.logoUrl || FUND_LOGOS[fundKey]}
              alt={fund.name}
              className="w-16 h-16 rounded-full mr-6 object-cover"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">{fund.name}</h1>
              <p className="text-lg text-gray-600 dark:text-slate-400 mt-2">
                {fund.fundType || "ETF"} Фонд
              </p>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 dark:text-slate-300 text-lg leading-relaxed">
              {fund.description || FUND_DESCRIPTIONS[fundKey]}
            </p>
          </div>
        </div>

        {/* Fund Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
              BTC Владения
            </h3>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {formatNumber(fund.btcHoldings)}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Общие активы в Bitcoin</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
              ETH Владения
            </h3>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {formatNumber(fund.ethHoldings)}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Общие активы в Ethereum</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
              Общие Активы
            </h3>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {formatNumber(fund.totalAssets)}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Суммарные владения</div>
          </div>
        </div>

        {/* Fund Details */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">
            Детальная информация
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Основные показатели
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Тикер:</span>
                  <span className="font-semibold dark:text-slate-200">
                    {fund.ticker || fundKey.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Тип фонда:</span>
                  <span className="font-semibold dark:text-slate-200">
                    {fund.fundType || "ETF"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Категория:</span>
                  <span className="font-semibold dark:text-slate-200">Криптовалютный</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Комиссия:</span>
                  <span className="font-semibold dark:text-slate-200">
                    {fund.feePercentage ? `${fund.feePercentage}%` : "0.25%"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Исторические данные
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Дата запуска:</span>
                  <span className="font-semibold dark:text-slate-200">
                    {fund.launchDate
                      ? new Date(fund.launchDate).toLocaleDateString("ru-RU")
                      : "2024-01-11"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Количество дней:</span>
                  <span className="font-semibold dark:text-slate-200">
                    {fund.launchDate
                      ? Math.floor(
                          (Date.now() - new Date(fund.launchDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : "452"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Последнее обновление:</span>
                  <span className="font-semibold dark:text-slate-200">
                    {new Date(fund.updatedAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Статус:</span>
                  <span
                    className={`font-semibold ${
                      fund.status === "active"
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {fund.status === "active"
                      ? "Активный"
                      : fund.status || "Активный"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">
            График производительности
          </h2>
          <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-slate-400">
              График будет добавлен в будущих обновлениях
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-20 relative z-10">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Crypto ETFs</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Профессиональная платформа для отслеживания ETF фондов и
              управления инвестициями.
            </p>
            <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 text-center text-slate-500 dark:text-slate-400">
              <p>&copy; 2024 Crypto ETFs. Все права защищены.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

