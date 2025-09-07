# 🎯 Упрощенное решение: JSON поле для всех настроек

## 📋 Принцип работы

**Одно JSON поле `settings`** в таблице `User` содержит ВСЕ настройки приложения.

### ✅ Преимущества:

- **Универсальность**: Любое приложение может хранить любые настройки
- **Простота**: Одно поле вместо множества колонок
- **Гибкость**: Легко добавлять новые настройки без миграций
- **Производительность**: JSON индексы для быстрого поиска

## 🔧 API Примеры

### **ETF Flow Tracker (etf.flow)**

```json
{
  "enableETFUpdates": true,
  "enableSignificantFlow": true,
  "minFlowThreshold": 0.1,
  "significantChangePercent": 20.0,
  "enableBitcoinUpdates": true,
  "enableEthereumUpdates": true,
  "enableGrayscaleUpdates": true
}
```

### **Crypto Tracker (crypto.tracker)**

```json
{
  "enablePriceAlerts": true,
  "enableVolumeAlerts": true,
  "priceChangeThreshold": 5.0,
  "trackedCoins": ["BTC", "ETH", "SOL"],
  "alertFrequency": "hourly"
}
```

### **Portfolio Manager (portfolio.manager)**

```json
{
  "enablePortfolioUpdates": true,
  "enableRebalancingAlerts": true,
  "portfolioChangeThreshold": 10.0,
  "enableTaxAlerts": true
}
```

## 🚀 Использование

### **Получение настройки:**

```http
GET /settings/user/{userId}/enableETFUpdates
```

### **Обновление настройки:**

```http
PUT /settings/user/{userId}/enableETFUpdates
{
  "value": true
}
```

### **Получение всех настроек:**

```http
GET /settings/user/{userId}
```

### **Обновление всех настроек:**

```http
PUT /settings/user/{userId}
{
  "enableETFUpdates": true,
  "minFlowThreshold": 0.5,
  "trackedCoins": ["BTC", "ETH"]
}
```

### **Поиск пользователей с настройкой:**

```http
GET /settings/users-with-setting?appName=etf.flow&settingKey=enableETFUpdates&settingValue=true
```

## 💡 Примеры для разных приложений

### **Banking App:**

```json
{
  "enableTransactionAlerts": true,
  "transactionThreshold": 1000,
  "enableFraudAlerts": true,
  "enableBillReminders": true
}
```

### **Real Estate App:**

```json
{
  "enablePropertyAlerts": true,
  "priceChangeThreshold": 5.0,
  "locations": ["Manhattan", "Brooklyn"],
  "propertyTypes": ["apartment", "house"]
}
```

### **Car Tracker:**

```json
{
  "enableMaintenanceAlerts": true,
  "maintenanceIntervals": {
    "oilChange": 5000,
    "tireRotation": 10000
  },
  "enableLocationTracking": true
}
```

## 🎯 Результат

**Одно поле `settings` JSON** решает все проблемы:

- ✅ Любое приложение может хранить любые настройки
- ✅ Не нужно создавать отдельные таблицы
- ✅ Легко добавлять новые настройки
- ✅ Быстрый поиск через JSON индексы
- ✅ Простой API для работы с настройками
