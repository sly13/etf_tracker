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

# Принимаем build args для переменных окружения
ARG REACT_APP_API_URL
ARG NODE_ENV

# Устанавливаем переменные окружения для сборки
# Важно: переменные должны быть установлены до npm run build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=$NODE_ENV

# Проверяем, что переменная установлена (для отладки)
RUN echo "Building with REACT_APP_API_URL=$REACT_APP_API_URL"

# Собираем приложение
RUN npm run build

# Открываем порт
EXPOSE 3065

# Запускаем prod-сервер статики
CMD ["serve", "-s", "build", "-l", "3065"]
