# 🎛️ Примеры конфигураций для разных приложений

## 📱 ETF Flow Tracker (`etf.flow`)

```json
{
  "enableETFUpdates": true,
  "enableSignificantFlow": true,
  "minFlowThreshold": 0.1,
  "significantChangePercent": 20.0,
  "enableBitcoinUpdates": true,
  "enableEthereumUpdates": true,
  "enableGrayscaleUpdates": true,
  "enableBlackrockUpdates": true,
  "enableFidelityUpdates": true,
  "enableBitwiseUpdates": true,
  "enableTwentyOneSharesUpdates": true,
  "enableVanEckUpdates": true,
  "enableInvescoUpdates": true,
  "enableFranklinUpdates": true,
  "flowAlertThreshold": 1000000,
  "dailySummaryEnabled": true,
  "weeklyReportEnabled": true
}
```

## 💰 Crypto Tracker (`crypto.tracker`)

```json
{
  "enablePriceAlerts": true,
  "enableVolumeAlerts": true,
  "enableNewsAlerts": true,
  "priceChangeThreshold": 5.0,
  "volumeChangeThreshold": 50.0,
  "trackedCoins": ["BTC", "ETH", "SOL", "ADA", "DOT", "MATIC"],
  "alertFrequency": "hourly",
  "enableTechnicalAnalysis": true,
  "enableMarketCapAlerts": true,
  "marketCapThreshold": 1000000000,
  "enableFearGreedIndex": true,
  "enableSocialSentiment": true,
  "enableExchangeAlerts": true,
  "exchanges": ["binance", "coinbase", "kraken"],
  "enableDefiAlerts": true,
  "defiProtocols": ["uniswap", "aave", "compound"]
}
```

## 📊 Portfolio Manager (`portfolio.manager`)

```json
{
  "enablePortfolioUpdates": true,
  "enableRebalancingAlerts": true,
  "enablePerformanceAlerts": true,
  "portfolioChangeThreshold": 10.0,
  "rebalancingThreshold": 5.0,
  "performanceThreshold": 15.0,
  "enableTaxAlerts": true,
  "enableDividendAlerts": true,
  "enableEarningsAlerts": true,
  "enableSectorAlerts": true,
  "enableRiskAlerts": true,
  "riskThreshold": 0.8,
  "enableCorrelationAlerts": true,
  "correlationThreshold": 0.7,
  "enableVolatilityAlerts": true,
  "volatilityThreshold": 0.3,
  "enableDrawdownAlerts": true,
  "drawdownThreshold": 0.1,
  "enableSharpeRatioAlerts": true,
  "sharpeRatioThreshold": 1.0
}
```

## 📰 News Tracker (`news.tracker`)

```json
{
  "enableBreakingNews": true,
  "enableMarketNews": true,
  "enableCompanyNews": true,
  "newsCategories": ["crypto", "stocks", "etf", "bonds", "commodities"],
  "newsSources": ["coindesk", "cointelegraph", "bloomberg", "reuters", "wsj"],
  "newsFrequency": "realtime",
  "enableSentimentAnalysis": true,
  "enableKeywordAlerts": true,
  "keywords": ["bitcoin", "ethereum", "tesla", "apple", "google"],
  "enableSectorNews": true,
  "sectors": ["technology", "finance", "healthcare", "energy"],
  "enableGeographicNews": true,
  "regions": ["US", "EU", "Asia", "Latin America"],
  "enableRegulatoryNews": true,
  "enableEarningsNews": true,
  "enableIPOAlerts": true
}
```

## 🏦 Banking App (`banking.app`)

```json
{
  "enableTransactionAlerts": true,
  "enableBalanceAlerts": true,
  "enablePaymentAlerts": true,
  "enableFraudAlerts": true,
  "enableCreditAlerts": true,
  "enableLoanAlerts": true,
  "enableInvestmentAlerts": true,
  "transactionThreshold": 1000,
  "balanceThreshold": 100,
  "enableBillReminders": true,
  "enableSavingsGoals": true,
  "enableBudgetAlerts": true,
  "budgetThreshold": 0.8,
  "enableInterestRateAlerts": true,
  "enableCurrencyAlerts": true,
  "currencies": ["USD", "EUR", "GBP", "JPY"],
  "enableTaxAlerts": true,
  "enableInsuranceAlerts": true
}
```

## 🏠 Real Estate (`realestate.app`)

```json
{
  "enablePropertyAlerts": true,
  "enablePriceAlerts": true,
  "enableMarketAlerts": true,
  "enableRentalAlerts": true,
  "enableMortgageAlerts": true,
  "priceChangeThreshold": 5.0,
  "enableLocationAlerts": true,
  "locations": ["Manhattan", "Brooklyn", "Queens", "Bronx"],
  "enablePropertyTypeAlerts": true,
  "propertyTypes": ["apartment", "house", "condo", "townhouse"],
  "enableAmenityAlerts": true,
  "amenities": ["pool", "gym", "parking", "balcony"],
  "enableSchoolDistrictAlerts": true,
  "enableTransportationAlerts": true,
  "enableCrimeAlerts": true,
  "enableDevelopmentAlerts": true
}
```

## 🚗 Car Tracker (`car.tracker`)

```json
{
  "enableMaintenanceAlerts": true,
  "enableFuelAlerts": true,
  "enableInsuranceAlerts": true,
  "enableRegistrationAlerts": true,
  "enableInspectionAlerts": true,
  "enableRecallAlerts": true,
  "enableWarrantyAlerts": true,
  "enableServiceAlerts": true,
  "maintenanceIntervals": {
    "oilChange": 5000,
    "tireRotation": 10000,
    "brakeInspection": 20000,
    "airFilter": 15000
  },
  "enableLocationTracking": true,
  "enableSpeedAlerts": true,
  "speedThreshold": 80,
  "enableGeofenceAlerts": true,
  "enableParkingAlerts": true,
  "enableTheftAlerts": true
}
```

## 🎯 Универсальные настройки (для всех приложений)

```json
{
  "enableTestNotifications": false,
  "enableTelegramNotifications": false,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00",
  "timezone": "Europe/Moscow",
  "language": "ru",
  "notificationSound": "default",
  "notificationVibration": true,
  "enableBadgeCount": true,
  "enablePreview": true,
  "enableGrouping": true,
  "enableSnooze": true,
  "snoozeDuration": 15,
  "enablePriorityMode": false,
  "enableDoNotDisturb": false
}
