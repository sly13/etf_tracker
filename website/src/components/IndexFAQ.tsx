"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';

interface IndexFAQProps {
  indexType: "btc" | "eth" | "sol" | "composite";
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function IndexFAQ({ indexType }: IndexFAQProps) {
  const t = useTranslations('faq');
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
        return "cryptocurrency assets";
      default:
        return "cryptocurrencies";
    }
  };

  const indexName = getIndexName();
  const assetName = getAssetName();

  const faqItems: FAQItem[] = [
    {
      question: t('questions.whatIs', { indexName }),
      answer: t('answers.whatIs', { indexName, assetName }),
    },
    {
      question: t('questions.howInterpret', { indexName }),
      answer: t('answers.howInterpret', { indexName }),
    },
    {
      question: t('questions.howOften', { indexName }),
      answer: t('answers.howOften', { indexName }),
    },
    {
      question: t('questions.difference', { indexName }),
      answer: t('answers.difference', { indexName, assetName }),
    },
    {
      question: t('questions.howUse', { indexName }),
      answer: t('answers.howUse', { indexName }),
    },
    {
      question: t('questions.whichFunds', { indexName }),
      answer: t('answers.whichFunds', { indexName, assetName }),
    },
    {
      question: t('questions.composite'),
      answer: t('answers.composite'),
    },
    {
      question: t('questions.forecast', { indexName, assetName }),
      answer: t('answers.forecast', { indexName, assetName }),
    },
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">
        {t('title', { indexName })}
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

