#!/bin/bash

echo "🚀 Настройка пуш-уведомлений для ETF Tracker..."

# Установка зависимостей Flutter
echo "📱 Установка зависимостей Flutter..."
cd app
flutter pub get

# Установка зависимостей Backend
echo "🔧 Установка зависимостей Backend..."
cd ../backend
npm install

# Миграция базы данных
echo "🗄️ Выполнение миграции базы данных..."
npx prisma migrate dev --name add-fcm-tokens
npx prisma generate

echo "✅ Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Настройте Firebase проект согласно FIREBASE_SETUP.md"
echo "2. Добавьте google-services.json и GoogleService-Info.plist"
echo "3. Обновите firebase_options.dart с реальными ключами"
echo "4. Запустите приложение: flutter run"
echo "5. Запустите бэкэнд: npm run start:dev"
echo ""
echo "🧪 Для тестирования:"
echo "- Откройте приложение"
echo "- Перейдите в Настройки → Настройки уведомлений"
echo "- Включите уведомления и нажмите 'Тест'"
echo "- Или отправьте POST запрос на /notifications/test"
