"use client";

import { useParams } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '../../../../i18n/routing';
import IndexChart from "../../../../components/IndexChart";
import HistoricalValues from "../../../../components/HistoricalValues";
import CurrentIndexValue from "../../../../components/CurrentIndexValue";
import IndexFAQ from "../../../../components/IndexFAQ";
import Navigation from "../../../../components/Navigation";

const indexTitles: Record<string, Record<string, string>> = {
  en: {
    btc: "CEFI-BTC Index Chart",
    eth: "CEFI-ETH Index Chart",
    sol: "CEFI-SOL Index Chart",
    composite: "CEFI-Composite Index Chart",
  },
  ru: {
    btc: "CEFI-BTC Index Chart",
    eth: "CEFI-ETH Index Chart",
    sol: "CEFI-SOL Index Chart",
    composite: "CEFI-Composite Index Chart",
  },
};

export default function IndexPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('indices');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const indexType = params.indexType as string;

  if (!["btc", "eth", "sol", "composite"].includes(indexType)) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <Navigation />
        <main className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <p className="text-red-600 dark:text-red-400">{t('invalidType')}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {t('backToHome')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const title = indexTitles[locale]?.[indexType] || indexTitles.en[indexType] || "Index Chart";

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navigation />
      <main className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {tCommon('back')}
          </button>
        </div>
        
        {/* Текущее значение индекса (gauge) - сверху */}
        <div className="mb-6">
          <CurrentIndexValue
            indexType={indexType as "btc" | "eth" | "sol" | "composite"}
          />
        </div>
        
        {/* Historical Values и Yearly High and Low - снизу */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <HistoricalValues
            indexType={indexType as "btc" | "eth" | "sol" | "composite"}
          />
        </div>
        
        {/* График отдельно внизу */}
        <IndexChart
          indexType={indexType as "btc" | "eth" | "sol" | "composite"}
          title={title}
        />
        
        {/* FAQ блок */}
        <IndexFAQ
          indexType={indexType as "btc" | "eth" | "sol" | "composite"}
        />
      </main>
    </div>
  );
}

