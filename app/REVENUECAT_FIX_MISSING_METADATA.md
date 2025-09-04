# 🔧 Исправление проблем с RevenueCat MISSING_METADATA

## 🚨 **Проблема**

RevenueCat показывает предупреждения:

- `MONTHLY_ETF_FLOW_PLAN`: MISSING_METADATA
- `YEARLY_ETF_FLOW_PLAN`: MISSING_METADATA

Это означает, что продукты созданы в RevenueCat, но не полностью настроены в App Store Connect.

## 📋 **Пошаговое решение**

### **1. Проверка в App Store Connect**

#### **Шаг 1: Вход в App Store Connect**

1. Зайдите в [App Store Connect](https://appstoreconnect.apple.com)
2. Выберите ваше приложение **ETF Tracker**
3. Перейдите в **Features** → **In-App Purchases**

#### **Шаг 2: Создание продуктов**

Если продукты не существуют, создайте их:

**Для MONTHLY_ETF_FLOW_PLAN:**

```
Product ID: MONTHLY_ETF_FLOW_PLAN
Type: Auto-Renewable Subscription
Reference Name: Monthly ETF Flow Plan
Subscription Group: Create new group "ETF Flow Subscriptions"
Subscription Duration: 1 Month
Price: $4.99
```

**Для YEARLY_ETF_FLOW_PLAN:**

```
Product ID: YEARLY_ETF_FLOW_PLAN
Type: Auto-Renewable Subscription
Reference Name: Yearly ETF Flow Plan
Subscription Group: Use existing "ETF Flow Subscriptions"
Subscription Duration: 1 Year
Price: $49.99
```

### **2. Заполнение метаданных**

#### **Шаг 3: Добавление описаний**

**Для каждого продукта заполните:**

**Display Name:**

- `MONTHLY_ETF_FLOW_PLAN`: "Monthly ETF Flow Plan"
- `YEARLY_ETF_FLOW_PLAN`: "Yearly ETF Flow Plan"

**Description:**

- `MONTHLY_ETF_FLOW_PLAN`: "Ежемесячная подписка на расширенную аналитику ETF потоков"
- `YEARLY_ETF_FLOW_PLAN`: "Годовая подписка со скидкой на расширенную аналитику ETF потоков"

**Promotional Image:**

- Добавьте изображение 1024x1024 пикселей для каждого продукта

#### **Шаг 4: Настройка локализации**

**Добавьте локализацию для русского языка:**

**Monthly ETF Flow Plan:**

```
Display Name (ru): "Месячный план ETF Flow"
Description (ru): "Ежемесячная подписка на расширенную аналитику ETF потоков"
```

**Yearly ETF Flow Plan:**

```
Display Name (ru): "Годовой план ETF Flow"
Description (ru): "Годовая подписка со скидкой на расширенную аналитику ETF потоков"
```

### **3. Настройка подписок**

#### **Шаг 5: Создание Subscription Group**

1. В App Store Connect перейдите в **Subscription Groups**
2. Создайте группу "ETF Flow Subscriptions"
3. Добавьте оба продукта в эту группу

#### **Шаг 6: Настройка цен**

**Установите цены для всех регионов:**

**Monthly Plan:**

- США: $4.99
- Европа: €4.99
- Россия: ₽399

**Yearly Plan:**

- США: $49.99
- Европа: €49.99
- Россия: ₽3999

### **4. Проверка в RevenueCat**

#### **Шаг 7: Синхронизация**

1. Зайдите в [RevenueCat Dashboard](https://app.revenuecat.com)
2. Перейдите в **Products**
3. Нажмите **Sync with App Store Connect**
4. Проверьте, что статус изменился с `MISSING_METADATA` на `ACTIVE`

#### **Шаг 8: Проверка Offerings**

1. Перейдите в **Offerings**
2. Откройте offering "subscriptions"
3. Убедитесь, что продукты `$rc_monthly` и `$rc_annual` активны
4. Проверьте, что они привязаны к entitlement "premium"

### **5. Тестирование**

#### **Шаг 9: Sandbox тестирование**

1. Создайте sandbox tester в App Store Connect
2. Запустите приложение на реальном устройстве
3. Попробуйте купить подписку
4. Проверьте, что entitlement активируется

#### **Шаг 10: Проверка логов**

В приложении проверьте логи:

```dart
// В SubscriptionService
if (kDebugMode) {
  await Purchases.setLogLevel(LogLevel.debug);
}
```

## 🔍 **Проверка статуса**

### **В App Store Connect:**

- Продукты должны иметь статус "Ready to Submit"
- Все метаданные заполнены
- Цены установлены

### **В RevenueCat Dashboard:**

- Статус продуктов: `ACTIVE`
- Offerings показывают доступные продукты
- Entitlements правильно привязаны

## 🚨 **Частые проблемы**

### **Проблема 1: "Product not found"**

**Решение:** Убедитесь, что Product ID в App Store Connect точно совпадает с ID в RevenueCat

### **Проблема 2: "Missing metadata"**

**Решение:** Заполните все обязательные поля в App Store Connect

### **Проблема 3: "Subscription group not configured"**

**Решение:** Создайте subscription group и добавьте продукты в него

### **Проблема 4: "Price not set"**

**Решение:** Установите цены для всех регионов в App Store Connect

## 📞 **Поддержка**

Если проблемы остаются:

1. **RevenueCat Support:** [support.revenuecat.com](https://support.revenuecat.com)
2. **Apple Developer Support:** [developer.apple.com/contact](https://developer.apple.com/contact)
3. **Проверьте документацию:** [developer.apple.com/in-app-purchase](https://developer.apple.com/in-app-purchase)

## ✅ **Чек-лист**

- [ ] Продукты созданы в App Store Connect
- [ ] Метаданные заполнены (название, описание, изображение)
- [ ] Локализация добавлена
- [ ] Subscription group создан
- [ ] Цены установлены для всех регионов
- [ ] Продукты синхронизированы с RevenueCat
- [ ] Offerings настроены правильно
- [ ] Entitlements привязаны к продуктам
- [ ] Протестировано в sandbox

## 🎯 **Результат**

После выполнения всех шагов:

- Предупреждения RevenueCat исчезнут
- Продукты будут доступны для покупки
- Подписки будут работать корректно
- Приложение готово к публикации

---

**Время выполнения:** 30-60 минут  
**Сложность:** Средняя  
**Статус:** Критично для production
