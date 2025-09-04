# 🚀 Быстрое исправление проблем RevenueCat

## 🚨 **Проблема**

RevenueCat показывает предупреждения о `MISSING_METADATA` для продуктов:

- `MONTHLY_ETF_FLOW_PLAN`
- `YEARLY_ETF_FLOW_PLAN`

## ⚡ **Быстрое решение (5 минут)**

### **1. App Store Connect**

1. Зайдите в [App Store Connect](https://appstoreconnect.apple.com)
2. Выберите приложение **ETF Tracker**
3. Перейдите в **Features** → **In-App Purchases**
4. Создайте продукты (если не существуют):
   - `MONTHLY_ETF_FLOW_PLAN` (Auto-Renewable Subscription, $4.99/месяц)
   - `YEARLY_ETF_FLOW_PLAN` (Auto-Renewable Subscription, $49.99/год)
5. Заполните **Display Name** и **Description** для каждого продукта

### **2. RevenueCat Dashboard**

1. Зайдите в [RevenueCat Dashboard](https://app.revenuecat.com)
2. Перейдите в **Products**
3. Нажмите **Sync with App Store Connect**
4. Проверьте, что статус изменился на `ACTIVE`

### **3. Проверка в приложении**

1. Запустите приложение
2. Проверьте логи в консоли
3. Убедитесь, что диагностика показывает "✅ Готов к работе"

## 📋 **Что проверить**

### **В App Store Connect:**

- [ ] Продукты созданы
- [ ] Display Name заполнен
- [ ] Description заполнен
- [ ] Цены установлены
- [ ] Статус "Ready to Submit"

### **В RevenueCat:**

- [ ] Продукты синхронизированы
- [ ] Статус `ACTIVE`
- [ ] Продукты добавлены в offering
- [ ] Entitlements привязаны

## 🔧 **Диагностика**

Приложение теперь автоматически показывает диагностику при запуске. Проверьте логи:

```
🔍 === RevenueCat Диагностика ===
Статус: ✅ Готов к работе
Сообщение: RevenueCat готов к работе
Продукты: MONTHLY_ETF_FLOW_PLAN, YEARLY_ETF_FLOW_PLAN
Готов к покупкам: ✅ Да
================================
```

## 🆘 **Если проблемы остаются**

1. **Подробное руководство:** `REVENUECAT_FIX_MISSING_METADATA.md`
2. **Тестирование:** `REVENUECAT_SANDBOX_TESTING.md`
3. **Поддержка:** [support.revenuecat.com](https://support.revenuecat.com)

## ✅ **Результат**

После исправления:

- Предупреждения исчезнут
- Продукты будут доступны для покупки
- Подписки будут работать корректно

---

**Время:** 5-10 минут  
**Сложность:** Легкая  
**Статус:** Критично для production
