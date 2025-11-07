# Используем официальный Node.js образ с версией 20
FROM node:20-alpine

# Устанавливаем OpenSSL для Prisma
RUN apk add --no-cache openssl

# Настройки npm для более надежной установки при нестабильном интернете
ENV npm_config_fetch_retries=10
ENV npm_config_fetch_retry_mintimeout=10000
ENV npm_config_fetch_retry_maxtimeout=60000
ENV npm_config_fetch_timeout=600000
ENV npm_config_progress=false
ENV npm_config_loglevel=error

# Опция использования быстрого npm registry (раскомментируйте если медленный интернет)
ARG USE_NPM_MIRROR=false
RUN if [ "$USE_NPM_MIRROR" = "true" ]; then \
        npm config set registry https://registry.npmmirror.com; \
    fi

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Копируем Prisma схему (нужна для генерации клиента)
COPY prisma ./prisma/

# Устанавливаем все зависимости с кэшированием npm через BuildKit
# Используем retry логику на уровне shell для надежности
RUN --mount=type=cache,target=/root/.npm \
    (npm ci --prefer-offline --no-audit --maxsockets=1 --progress=false --loglevel=error || \
     (sleep 5 && npm ci --prefer-offline --no-audit --maxsockets=1 --progress=false --loglevel=error) || \
     (sleep 10 && npm ci --prefer-offline --no-audit --maxsockets=1 --progress=false --loglevel=error))

# Копируем исходный код (после установки зависимостей для лучшего кэширования)
COPY . .

# Генерация Prisma Client
RUN npx prisma generate

# Собираем приложение
RUN npm run build

# Удаляем dev зависимости после сборки
RUN npm prune --production

# Повторно генерируем Prisma Client после сборки
RUN npx prisma generate

# Копируем скрипт запуска
COPY start.sh ./
RUN chmod +x start.sh

# Открываем порт
EXPOSE 3088

# Запускаем приложение через скрипт
CMD ["./start.sh"]
