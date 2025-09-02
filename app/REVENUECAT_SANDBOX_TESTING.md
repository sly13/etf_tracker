# 🧪 RevenueCat Sandbox Testing Guide

## 📱 **Настройка тестового окружения**

### **1. Тестовые аккаунты App Store**

Создайте тестовые аккаунты в App Store Connect:

1. Зайдите в [App Store Connect](https://appstoreconnect.apple.com)
2. Перейдите в **Users and Access** → **Sandbox Testers**
3. Создайте тестовые аккаунты:
   - **Email:** `test1@example.com`
   - **Password:** `Test123!`
   - **First Name:** `Test`
   - **Last Name:** `User`

### **2. Тестовые продукты в App Store Connect**

Создайте In-App Purchases для тестирования:

#### **Подписки:**

- **Product ID:** `premium_monthly_test`
- **Type:** Auto-Renewable Subscription
- **Price:** $0.99 (тестовая цена)
- **Duration:** 1 Month

- **Product ID:** `premium_yearly_test`
- **Type:** Auto-Renewable Subscription
- **Price:** $9.99 (тестовая цена)
- **Duration:** 1 Year

### **3. Настройка RevenueCat Dashboard**

#### **Создание Entitlements:**

1. Зайдите в [RevenueCat Dashboard](https://app.revenuecat.com)
2. Перейдите в **Entitlements**
3. Создайте `premium_test`:
   - **Display Name:** Premium Test
   - **Description:** Premium features for testing

#### **Создание Products:**

1. Перейдите в **Products**
2. Добавьте тестовые продукты:
   - `premium_monthly_test` → `premium_test`
   - `premium_yearly_test` → `premium_test`

#### **Создание Offerings:**

1. Перейдите в **Offerings**
2. Создайте `test_offering`:
   - **Display Name:** Test Offering
   - **Description:** Test subscription plans

## 🧪 **Тестирование в приложении**

### **1. Debug режим**

Приложение автоматически работает в sandbox когда:

```dart
// В main.dart
void main() async {
  await dotenv.load(fileName: ".env");

  // В debug режиме RevenueCat автоматически использует sandbox
  runApp(const MyApp());
}
```

### **2. Тестовые сценарии**

#### **Сценарий 1: Покупка подписки**

1. Запустите приложение в debug режиме
2. Войдите через Apple Sign-In (используйте тестовый аккаунт)
3. Перейдите в Профиль → Обновить до Премиум
4. Выберите тестовую подписку
5. Подтвердите покупку (не будет реального списания)

#### **Сценарий 2: Восстановление покупок**

1. После покупки выйдите из аккаунта
2. Войдите снова
3. Нажмите "Восстановить покупки"
4. Проверьте, что подписка восстановлена

#### **Сценарий 3: Отмена подписки**

1. В настройках устройства перейдите в **Настройки** → **App Store**
2. Нажмите на ваш Apple ID → **Подписки**
3. Найдите тестовую подписку и отмените её

### **3. Проверка в RevenueCat Dashboard**

После тестирования проверьте в Dashboard:

#### **Events:**

- Покупки подписок
- Восстановления покупок
- Отмены подписок

#### **Customers:**

- Создание новых пользователей
- Обновление подписок
- Статус entitlements

## 🔧 **Настройка для тестирования**

### **1. Обновление .env файла**

```env
# RevenueCat API Keys (sandbox)
REVENUECAT_IOS_API_KEY=app42ff7d937d

# Backend Configuration
BACKEND_URL=http://localhost:3000
API_TIMEOUT=30000

# App Configuration
APP_NAME=ETF Tracker Test
APP_VERSION=1.0.0
```

### **2. Тестовые данные в базе**

```sql
-- Тестовый пользователь
INSERT INTO "User" (id, name, email, "appleId", "createdAt", "lastLoginAt")
VALUES ('test_user_1', 'Test User', 'test@example.com', 'test_apple_id', NOW(), NOW());

-- Тестовая подписка
INSERT INTO "Subscription" (id, plan, "expiresAt", "autoRenew", "userId")
VALUES ('test_sub_1', 'premium', NOW() + INTERVAL '1 month', true, 'test_user_1');
```

## 🚨 **Важные моменты**

### **1. Sandbox ограничения**

- Покупки не списывают реальные деньги
- Подписки автоматически продлеваются каждые 5 минут
- Максимальная длительность тестовой подписки - 1 год

### **2. Тестирование на устройстве**

- Обязательно тестируйте на реальном iOS устройстве
- Симулятор не поддерживает In-App Purchases
- Используйте тестовые аккаунты App Store

### **3. Логирование**

```dart
// В SubscriptionService
await Purchases.setLogLevel(LogLevel.debug);
```

### **4. Очистка тестовых данных**

После тестирования:

1. Удалите тестовые аккаунты из App Store Connect
2. Очистите тестовые данные из RevenueCat Dashboard
3. Сбросьте настройки приложения на устройстве

## 📊 **Мониторинг тестов**

### **1. RevenueCat Dashboard**

- **Events:** Все события покупок
- **Customers:** Информация о пользователях
- **Products:** Статистика по продуктам

### **2. App Store Connect**

- **Sales and Trends:** Тестовые продажи
- **Sandbox Testers:** Активность тестовых аккаунтов

### **3. Логи приложения**

```dart
// Проверяйте логи в консоли
print('RevenueCat инициализирован успешно');
print('Пользователь установлен: $userId');
print('Подписка куплена: ${package.identifier}');
```

## 🎯 **Готово к production**

После успешного тестирования в sandbox:

1. **Создайте production продукты** в App Store Connect
2. **Обновите API ключи** на production
3. **Настройте production entitlements** в RevenueCat
4. **Протестируйте на production** с реальными аккаунтами
5. **Опубликуйте приложение** в App Store

---

**Примечание:** Все тестирование в sandbox бесплатно и безопасно! 🎉
