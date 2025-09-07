# 🔧 Исправленный API с учетом приложения

## 📋 Проблема решена

Теперь API учитывает приложение, чтобы настройки не пересекались между разными приложениями.

## 🚀 Новый API

### **Получение настройки пользователя:**

```http
GET /settings/app/{appName}/user/{userId}/{settingKey}
```

**Примеры:**

```http
# ETF Flow Tracker
GET /settings/app/etf.flow/user/user123/enableETFUpdates

# Crypto Tracker
GET /settings/app/crypto.tracker/user/user123/enablePriceAlerts

# Portfolio Manager
GET /settings/app/portfolio.manager/user/user123/enableRebalancingAlerts
```

### **Обновление настройки пользователя:**

```http
PUT /settings/app/{appName}/user/{userId}/{settingKey}
{
  "value": true
}
```

**Примеры:**

```http
# ETF Flow Tracker
PUT /settings/app/etf.flow/user/user123/enableETFUpdates
{
  "value": true
}

# Crypto Tracker
PUT /settings/app/crypto.tracker/user/user123/priceChangeThreshold
{
  "value": 5.0
}
```

### **Получение всех настроек пользователя:**

```http
GET /settings/app/{appName}/user/{userId}
```

**Примеры:**

```http
# ETF Flow Tracker
GET /settings/app/etf.flow/user/user123

# Crypto Tracker
GET /settings/app/crypto.tracker/user/user123
```

### **Обновление всех настроек пользователя:**

```http
PUT /settings/app/{appName}/user/{userId}
{
  "enableETFUpdates": true,
  "minFlowThreshold": 0.5,
  "enableBitcoinUpdates": true
}
```

**Примеры:**

```http
# ETF Flow Tracker
PUT /settings/app/etf.flow/user/user123
{
  "enableETFUpdates": true,
  "enableSignificantFlow": true,
  "minFlowThreshold": 0.1,
  "significantChangePercent": 20.0,
  "enableBitcoinUpdates": true,
  "enableEthereumUpdates": true
}

# Crypto Tracker
PUT /settings/app/crypto.tracker/user/user123
{
  "enablePriceAlerts": true,
  "enableVolumeAlerts": true,
  "priceChangeThreshold": 5.0,
  "trackedCoins": ["BTC", "ETH", "SOL"],
  "alertFrequency": "hourly"
}

# Portfolio Manager
PUT /settings/app/portfolio.manager/user/user123
{
  "enablePortfolioUpdates": true,
  "enableRebalancingAlerts": true,
  "portfolioChangeThreshold": 10.0,
  "enableTaxAlerts": true
}
```

## 🔒 Безопасность

### **Проверка принадлежности пользователя к приложению:**

- ✅ API проверяет, что пользователь принадлежит указанному приложению
- ✅ Если пользователь не принадлежит приложению, возвращается ошибка
- ✅ Настройки разных приложений полностью изолированы

### **Примеры ошибок:**

```json
{
  "success": false,
  "appName": "crypto.tracker",
  "userId": "user123",
  "settingKey": "enableETFUpdates",
  "value": null,
  "message": "Пользователь user123 не принадлежит приложению crypto.tracker"
}
```

## 📱 Примеры для разных приложений

### **ETF Flow Tracker (etf.flow):**

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

### **Crypto Tracker (crypto.tracker):**

```json
{
  "enablePriceAlerts": true,
  "enableVolumeAlerts": true,
  "priceChangeThreshold": 5.0,
  "trackedCoins": ["BTC", "ETH", "SOL"],
  "alertFrequency": "hourly"
}
```

### **Portfolio Manager (portfolio.manager):**

```json
{
  "enablePortfolioUpdates": true,
  "enableRebalancingAlerts": true,
  "portfolioChangeThreshold": 10.0,
  "enableTaxAlerts": true
}
```

## 🎯 Результат

- ✅ **Изоляция**: Настройки разных приложений не пересекаются
- ✅ **Безопасность**: Проверка принадлежности пользователя к приложению
- ✅ **Гибкость**: Любое приложение может иметь любые настройки
- ✅ **Простота**: Один JSON поле для всех настроек
- ✅ **Масштабируемость**: Легко добавлять новые приложения
