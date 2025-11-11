import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ETF Tracker - Отслеживание ETF фондов и инвестиций",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
