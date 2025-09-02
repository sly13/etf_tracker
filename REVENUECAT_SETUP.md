# Настройка RevenueCat для ETF Tracker

## 🚀 **Быстрый старт**

### **1. Регистрация в RevenueCat**

1. Зайдите на [revenuecat.com](https://revenuecat.com)
2. Создайте аккаунт
3. Создайте новый проект "ETF Tracker"

### **2. Получение API ключей**

В Dashboard RevenueCat найдите:

- **iOS API Key:** `appl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Android API Key:** `goog_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **3. Обновление ключей в коде**

Замените в `app/lib/services/subscription_service.dart`:

```dart
static const String _iosApiKey = 'ВАШ_IOS_КЛЮЧ';
static const String _androidApiKey = 'ВАШ_ANDROID_КЛЮЧ';
```

## 📱 **Настройка App Store Connect**

### **1. Создание продуктов**

В App Store Connect создайте In-App Purchases:

#### **iOS продукты:**

- **ID:** `MONTHLY_ETF_FLOW_PLAN`
- **Тип:** Auto-Renewable Subscription
- **Цена:** $4.99/месяц
- **Описание:** Ежемесячная подписка на расширенную аналитику ETF потоков

- **ID:** `YEARLY_ETF_FLOW_PLAN`
- **Тип:** Auto-Renewable Subscription
- **Цена:** $49.9/год
- **Описание:** Годовая подписка на расширенную аналитику ETF потоков

- **ID:** `basic_monthly`
- **Тип:** Auto-Renewable Subscription
- **Цена:** $2.99/месяц
- **Описание:** Базовая подписка на месяц

### **2. Настройка групп подписок**

Создайте группу подписок "ETF_Tracker_Premium" и добавьте все продукты.

## 🎯 **Настройка RevenueCat Dashboard**

### **1. Создание Entitlements**

Создайте entitlement `premium`:

- **Display Name:** Premium Access
- **Description:** Доступ к премиум функциям

### **2. Настройка продуктов**

Свяжите продукты с entitlements:

| Product ID              | Entitlement | Description                                   |
| ----------------------- | ----------- | --------------------------------------------- |
| `MONTHLY_ETF_FLOW_PLAN` | `premium`   | Ежемесячная подписка на расширенную аналитику |
| `YEARLY_ETF_FLOW_PLAN`  | `premium`   | Годовая подписка на расширенную аналитику     |
| `basic_monthly`         | `basic`     | Базовый на месяц                              |

### **3. Создание Offerings**

Создайте offering "default":

- **Display Name:** Default Offering
- **Description:** Основные планы подписки

Добавьте пакеты:

- `MONTHLY_ETF_FLOW_PLAN` → `monthly_etf_flow_package`
- `YEARLY_ETF_FLOW_PLAN` → `yearly_etf_flow_package`
- `basic_monthly` → `basic_monthly_package`

## 🔧 **Настройка Android (Google Play)**

### **1. Создание продуктов**

В Google Play Console создайте подписки:

- `MONTHLY_ETF_FLOW_PLAN` - $4.99/месяц
- `YEARLY_ETF_FLOW_PLAN` - $49.9/год
- `basic_monthly` - $2.99/месяц

### **2. Настройка в RevenueCat**

Добавьте те же продукты в Android секцию.

## 🧪 **Тестирование**

### **1. Sandbox тестирование**

- **iOS:** Используйте тестовые аккаунты App Store
- **Android:** Используйте тестовые аккаунты Google Play

### **2. Тестовые сценарии**

1. Покупка подписки
2. Восстановление покупок
3. Отмена подписки
4. Автоматическое продление

## 📊 **Аналитика и метрики**

### **1. Ключевые метрики**

- **MRR (Monthly Recurring Revenue)**
- **ARR (Annual Recurring Revenue)**
- **Churn Rate**
- **Conversion Rate**

### **2. Настройка уведомлений**

- Уведомления о покупках
- Уведомления об отменах
- Уведомления о продлениях

## 🔒 **Безопасность**

### **1. Валидация покупок**

RevenueCat автоматически валидирует покупки на серверах Apple/Google.

### **2. Защита от мошенничества**

- Проверка квитанций
- Блокировка подозрительных аккаунтов
- Мониторинг аномальной активности

## 🚀 **Развертывание**

### **1. Production настройки**

- Обновите API ключи на production
- Настройте webhook endpoints
- Включите аналитику

### **2. Мониторинг**

- Настройте алерты
- Мониторьте ошибки
- Отслеживайте метрики

## 💡 **Советы**

### **1. Оптимизация конверсии**

- A/B тестирование цен
- Персонализированные предложения
- Своевременные напоминания

### **2. Снижение churn**

- Уведомления перед истечением
- Специальные предложения
- Улучшение продукта

### **3. Масштабирование**

- Добавление новых планов
- Международная экспансия
- Партнерские программы

## 📞 **Поддержка**

### **1. RevenueCat Support**

- [Документация](https://docs.revenuecat.com)
- [Community](https://community.revenuecat.com)
- [Email Support](mailto:support@revenuecat.com)

### **2. Полезные ссылки**

- [iOS Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Android Guidelines](https://play.google.com/about/developer-content-policy/)
- [Best Practices](https://docs.revenuecat.com/docs/best-practices)
