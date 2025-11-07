# Используем официальный Node.js образ с версией 20
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости для Puppeteer, Canvas и инструменты сборки
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    make \
    g++ \
    python3 \
    py3-pip \
    build-base

# Устанавливаем переменную окружения для Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Настройки npm для более надежной установки при нестабильном интернете
ENV npm_config_fetch_retries=10
ENV npm_config_fetch_retry_mintimeout=10000
ENV npm_config_fetch_retry_maxtimeout=60000
ENV npm_config_fetch_timeout=600000
ENV npm_config_progress=false
ENV npm_config_loglevel=error

# Опция использования быстрого npm registry (раскомментируйте если медленный интернет)
# Для использования: docker build --build-arg USE_NPM_MIRROR=true
ARG USE_NPM_MIRROR=false
RUN if [ "$USE_NPM_MIRROR" = "true" ]; then \
        npm config set registry https://registry.npmmirror.com; \
    fi

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости с кэшированием npm через BuildKit
# Используем retry логику на уровне shell для надежности
# Кэшируем только npm cache, node_modules будет в образе
RUN --mount=type=cache,target=/root/.npm \
    (npm ci --prefer-offline --no-audit --maxsockets=1 --progress=false --loglevel=error || \
     (sleep 5 && npm ci --prefer-offline --no-audit --maxsockets=1 --progress=false --loglevel=error) || \
     (sleep 10 && npm ci --prefer-offline --no-audit --maxsockets=1 --progress=false --loglevel=error))

# Копируем исходный код
COPY . .

# Генерируем Prisma клиент
RUN npx prisma generate

# Собираем приложение
RUN npm run build

# Делаем скрипт запуска исполняемым
RUN chmod +x start.sh

# Открываем порт
EXPOSE 3000

# Запускаем приложение через скрипт
CMD ["./start.sh"]
