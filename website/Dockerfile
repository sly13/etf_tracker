# Используем официальный Node.js образ с версией 20
FROM node:20-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Настройки npm для более надежной установки при нестабильном интернете
ENV npm_config_fetch_retries=10
ENV npm_config_fetch_retry_mintimeout=10000
ENV npm_config_fetch_retry_maxtimeout=60000
ENV npm_config_fetch_timeout=600000
ENV npm_config_progress=false
ENV npm_config_loglevel=error

# Опция использования быстрого npm registry
ARG USE_NPM_MIRROR=false
RUN if [ "$USE_NPM_MIRROR" = "true" ]; then \
        npm config set registry https://registry.npmmirror.com; \
    fi

# Устанавливаем зависимости только если нужно
FROM base AS deps
# Копируем package.json и package-lock.json
COPY package*.json ./
# Устанавливаем зависимости с кэшированием npm через BuildKit
RUN --mount=type=cache,target=/root/.npm \
    (npm ci --prefer-offline --no-audit --maxsockets=1 --progress=false --loglevel=error || \
     (sleep 5 && npm ci --prefer-offline --no-audit --maxsockets=1 --progress=false --loglevel=error) || \
     (sleep 10 && npm ci --prefer-offline --no-audit --maxsockets=1 --progress=false --loglevel=error))

# Собираем приложение
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Принимаем build args для переменных окружения Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_HOST
ARG NEXT_PUBLIC_API_PORT
ARG NEXT_PUBLIC_API_PROTOCOL
ARG NEXT_PUBLIC_API_TIMEOUT

# Преобразуем ARG в ENV для использования во время сборки
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_HOST=${NEXT_PUBLIC_API_HOST}
ENV NEXT_PUBLIC_API_PORT=${NEXT_PUBLIC_API_PORT}
ENV NEXT_PUBLIC_API_PROTOCOL=${NEXT_PUBLIC_API_PROTOCOL}
ENV NEXT_PUBLIC_API_TIMEOUT=${NEXT_PUBLIC_API_TIMEOUT}

# Отключаем telemetry во время сборки
ENV NEXT_TELEMETRY_DISABLED=1

# Собираем приложение
RUN npm run build

# Production образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем только необходимые файлы из standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
