import Navigation from "../../components/Navigation";

export default function BlogPage() {
  const articles = [
    {
      id: 1,
      title:
        "Анализ потоков Bitcoin ETF: что показывают данные за последний месяц",
      excerpt:
        "Подробный анализ движения средств в Bitcoin ETF фондах и их влияние на рынок криптовалют.",
      date: "15 января 2024",
      category: "Анализ",
      readTime: "5 мин",
      image: "/images/bitcoin.png",
    },
    {
      id: 2,
      title: "Ethereum ETF: перспективы и прогнозы на 2024 год",
      excerpt:
        "Обзор ситуации с Ethereum ETF и прогнозы развития рынка в ближайшие месяцы.",
      date: "12 января 2024",
      category: "Прогнозы",
      readTime: "7 мин",
      image: "/images/ethereum.png",
    },
    {
      id: 3,
      title: "Как правильно диверсифицировать портфель с помощью ETF",
      excerpt:
        "Практические советы по созданию сбалансированного инвестиционного портфеля.",
      date: "10 января 2024",
      category: "Обучение",
      readTime: "8 мин",
      image: "/images/long.png",
    },
    {
      id: 4,
      title: "Топ-5 ошибок начинающих инвесторов в ETF",
      excerpt:
        "Разбираем основные ошибки, которые совершают новички при инвестировании в ETF фонды.",
      date: "8 января 2024",
      category: "Обучение",
      readTime: "6 мин",
      image: "/images/short.png",
    },
    {
      id: 5,
      title: "Влияние макроэкономических факторов на ETF рынок",
      excerpt:
        "Как инфляция, процентные ставки и другие факторы влияют на стоимость ETF фондов.",
      date: "5 января 2024",
      category: "Анализ",
      readTime: "9 мин",
      image: "/images/bitcoin.png",
    },
    {
      id: 6,
      title: "Сравнение комиссий различных ETF провайдеров",
      excerpt:
        "Детальное сравнение комиссий и условий различных провайдеров ETF фондов.",
      date: "3 января 2024",
      category: "Сравнение",
      readTime: "4 мин",
      image: "/images/ethereum.png",
    },
  ];

  const categories = ["Все", "Анализ", "Прогнозы", "Обучение", "Сравнение"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Блог ETF Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Экспертные статьи, аналитика и советы по инвестированию в ETF фонды.
            Будьте в курсе последних тенденций рынка.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                category === "Все"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl">📊</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {article.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{article.date}</span>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Читать далее →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Загрузить еще статьи
          </button>
        </div>

        {/* Newsletter */}
        <div className="mt-20 bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Подпишитесь на рассылку
          </h2>
          <p className="text-gray-600 mb-6">
            Получайте новые статьи и аналитику прямо на почту
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Ваш email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Подписаться
            </button>
          </div>
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
