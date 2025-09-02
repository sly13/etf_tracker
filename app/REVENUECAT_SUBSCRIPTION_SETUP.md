# 💳 Настройка подписок в RevenueCat

## 📋 **Ваши подписки**

### **1. Monthly ETF Flow Plan**

- **Product ID:** `MONTHLY_ETF_FLOW_PLAN`
- **Цена:** \$4.99/месяц
- **Описание:** Ежемесячная подписка на расширенную аналитику ETF потоков

### **2. Yearly ETF Flow Plan**

- **Product ID:** `YEARLY_ETF_FLOW_PLAN`
- **Цена:** \$49.9/год
- **Описание:** Годовая подписка со скидкой на расширенную аналитику
- **Статус:** Популярный план

## 🔧 **Настройка в RevenueCat Dashboard**

### **1. Создание Entitlements**

**В RevenueCat Dashboard:**

1. Перейдите в **Entitlements**
2. Создайте новое entitlement:
   ```
   Name: premium
   Description: Premium access to ETF flow analytics
   ```

### **2. Создание Products**

**Для каждого продукта:**

1. Перейдите в **Products**
2. Создайте продукты:

**Product 1:**

```
Product ID: MONTHLY_ETF_FLOW_PLAN
Display Name: Monthly ETF Flow Plan
Description: Ежемесячная подписка на расширенную аналитику ETF потоков
Entitlement: premium
```

**Product 2:**

```
Product ID: YEARLY_ETF_FLOW_PLAN
Display Name: Yearly ETF Flow Plan
Description: Годовая подписка со скидкой на расширенную аналитику
Entitlement: premium
```

### **3. Создание Offerings**

**Создайте Offering:**

```
Name: default
Display Name: Premium Plans
Description: Выберите план подписки для доступа к расширенной аналитике
```

**Добавьте продукты в offering:**

- `MONTHLY_ETF_FLOW_PLAN` (месячная подписка)
- `YEARLY_ETF_FLOW_PLAN` (годовая подписка)

## 📱 **Интеграция в приложение**

### **1. Обновление SubscriptionService**

```dart
// В subscription_service.dart
static Future<List<StoreProduct>> getAvailablePackages() async {
  try {
    final offerings = await Purchases.getOfferings();
    final current = offerings.current;

    if (current == null) {
      return _getMockSubscriptions();
    }

    return current.availablePackages
        .map((package) => package.storeProduct)
        .toList();
  } catch (e) {
    return _getMockSubscriptions();
  }
}
```

### **2. Покупка подписки**

```dart
Future<void> purchaseSubscription(StoreProduct product) async {
  try {
    final customerInfo = await Purchases.purchaseStoreProduct(product);

    // Обновляем пользователя
    final updatedUser = SubscriptionService.updateUserWithSubscription(
      currentUser!,
      customerInfo,
    );
    _setCurrentUser(updatedUser);

  } catch (e) {
    throw Exception('Ошибка покупки: $e');
  }
}
```

### **3. Проверка статуса подписки**

```dart
Future<bool> isPremium() async {
  try {
    final customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active.containsKey('premium');
  } catch (e) {
    return false;
  }
}
```

## 🧪 **Тестирование**

### **1. Sandbox тестирование**

**В App Store Connect:**

1. Создайте sandbox tester
2. Настройте тестовые продукты
3. Протестируйте покупки

**В приложении:**

1. Запустите на реальном устройстве
2. Перейдите в профиль
3. Нажмите "Обновить до Премиум"
4. Выберите план и купите

### **2. Проверка в RevenueCat Dashboard**

**После покупки:**

1. Перейдите в **Events**
2. Найдите событие покупки
3. Проверьте entitlement activation

## 📊 **Мониторинг**

### **1. Метрики RevenueCat**

**Отслеживайте:**

- Количество покупок
- Revenue
- Churn rate
- Conversion rate

### **2. Аналитика**

**В RevenueCat Dashboard:**

- **Revenue** - общий доход
- **Subscribers** - количество подписчиков
- **Churn** - отток пользователей
- **LTV** - пожизненная ценность

## 🔄 **Обновление цен**

### **1. В App Store Connect:**

1. Перейдите в **Pricing**
2. Обновите цены
3. Установите дату вступления в силу

### **2. В RevenueCat:**

1. Обновите отображение цен
2. Протестируйте новые цены

## 🆘 **Устранение проблем**

### **Проблема: "Product not found"**

- Проверьте Product ID в App Store Connect
- Убедитесь, что продукт добавлен в RevenueCat
- Проверьте Bundle ID

### **Проблема: "Purchase failed"**

- Проверьте sandbox tester
- Убедитесь, что устройство в sandbox режиме
- Проверьте интернет соединение

### **Проблема: "Entitlement not activated"**

- Проверьте entitlement в RevenueCat
- Убедитесь, что продукт привязан к entitlement
- Проверьте логи покупки

## 📋 **Чек-лист**

- [ ] Созданы продукты в App Store Connect
- [ ] Настроены entitlements в RevenueCat
- [ ] Создано offering с продуктами
- [ ] Протестированы покупки в sandbox
- [ ] Проверена активация entitlements
- [ ] Настроен мониторинг метрик
- [ ] Протестированы цены и планы

## 🎯 **Следующие шаги**

1. **Настройте RevenueCat Dashboard**
2. **Протестируйте покупки в sandbox**
3. **Настройте аналитику**
4. **Запустите в production**

**Готово! Ваши подписки интегрированы в приложение! 🎉**
