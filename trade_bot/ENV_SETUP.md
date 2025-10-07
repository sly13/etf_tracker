# Trade Bot NestJS .env Configuration

Создайте файл `trade_bot_nest/.env` со следующим содержимым:

```bash
# Database Configuration
DATABASE_URL="postgresql://etf_user:etf_password@postgres:5432/etf_tracker?schema=public"

# OKX API Configuration
OKX_API_KEY="your_api_key_here"
OKX_SECRET_KEY="your_secret_key_here"
OKX_PASSPHRASE="your_passphrase_here"
OKX_SANDBOX=false

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
```

## Получение OKX API ключей:

1. Зайдите на [OKX](https://www.okx.com)
2. Перейдите в API Management
3. Создайте новый API ключ
4. Скопируйте API Key, Secret Key и Passphrase
5. Вставьте их в файл `.env`

## Важные замечания:

- **DATABASE_URL** - используйте правильный хост для Docker (`postgres` вместо `localhost`)
- **OKX_SANDBOX** - установите `true` для тестирования
- **MIN_FLOW_THRESHOLD** - минимальное значение flow для открытия позиций
- **CHECK_INTERVAL** - интервал проверки в миллисекундах (60000 = 1 минута)