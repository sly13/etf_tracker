import ETFSummaryCard from "../components/ETFSummaryCard";
import FundHoldingsCard from "../components/FundHoldingsCard";
import LatestNewsCard from "../components/LatestNewsCard";
import CEFIIndexCard from "../components/CEFIIndexCard";
import Navigation from "../components/Navigation";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Отслеживание ETF фондов
            <span className="block text-blue-600 dark:text-blue-400 mt-2">
              в реальном времени
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Профессиональная платформа для анализа потоков капитала в криптовалютные ETF
          </p>
        </div>

        {/* Latest News Section */}
        <LatestNewsCard />

        {/* CEFI Index Section */}
        <CEFIIndexCard />

        {/* ETF Summary Section */}
        <ETFSummaryCard />

        {/* Fund Holdings Section */}
        <FundHoldingsCard />

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100 mb-12">
            Почему выбирают Crypto ETFs?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Анализ в реальном времени
              </h3>
              <p className="text-slate-700 dark:text-slate-400">
                Получайте актуальные данные о ETF фондах и их динамике с
                задержкой менее минуты.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
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
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Управление портфелем
              </h3>
              <p className="text-slate-700 dark:text-slate-400">
                Создавайте и отслеживайте свои инвестиционные портфели с
                детальной аналитикой.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Надежность и безопасность
              </h3>
              <p className="text-slate-700 dark:text-slate-400">
                Ваши данные защищены современными методами шифрования и
                безопасного хранения.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Готовы начать инвестировать?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Присоединяйтесь к тысячам инвесторов, которые уже используют ETF
            Tracker для управления своими портфелями.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
            Связаться с нами
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Crypto ETFs</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Профессиональная платформа для отслеживания ETF фондов и
              управления инвестициями.
            </p>
            <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 text-center text-slate-600 dark:text-slate-400">
              <p>&copy; 2024 Crypto ETFs. Все права защищены.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
