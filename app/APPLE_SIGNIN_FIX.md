# 🍎 Исправление Apple Sign-In ошибки

## ❌ **Проблема**

Ошибка `AuthorizationErrorCode.unknown, error 1000` в Apple Sign-In как в dev, так и в production режимах.

## 🔧 **Решение**

### **1. Проверка Apple Developer Account**

**В Apple Developer Console:**

1. Зайдите в [Apple Developer](https://developer.apple.com)
2. Перейдите в **Certificates, Identifiers & Profiles**
3. Выберите **Identifiers**
4. Найдите ваш App ID: `com.sly13.etfTracker`
5. Убедитесь, что **Sign In with Apple** включен

### **2. Настройка App ID**

**В App ID настройках:**

```
App ID: com.sly13.etfTracker
Capabilities:
✅ Sign In with Apple
✅ Push Notifications
✅ In-App Purchase
```

### **3. Проверка Xcode проекта**

**Откройте проект в Xcode:**

```bash
cd ios
open Runner.xcworkspace
```

**В Xcode:**

1. Выберите **Runner** target
2. Перейдите в **Signing & Capabilities**
3. Убедитесь, что **Sign In with Apple** добавлен
4. Проверьте **Bundle Identifier**: `com.sly13.etfTracker`

### **4. Обновленные файлы**

**✅ Runner.entitlements:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>aps-environment</key>
	<string>development</string>
	<key>com.apple.developer.applesignin</key>
	<array>
		<string>Default</string>
	</array>
</dict>
</plist>
```

**✅ Info.plist:**

```xml
<key>CFBundleURLTypes</key>
<array>
	<dict>
		<key>CFBundleURLName</key>
		<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
		<key>CFBundleURLSchemes</key>
		<array>
			<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
		</array>
	</dict>
</array>
```

### **5. Тестирование**

**На реальном устройстве:**

1. Убедитесь, что устройство в той же сети
2. Проверьте, что Apple ID настроен на устройстве
3. Попробуйте войти через Apple Sign-In

**В симуляторе:**

1. Apple Sign-In не работает в симуляторе
2. Используйте только реальное устройство

### **6. Альтернативные решения**

**Если проблема остается:**

#### **A. Временное отключение Apple Sign-In**

```dart
// В profile_screen.dart
Widget _buildLoginScreen(AuthProvider authProvider) {
  return Center(
    child: Column(
      children: [
        Text('Apple Sign-In временно недоступен'),
        ElevatedButton(
          onPressed: () {
            // Использовать mock вход
            authProvider.signInWithMock();
          },
          child: Text('Войти (тестовый режим)'),
        ),
      ],
    ),
  );
}
```

#### **B. Использование других методов аутентификации**

- Email/Password
- Google Sign-In
- Facebook Login

### **7. Отладка**

**Добавьте логирование:**

```dart
print('🔧 Apple Sign-In Debug:');
print('Bundle ID: com.sly13.etfTracker');
print('Mode: ${AppConfig.isDebugMode ? "Debug" : "Release"}');
print('Backend: ${AppConfig.backendBaseUrl}');
```

**Проверьте консоль Xcode:**

1. Подключите устройство
2. Откройте **Console** в Xcode
3. Фильтруйте по вашему приложению
4. Ищите ошибки Apple Sign-In

### **8. Проверка сети**

**Убедитесь, что бэкенд доступен:**

```bash
# Проверка локального бэкенда
curl http://192.168.100.94:3066/

# Проверка продакшн бэкенда
curl https://etf-flow.vadimsemenko.ru/
```

## 🆘 **Если ничего не помогает**

### **1. Пересоздание App ID**

1. Удалите существующий App ID
2. Создайте новый с правильными capabilities
3. Обновите Bundle Identifier

### **2. Проверка сертификатов**

1. Удалите все сертификаты
2. Создайте новые
3. Обновите provisioning profiles

### **3. Обращение в Apple Support**

Если проблема системная, обратитесь в Apple Developer Support.

## 📋 **Чек-лист**

- [ ] App ID настроен в Apple Developer Console
- [ ] Sign In with Apple включен в capabilities
- [ ] Bundle Identifier правильный: `com.sly13.etfTracker`
- [ ] Entitlements файл обновлен
- [ ] Info.plist содержит URL schemes
- [ ] Тестирование на реальном устройстве
- [ ] Apple ID настроен на устройстве
- [ ] Бэкенд доступен и работает

**После выполнения всех шагов Apple Sign-In должен заработать! 🎉**
