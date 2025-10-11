# Backend .env Configuration

Создайте файл `backend/.env` со следующим содержимым:

```bash
# Database Configuration
DATABASE_URL="postgresql://etf_user:etf_password@postgres:5432/etf_tracker?schema=public"

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="24h"

# Firebase Configuration (если нужно)
FIREBASE_SERVICE_ACCOUNT_PATH="/app/etf-flow-firebase.json"

# Telegram Bot Configuration (если нужно)
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
```

## Важные замечания:

1. **DATABASE_URL** - используйте правильный хост для Docker (`postgres` вместо `localhost`)
2. **JWT_SECRET** - замените на случайную строку для безопасности
3. **TELEGRAM_BOT_TOKEN** - получите у @BotFather в Telegram
4. **Firebase ключи** - скопируйте из `etf-flow-firebase.json` если нужно
