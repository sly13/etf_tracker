import Link from "next/link";
import Navigation from "../../components/Navigation";
import MoneyRain from "../../components/MoneyRain";
import FundLogo from "../../components/FundLogo";

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

export default function FundsPage() {
  const funds = Object.keys(FUND_NAMES).map(key => ({
    key,
    name: FUND_NAMES[key],
    logo: FUND_LOGOS[key],
  }));

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "var(--background)" }}
    >
      {/* Money Rain Animation */}
      <MoneyRain />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Все ETF Фонды
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            Изучите детальную информацию о каждом ETF фонде, включая их
            владения, производительность и исторические данные.
          </p>
        </div>

        {/* Funds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funds.map(fund => (
            <Link
              key={fund.key}
              href={`/funds/${fund.key}`}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center mb-4">
                <FundLogo
                  src={fund.logo}
                  alt={fund.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {fund.name}
                </h3>
              </div>

              <p className="text-gray-600 dark:text-slate-400 mb-4">
                ETF фонд с фокусом на криптовалютные активы
              </p>

              <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
                <span>Тикер: {fund.key.toUpperCase()}</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Активный
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-16 bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6 text-center">
            Общая статистика
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {funds.length}
              </div>
              <div className="text-gray-600 dark:text-slate-400">
                Всего фондов
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                $601.7B
              </div>
              <div className="text-gray-600 dark:text-slate-400">
                Общие BTC активы
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                $252.9B
              </div>
              <div className="text-gray-600 dark:text-slate-400">
                Общие ETH активы
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                $854.6B
              </div>
              <div className="text-gray-600 dark:text-slate-400">
                Суммарные активы
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-20 relative z-10">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Crypto ETFs
            </h3>
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
