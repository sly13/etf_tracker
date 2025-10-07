#!/bin/bash

echo "🔧 Создание .env файлов для локальной разработки..."

# Создаем .env для backend
if [ ! -f "backend/.env" ]; then
    echo "📝 Создание backend/.env..."
    cat > backend/.env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://etf_user:etf_password@postgres:5432/etf_tracker?schema=public"

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET="dev_jwt_secret_change_in_production"
JWT_EXPIRES_IN="24h"

# Firebase Configuration (если нужно)
FIREBASE_SERVICE_ACCOUNT_PATH="/app/etf-flow-firebase.json"

# Telegram Bot Configuration (если нужно)
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
EOF
    echo "✅ backend/.env создан"
else
    echo "⚠️  backend/.env уже существует"
fi

# Создаем .env для trade_bot_nest
if [ ! -f "trade_bot_nest/.env" ]; then
    echo "📝 Создание trade_bot_nest/.env..."
    cat > trade_bot_nest/.env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://etf_user:etf_password@postgres:5432/etf_tracker?schema=public"

# OKX API Configuration
OKX_API_KEY="your_api_key_here"
OKX_SECRET_KEY="your_secret_key_here"
OKX_PASSPHRASE="your_passphrase_here"
OKX_SANDBOX=true

# Server Configuration
PORT=3088
NODE_ENV=development
CORS_ORIGIN=http://localhost:3089,http://localhost:3000

# Trading Configuration
MIN_FLOW_THRESHOLD=1000000
MAX_POSITION_SIZE=1000
CHECK_INTERVAL=60000

# Timezone
TZ=Europe/Moscow
EOF
    echo "✅ trade_bot_nest/.env создан"
else
    echo "⚠️  trade_bot_nest/.env уже существует"
fi

echo ""
echo "🎉 Готово! Теперь можно запускать локально:"
echo ""
echo "🚀 Для разработки:"
echo "   docker-compose -f docker-compose.dev.yml up -d"
echo ""
echo "📖 Или базовый файл:"
echo "   docker-compose up -d"
echo ""
echo "⚠️  НЕ ЗАБУДЬТЕ:"
echo "   1. Получить OKX API ключи и вставить в trade_bot_nest/.env"
echo "   2. Настроить JWT_SECRET в backend/.env"
echo "   3. Добавить Telegram Bot Token если нужно"
