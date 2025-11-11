import ETFSummaryCard from "../components/ETFSummaryCard";
import FundHoldingsCard from "../components/FundHoldingsCard";
import LatestNewsCard from "../components/LatestNewsCard";
import CEFIIndexCard from "../components/CEFIIndexCard";
import Navigation from "../components/Navigation";
import MoneyRain from "../components/MoneyRain";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Money Rain Animation */}
      <MoneyRain />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
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
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Почему выбирают ETF Tracker?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Анализ в реальном времени
              </h3>
              <p className="text-gray-600">
                Получайте актуальные данные о ETF фондах и их динамике с
                задержкой менее минуты.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Управление портфелем
              </h3>
              <p className="text-gray-600">
                Создавайте и отслеживайте свои инвестиционные портфели с
                детальной аналитикой.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Надежность и безопасность
              </h3>
              <p className="text-gray-600">
                Ваши данные защищены современными методами шифрования и
                безопасного хранения.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Готовы начать инвестировать?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Присоединяйтесь к тысячам инвесторов, которые уже используют ETF
            Tracker для управления своими портфелями.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
            Связаться с нами
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
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
