// Новая универсальная схема для настроек приложений

model Application {
  id          String   @id @default(cuid())
  name        String   @unique // например "etf.flow"
  displayName String   // например "ETF Flow Tracker"
  description String?  // описание приложения
  isActive    Boolean  @default(true)
  
  // Конфигурация настроек по умолчанию для приложения
  defaultSettings Json? // JSON с настройками по умолчанию
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Связи
  users       User[]
}

model User {
  id                    String   @id @default(cuid())
  applicationId         String
  userId                String?  @unique
  deviceId              String?  @unique
  deviceToken           String   @unique
  telegramChatId        String?  @unique
  
  // Информация о пользователе
  firstName             String?
  lastName              String?
  email                 String?
  phone                 String?
  
  // Информация об устройстве
  deviceType            String?
  appVersion            String?
  osVersion             String?
  language              String?
  timezone              String?
  deviceName            String?
  
  // УНИВЕРСАЛЬНЫЕ настройки (для всех приложений)
  enableTestNotifications Boolean @default(false)
  enableTelegramNotifications Boolean @default(false)
  quietHoursStart       String?
  quietHoursEnd         String?
  
  // СПЕЦИФИЧНЫЕ настройки приложения (JSON)
  appSpecificSettings   Json?    // Гибкие настройки для конкретного приложения
  
  // Метаданные
  isValid               Boolean  @default(true)
  isActive              Boolean  @default(true)
  lastUsed              DateTime @default(now())
  lastNotificationSent  DateTime?
  notificationCount     Int      @default(0)
  telegramLinkedAt      DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  // Связи
  application           Application @relation(fields: [applicationId], references: [id])
}

// Примеры конфигураций для разных приложений:

// ETF Flow Tracker (etf.flow)
{
  "enableETFUpdates": true,
  "enableSignificantFlow": true,
  "minFlowThreshold": 0.1,
  "significantChangePercent": 20.0,
  "enableBitcoinUpdates": true,
  "enableEthereumUpdates": true,
  "enableGrayscaleUpdates": true
}

// Crypto Tracker (crypto.tracker)
{
  "enablePriceAlerts": true,
  "enableVolumeAlerts": true,
  "enableNewsAlerts": true,
  "priceChangeThreshold": 5.0,
  "volumeChangeThreshold": 50.0,
  "trackedCoins": ["BTC", "ETH", "SOL"],
  "alertFrequency": "hourly"
}

// Portfolio Manager (portfolio.manager)
{
  "enablePortfolioUpdates": true,
  "enableRebalancingAlerts": true,
  "enablePerformanceAlerts": true,
  "portfolioChangeThreshold": 10.0,
  "rebalancingThreshold": 5.0,
  "performanceThreshold": 15.0,
  "enableTaxAlerts": true
}

// News Tracker (news.tracker)
{
  "enableBreakingNews": true,
  "enableMarketNews": true,
  "enableCompanyNews": true,
  "newsCategories": ["crypto", "stocks", "etf"],
  "newsSources": ["coindesk", "cointelegraph", "bloomberg"],
  "newsFrequency": "realtime"
}
