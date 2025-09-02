# 🧪 Тестирование с реальным тестовым пользователем

## 📱 **Настройка тестового пользователя**

### **1. Создание тестового пользователя в App Store Connect**

1. Зайдите в [App Store Connect](https://appstoreconnect.apple.com)
2. Перейдите в **Users and Access** → **Sandbox Testers**
3. Нажмите **+** для создания нового тестового пользователя
4. Заполните данные:
   - **Email:** `test@example.com`
   - **Password:** `Test123!`
   - **First Name:** `Test`
   - **Last Name:** `User`
   - **Country/Region:** `United States`

### **2. Настройка тестовых продуктов**

#### **Создание In-App Purchases:**

1. Перейдите в **Features** → **In-App Purchases**
2. Создайте продукты:

**Премиум на месяц:**

- **Product ID:** `premium_monthly`
- **Type:** Auto-Renewable Subscription
- **Price:** $0.99 (тестовая цена)
- **Duration:** 1 Month

**Премиум на год:**

- **Product ID:** `premium_yearly`
- **Type:** Auto-Renewable Subscription
- **Price:** $9.99 (тестовая цена)
- **Duration:** 1 Year

## 🔧 **Настройка приложения**

### **1. Обновление .env файла**

```env
# RevenueCat API Keys (используйте ваш реальный ключ)
REVENUECAT_IOS_API_KEY=ваш_реальный_api_ключ

# Backend Configuration
BACKEND_URL=http://localhost:3000
API_TIMEOUT=30000

# App Configuration
APP_NAME=ETF Tracker
APP_VERSION=1.0.0
```

### **2. Получение API ключа RevenueCat**

1. Зайдите в [RevenueCat Dashboard](https://app.revenuecat.com)
2. Перейдите в **Project Settings**
3. Скопируйте **iOS API Key**
4. Вставьте в `.env` файл

## 🧪 **Процесс тестирования**

### **1. Запуск приложения**

```bash
cd app
flutter run
```

### **2. Тестирование Apple Sign-In**

1. Откройте приложение на реальном iOS устройстве
2. Перейдите в раздел **Профиль**
3. Нажмите **"Sign in with Apple"**
4. Войдите используя тестовый аккаунт:
   - **Email:** `test@example.com`
   - **Password:** `Test123!`

### **3. Тестирование покупок**

1. После входа в профиле нажмите **"Обновить до Премиум"**
2. Выберите план подписки:
   - **Премиум на месяц** - $0.99
   - **Премиум на год** - $9.99
3. Подтвердите покупку
4. **Важно:** Деньги не будут списаны, это тестовая покупка

### **4. Тестирование восстановления покупок**

1. Выйдите из аккаунта
2. Войдите снова
3. Нажмите **"Восстановить покупки"**
4. Проверьте, что подписка восстановлена

## 📊 **Мониторинг тестов**

### **1. RevenueCat Dashboard**

- Зайдите в [RevenueCat Dashboard](https://app.revenuecat.com)
- Перейдите в **Events** - увидите все тестовые покупки
- Перейдите в **Customers** - увидите тестового пользователя
- Перейдите в **Products** - увидите статистику по продуктам

### **2. App Store Connect**

- Зайдите в [App Store Connect](https://appstoreconnect.apple.com)
- Перейдите в **Sales and Trends** - увидите тестовые продажи
- Перейдите в **Sandbox Testers** - увидите активность тестового аккаунта

### **3. Логи приложения**

В консоли Flutter увидите:

```
🔧 Debug режим: Инициализируем RevenueCat для тестирования
✅ RevenueCat инициализирован успешно
🔧 Debug режим: Устанавливаем пользователя в RevenueCat: test_user_001
✅ Пользователь установлен: test_user_001
🔧 Debug режим: Получаем реальные подписки из RevenueCat
🔧 Debug режим: Реальная покупка подписки: premium_monthly
✅ Подписка куплена: premium_monthly
```

## 🚨 **Важные моменты**

### **1. Sandbox ограничения**

- ✅ **Покупки бесплатны** - деньги не списываются
- ✅ **Подписки продлеваются** каждые 5 минут (вместо месяца)
- ✅ **Максимальная длительность** тестовой подписки - 1 год
- ✅ **Тестовые аккаунты** работают только в sandbox

### **2. Тестирование на устройстве**

- ❌ **Симулятор не поддерживает** In-App Purchases
- ✅ **Обязательно тестируйте** на реальном iOS устройстве
- ✅ **Используйте тестовые аккаунты** App Store

### **3. Очистка тестовых данных**

После тестирования:

1. Удалите тестовые аккаунты из App Store Connect
2. Очистите тестовые данные из RevenueCat Dashboard
3. Сбросьте настройки приложения на устройстве

## 🎯 **Следующие шаги**

### **1. Production настройки**

После успешного тестирования:

1. Создайте production продукты в App Store Connect
2. Обновите цены на production
3. Обновите API ключи на production
4. Протестируйте на production

### **2. Публикация**

1. Подготовьте приложение к публикации
2. Отправьте на review в App Store
3. После одобрения опубликуйте

---

## 📞 **Поддержка**

### **Проблемы с тестированием:**

- [RevenueCat Testing Guide](https://docs.revenuecat.com/docs/testing)
- [Apple Sandbox Testing](https://developer.apple.com/app-store/sandbox-testing/)
- [Flutter In-App Purchases](https://docs.flutter.dev/development/data-and-backend/state-mgmt/simple)

### **Полезные ссылки:**

- [RevenueCat Dashboard](https://app.revenuecat.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer](https://developer.apple.com)

---

**Готово к тестированию! 🧪**
