# Dockerfile для Next.js приложения
FROM node:20-alpine AS base

# Установка зависимостей только когда нужно
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Установка зависимостей на основе предпочитаемого менеджера пакетов
COPY package.json package-lock.json* ./
RUN npm ci

# Пересборка исходного кода только когда нужно
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Сборка приложения
RUN npm run build

# Продакшн образ, скопируйте все файлы и запустите next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Автоматически используйте output traces для уменьшения размера образа
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

