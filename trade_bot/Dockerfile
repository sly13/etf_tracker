# Используем официальный Node.js образ с версией 20
FROM node:20-alpine

# Устанавливаем OpenSSL для Prisma
RUN apk add --no-cache openssl

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Копируем Prisma схему
COPY prisma ./prisma/

# Копируем исходный код
COPY . .

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm install

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
