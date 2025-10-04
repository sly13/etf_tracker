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

# Устанавливаем все зависимости (включая dev для Prisma)
RUN npm install

# Генерация Prisma Client
RUN npx prisma generate

# Удаляем dev зависимости после генерации
RUN npm prune --production

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Повторно генерируем Prisma Client после сборки
RUN npx prisma generate

# Открываем порт
EXPOSE 3088

# Запускаем NestJS приложение
CMD ["npm", "run", "start:prod"]
