import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts');

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@next/font"],
  },
  images: {
    formats: ["image/webp", "image/avif"],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

export default withNextIntl(nextConfig);
