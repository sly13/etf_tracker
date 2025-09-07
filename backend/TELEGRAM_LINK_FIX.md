# 🔗 Исправление ссылки на Telegram бота

## 📋 Проблема

В ссылке на Telegram бота **НЕ передавалось** название приложения, что приводило к использованию fallback значения `'etf.flow'` для всех пользователей.

## 🔍 Анализ ссылки

**Ваша ссылка:** `https://t.me/etf_flows_bot?start=ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765`

- ❌ **Только deviceId**: `ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765`
- ❌ **НЕТ appName** в параметре
- ❌ **Результат**: Все пользователи регистрируются в `'etf.flow'`

## ✅ Исправление

### **До исправления:**

```dart
final botUrl = 'https://t.me/etf_flows_bot?start=$deviceId';
// Результат: https://t.me/etf_flows_bot?start=ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765
```

### **После исправления:**

```dart
final botUrl = 'https://t.me/etf_flows_bot?start=${AppConfig.appName}:$deviceId';
// Результат: https://t.me/etf_flows_bot?start=etf.flow:ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765
```

## 🔄 Как работает бэкенд

Бэкенд уже был готов обрабатывать новый формат:

```typescript
// Check if parameter contains app name (format: "appName:deviceId")
if (startParam.includes(':')) {
  const parts = startParam.split(':');
  appName = parts[0]; // "etf.flow"
  deviceId = parts[1]; // "ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765"
}
```

## 📱 Примеры ссылок

| Формат        | Ссылка                                                      | Результат                         |
| ------------- | ----------------------------------------------------------- | --------------------------------- |
| **Старый**    | `https://t.me/etf_flows_bot?start=device123`                | `appName = 'etf.flow'` (fallback) |
| **Новый**     | `https://t.me/etf_flows_bot?start=etf.flow:device123`       | `appName = 'etf.flow'`            |
| **Кастомный** | `https://t.me/etf_flows_bot?start=crypto.tracker:device123` | `appName = 'crypto.tracker'`      |

## 🧪 Тестирование

Создан тестовый скрипт `test-telegram-link-format.js` который подтверждает:

- ✅ Старый формат работает (fallback)
- ✅ Новый формат работает (appName:deviceId)
- ✅ Кастомные appName поддерживаются

## 📈 Преимущества

1. **Точность**: Пользователи регистрируются в правильном приложении
2. **Гибкость**: Поддержка множественных приложений
3. **Совместимость**: Старые ссылки продолжают работать
4. **Консистентность**: Единый формат для всех приложений

## 🎯 Результат

Теперь ссылка будет выглядеть так:

```
https://t.me/etf_flows_bot?start=etf.flow:ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765
```

И бэкенд корректно определит:

- `appName = 'etf.flow'`
- `deviceId = 'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765'`
