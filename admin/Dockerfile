# Используем официальный Node.js образ с версией 20
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --omit=dev \
  && npm install -g serve

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Открываем порт
EXPOSE 3065

# Запускаем prod-сервер статики
CMD ["serve", "-s", "build", "-l", "3065"]
