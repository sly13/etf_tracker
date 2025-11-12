"use client";

import { useState } from "react";

interface IndexFAQProps {
  indexType: "btc" | "eth" | "sol" | "composite";
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function IndexFAQ({ indexType }: IndexFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const getIndexName = (): string => {
    switch (indexType) {
      case "btc":
        return "CEFI-BTC";
      case "eth":
        return "CEFI-ETH";
      case "sol":
        return "CEFI-SOL";
      case "composite":
        return "CEFI-Composite";
      default:
        return "CEFI";
    }
  };

  const getAssetName = (): string => {
    switch (indexType) {
      case "btc":
        return "Bitcoin";
      case "eth":
        return "Ethereum";
      case "sol":
        return "Solana";
      case "composite":
        return "криптовалютных активов";
      default:
        return "криптовалют";
    }
  };

  const indexName = getIndexName();
  const assetName = getAssetName();

  const faqItems: FAQItem[] = [
    {
      question: `Что такое ${indexName} индекс и как он рассчитывается?`,
      answer: `${indexName} индекс (CryptoETF Flows Index) - это индикатор, который отражает направления и интенсивность потоков капитала в спотовые криптовалютные ETF фонды, инвестирующие в ${assetName}. Индекс рассчитывается на основе данных о притоках и оттоках средств из крупнейших ETF фондов, таких как BlackRock, Fidelity, Bitwise и других. Значение индекса варьируется от 0 до 100, где более высокие значения указывают на сильный приток капитала (жадность), а низкие - на отток (страх).`,
    },
    {
      question: `Как интерпретировать значение ${indexName} индекса?`,
      answer: `Значение ${indexName} индекса интерпретируется следующим образом: 0-20 - Extreme Fear (экстремальный страх), 20-40 - Fear (страх), 40-60 - Neutral (нейтрально), 60-80 - Greed (жадность), 80-100 - Extreme Greed (экстремальная жадность). Высокие значения обычно указывают на оптимизм инвесторов и активный приток капитала в ETF фонды, в то время как низкие значения могут сигнализировать о пессимизме и оттоке средств.`,
    },
    {
      question: `Как часто обновляется ${indexName} индекс?`,
      answer: `${indexName} индекс обновляется ежедневно на основе актуальных данных о потоках ETF фондов. Данные собираются из публичных источников и обрабатываются в режиме реального времени, что позволяет инвесторам получать самую свежую информацию о настроениях рынка и направлениях движения капитала в криптовалютные ETF.`,
    },
    {
      question: `Чем ${indexName} индекс отличается от индекса страха и жадности Bitcoin?`,
      answer: `В отличие от традиционного индекса страха и жадности Bitcoin, который основан на волатильности, объемах торгов и социальных сигналах, ${indexName} индекс фокусируется исключительно на реальных потоках капитала в институциональные ETF фонды. Это делает его более точным индикатором настроений крупных инвесторов и институционального капитала, который оказывает значительное влияние на цену ${assetName}.`,
    },
    {
      question: `Как использовать ${indexName} индекс для принятия инвестиционных решений?`,
      answer: `${indexName} индекс может служить дополнительным инструментом для анализа рынка. Экстремальные значения (Extreme Fear или Extreme Greed) могут указывать на потенциальные точки разворота рынка. Однако важно помнить, что индекс не является гарантией будущих движений цены и должен использоваться в сочетании с другими методами технического и фундаментального анализа. Всегда проводите собственное исследование перед принятием инвестиционных решений.`,
    },
    {
      question: `Какие ETF фонды учитываются при расчете ${indexName} индекса?`,
      answer: `При расчете ${indexName} индекса учитываются данные крупнейших спотовых криптовалютных ETF фондов, включая BlackRock (IBIT), Fidelity (FBTC), Bitwise (BITB), ARK 21Shares (ARKB), VanEck (HODL), Invesco (BTCO), Grayscale (GBTC) и другие. Индекс агрегирует потоки капитала из всех этих фондов, что позволяет получить комплексную картину институциональных настроений на рынке ${assetName}.`,
    },
    {
      question: `Что означает составной индекс CEFI-Composite?`,
      answer: `CEFI-Composite индекс представляет собой агрегированный показатель, объединяющий данные о потоках капитала в ETF фонды для Bitcoin, Ethereum и Solana. Этот индекс дает общее представление о настроениях инвесторов на криптовалютном рынке в целом, показывая общее направление движения институционального капитала между различными криптовалютными активами.`,
    },
    {
      question: `Можно ли использовать ${indexName} индекс для прогнозирования цены ${assetName}?`,
      answer: `${indexName} индекс отражает текущие настроения инвесторов и потоки капитала, но не является прямым инструментом прогнозирования цены. Сильный приток капитала в ETF фонды может указывать на растущий интерес к ${assetName}, что потенциально может поддерживать цену, но множество других факторов также влияют на ценовую динамику. Индекс лучше использовать как индикатор текущих настроений рынка, а не как единственный инструмент для прогнозирования.`,
    },
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">
        Часто задаваемые вопросы о {indexName} индексе
      </h2>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="font-semibold text-gray-900 dark:text-slate-100 pr-4">
                {item.question}
              </span>
              <svg
                className={`w-5 h-5 text-gray-500 dark:text-slate-400 flex-shrink-0 transition-transform ${
                  openIndex === index ? "transform rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-600">
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

