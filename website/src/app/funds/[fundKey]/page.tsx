import { notFound } from "next/navigation";
import Navigation from "../../../components/Navigation";
import MoneyRain from "../../../components/MoneyRain";
import FundLogo from "../../../components/FundLogo";
import { fundService, FundDetail } from "../../../services/fundService";

// Маппинг названий фондов
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
  }>;
}

export default async function FundPage({ params }: FundPageProps) {
  const { fundKey } = await params;

  let fund: FundDetail;
  try {
    fund = await fundService.getFundDetails(fundKey);
  } catch (error) {
    notFound();
  }

  const formatNumber = (num: bigint): string => {
    const numValue = Number(num);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Money Rain Animation */}
      <MoneyRain />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Fund Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <FundLogo
              src={fund.logoUrl || FUND_LOGOS[fundKey]}
              alt={fund.name}
              className="w-16 h-16 rounded-full mr-6 object-cover"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{fund.name}</h1>
              <p className="text-lg text-gray-600 mt-2">
                {fund.fundType || "ETF"} Фонд
              </p>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed">
              {fund.description || FUND_DESCRIPTIONS[fundKey]}
            </p>
          </div>
        </div>

        {/* Fund Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              BTC Владения
            </h3>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {formatNumber(fund.btcHoldings)}
            </div>
            <div className="text-sm text-gray-500">Общие активы в Bitcoin</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ETH Владения
            </h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatNumber(fund.ethHoldings)}
            </div>
            <div className="text-sm text-gray-500">Общие активы в Ethereum</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Общие Активы
            </h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatNumber(fund.totalAssets)}
            </div>
            <div className="text-sm text-gray-500">Суммарные владения</div>
          </div>
        </div>

        {/* Fund Details */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Детальная информация
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Основные показатели
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Тикер:</span>
                  <span className="font-semibold">
                    {fund.ticker || fundKey.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Тип фонда:</span>
                  <span className="font-semibold">
                    {fund.fundType || "ETF"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Категория:</span>
                  <span className="font-semibold">Криптовалютный</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Комиссия:</span>
                  <span className="font-semibold">
                    {fund.feePercentage ? `${fund.feePercentage}%` : "0.25%"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Исторические данные
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Дата запуска:</span>
                  <span className="font-semibold">
                    {fund.launchDate
                      ? new Date(fund.launchDate).toLocaleDateString("ru-RU")
                      : "2024-01-11"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Количество дней:</span>
                  <span className="font-semibold">
                    {fund.launchDate
                      ? Math.floor(
                          (Date.now() - new Date(fund.launchDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : "452"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Последнее обновление:</span>
                  <span className="font-semibold">
                    {new Date(fund.updatedAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Статус:</span>
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
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            График производительности
          </h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">
              График будет добавлен в будущих обновлениях
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">ETF Tracker</h3>
            <p className="text-gray-400 mb-4">
              Профессиональная платформа для отслеживания ETF фондов и
              управления инвестициями.
            </p>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 ETF Tracker. Все права защищены.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
