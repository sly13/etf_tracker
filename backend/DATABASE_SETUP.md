# 🗄️ Настройка базы данных ETF Flow

Это руководство поможет настроить базу данных PostgreSQL для приложения ETF Flow.

## 📋 Требования

- PostgreSQL 12+ установлен и запущен
- Node.js 18+ и npm
- Права администратора PostgreSQL

## 🚀 Быстрая настройка

### 1. Создание базы данных

```bash
# Сделайте скрипт исполняемым
chmod +x setup-database.sh

# Запустите скрипт настройки
./setup-database.sh
```

### 2. Создание файла .env

Создайте файл `.env` в папке `backend`:

```env
DATABASE_URL="postgresql://etf_user:etf_password@localhost:5432/etf_flow_db?schema=public"
PORT=3000
NODE_ENV=development
```

### 3. Применение миграций

```bash
# Сделайте скрипт исполняемым
chmod +x apply-migrations.sh

# Запустите миграции
./apply-migrations.sh
```

## 🔧 Ручная настройка

### 1. Создание базы данных

```sql
-- Подключитесь к PostgreSQL как администратор
psql -U postgres

-- Создайте базу данных
CREATE DATABASE etf_flow_db;

-- Создайте пользователя
CREATE USER etf_user WITH PASSWORD 'etf_password';

-- Дайте права пользователю
GRANT ALL PRIVILEGES ON DATABASE etf_flow_db TO etf_user;
GRANT ALL ON SCHEMA public TO etf_user;

-- Выйдите из psql
\q
```

### 2. Применение миграций через Prisma

```bash
# Проверьте подключение
npx prisma db pull

# Создайте и примените миграции
npx prisma migrate dev --name init_etf_flow_tables

# Сгенерируйте Prisma Client
npx prisma generate
```

## 📊 Структура базы данных

### Таблица ETFFlow (Ethereum ETF)

- `id` - уникальный идентификатор
- `date` - дата данных (уникальное поле)
- `blackrock` - поток Blackrock ETF
- `fidelity` - поток Fidelity ETF
- `bitwise` - поток Bitwise ETF
- `twentyOneShares` - поток 21 Shares ETF
- `vanEck` - поток VanEck ETF
- `invesco` - поток Invesco ETF
- `franklin` - поток Franklin ETF
- `grayscale` - поток Grayscale ETF
- `grayscaleEth` - поток Grayscale ETH ETF
- `total` - общий дневной поток
- `createdAt` - время создания записи
- `updatedAt` - время последнего обновления

### Таблица BTCFlow (Bitcoin ETF)

- Аналогичная структура, но с полем `grayscaleBtc` вместо `grayscaleEth`

## 🔍 Проверка настройки

### 1. Проверка подключения

```bash
npx prisma db pull
```

### 2. Проверка таблиц

```bash
npx prisma studio
```

### 3. Тестовый запрос

```bash
# Запустите приложение
npm run start:dev

# Проверьте API
curl http://localhost:3000/etf-flow
```

## 🚨 Устранение проблем

### Ошибка подключения

- Проверьте, что PostgreSQL запущен
- Проверьте настройки в файле .env
- Убедитесь, что пользователь имеет права доступа

### Ошибка миграций

- Убедитесь, что база данных существует
- Проверьте права пользователя
- Попробуйте сбросить миграции: `npx prisma migrate reset`

### Ошибка Prisma Client

- Перегенерируйте клиент: `npx prisma generate`
- Перезапустите приложение

## 📝 Полезные команды

```bash
# Просмотр статуса миграций
npx prisma migrate status

# Сброс базы данных (осторожно!)
npx prisma migrate reset

# Просмотр схемы базы данных
npx prisma db pull

# Открытие Prisma Studio
npx prisma studio

# Проверка подключения
npx prisma db execute --stdin
```

## 🎯 Следующие шаги

После успешной настройки базы данных:

1. **Запустите приложение**: `npm run start:dev`
2. **Проверьте API endpoints**:
   - `GET /etf-flow` - получить данные Ethereum ETF
   - `POST /etf-flow/parse` - запустить парсинг
   - `GET /etf-flow/status` - статус последнего парсинга
3. **Настройте cron jobs** для автоматического парсинга
4. **Мониторьте логи** для отслеживания процесса парсинга

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи приложения
2. Проверьте логи PostgreSQL
3. Убедитесь, что все зависимости установлены
4. Проверьте версии Node.js и PostgreSQL
