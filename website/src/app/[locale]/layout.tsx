import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import ThemeProviderWrapper from "../../components/ThemeProviderWrapper";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';

export const runtime = 'edge';

const ibmPlexMono = localFont({
  src: [
    {
      path: "../fonts/IBMPlexMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/IBMPlexMono-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/IBMPlexMono-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/IBMPlexMono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crypto ETFs - Отслеживание ETF фондов и инвестиций",
  description:
    "Профессиональная платформа для отслеживания ETF фондов, анализа инвестиций и управления портфелем. Получайте актуальную информацию о рынке и принимайте обоснованные инвестиционные решения.",
  keywords: [
    "ETF",
    "фонды",
    "инвестиции",
    "трекинг",
    "портфель",
    "анализ",
    "финансы",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    // Если тема не сохранена, используем светлую по умолчанию
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${ibmPlexMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProviderWrapper>
            {children}
          </ThemeProviderWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

