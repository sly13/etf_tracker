import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts');

const nextConfig: NextConfig = {
  // Убираем standalone для Cloudflare Pages
  // output: "standalone",
  experimental: {
    optimizePackageImports: [
      "@next/font",
      "@mui/material",
      "@mui/icons-material",
      "@mui/system",
      "@emotion/react",
      "@emotion/styled",
      "recharts",
      "react-select",
    ],
  },
  images: {
    formats: ["image/webp", "image/avif"],
    unoptimized: true, // Cloudflare Pages не поддерживает оптимизацию изображений Next.js
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

export default withNextIntl(nextConfig);
