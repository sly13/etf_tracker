FROM node:18-slim

# Устанавливаем OpenSSL для Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем package.json
COPY package.json ./

# Копируем Prisma схему
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm install --omit=dev

# Генерация Prisma Client
RUN npx prisma generate

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 3088

# Запускаем приложение
CMD ["node", "index.js"]
