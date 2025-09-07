# 🔗 Исправленный Flow для Telegram привязки

## 📋 Правильный процесс связывания

### 1. Регистрация пользователя в мобильном приложении

```javascript
// В мобильном приложении
const response = await fetch('/applications/register-device', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: fcmToken,
    appName: 'etf.flow',
    userId: 'user_12345', // ID пользователя в приложении
    deviceId: 'device_abc123', // Уникальный ID устройства для привязки
    deviceInfo: {
      deviceType: 'android',
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan@example.com',
    },
  }),
});

const result = await response.json();
// result.deviceId - это ID для привязки Telegram
```

### 2. Кнопка "Привязать Telegram" в приложении

```javascript
// В мобильном приложении
function openTelegramBot() {
  const deviceId = 'device_abc123'; // Получаем из ответа регистрации
  const botUrl = `https://t.me/your_bot_username?start=${deviceId}`;

  // Открываем Telegram с параметром deviceId
  window.open(botUrl, '_blank');

  // Показываем инструкции
  alert('Отправьте команду /start боту для автоматической привязки');
}
```

### 3. Автоматическая привязка в Telegram боте

Когда пользователь нажимает на ссылку `https://t.me/your_bot_username?start=device_abc123`, Telegram автоматически отправляет команду `/start device_abc123` боту.

Бот получает параметр `device_abc123` и:

1. Ищет пользователя по `deviceId`
2. Автоматически привязывает Telegram Chat ID
3. Активирует уведомления
4. Отправляет приветственное сообщение

## 🤖 Логика Telegram бота

### Команда /start с параметром

```javascript
// В Telegram Bot Service
this.bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const startParam = match?.[1]?.trim(); // device_abc123

  if (startParam) {
    // Ищем пользователя по deviceId
    const user = await this.prismaService.user.findUnique({
      where: { deviceId: startParam },
      include: { application: true },
    });

    if (user) {
      // Автоматически привязываем Telegram
      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          telegramChatId: chatId.toString(),
          enableTelegramNotifications: true,
          telegramLinkedAt: new Date(),
        },
      });

      // Отправляем приветствие
      await this.bot.sendMessage(
        chatId,
        `
🤖 Добро пожаловать в ${user.application.displayName}!

✅ Telegram уведомления активированы!
👤 Пользователь: ${user.firstName} ${user.lastName}
🆔 Device ID: ${user.deviceId}

📊 Вы будете получать уведомления о:
• Bitcoin ETF потоки
• Ethereum ETF потоки
• Значительные изменения
      `,
      );
    }
  }
});
```

## 📱 Пример интеграции в мобильном приложении

### React Native компонент

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Linking, Alert } from 'react-native';

const TelegramSettings = ({ deviceId }) => {
  const [isLinked, setIsLinked] = useState(false);

  const openTelegramBot = () => {
    if (!deviceId) {
      Alert.alert('Ошибка', 'Device ID не найден');
      return;
    }

    const botUrl = `https://t.me/your_bot_username?start=${deviceId}`;

    Linking.openURL(botUrl).catch((err) => {
      Alert.alert('Ошибка', 'Не удалось открыть Telegram');
    });

    Alert.alert(
      'Инструкции',
      'Telegram откроется автоматически. Отправьте команду /start боту для привязки аккаунта.',
      [{ text: 'Понятно' }],
    );
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Telegram уведомления
      </Text>

      {isLinked ? (
        <View>
          <Text style={{ color: 'green', marginBottom: 10 }}>
            ✅ Telegram аккаунт привязан
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Device ID: {deviceId}
          </Text>
        </View>
      ) : (
        <View>
          <Text style={{ marginBottom: 10 }}>
            Подключите Telegram для получения уведомлений
          </Text>

          <Button title="Привязать Telegram" onPress={openTelegramBot} />

          <Text style={{ fontSize: 12, color: '#666', marginTop: 10 }}>
            Device ID: {deviceId}
          </Text>
        </View>
      )}
    </View>
  );
};

export default TelegramSettings;
```

### Flutter пример

```dart
import 'package:url_launcher/url_launcher.dart';

class TelegramSettings extends StatefulWidget {
  final String deviceId;

  const TelegramSettings({Key? key, required this.deviceId}) : super(key: key);

  @override
  _TelegramSettingsState createState() => _TelegramSettingsState();
}

class _TelegramSettingsState extends State<TelegramSettings> {
  bool isLinked = false;

  Future<void> openTelegramBot() async {
    if (widget.deviceId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Device ID не найден')),
      );
      return;
    }

    final botUrl = 'https://t.me/your_bot_username?start=${widget.deviceId}';

    if (await canLaunch(botUrl)) {
      await launch(botUrl);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Telegram откроется автоматически. Отправьте /start боту.'),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Не удалось открыть Telegram')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Telegram уведомления',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 20),

          if (isLinked) ...[
            Text(
              '✅ Telegram аккаунт привязан',
              style: TextStyle(color: Colors.green),
            ),
            SizedBox(height: 10),
            Text(
              'Device ID: ${widget.deviceId}',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ] else ...[
            Text('Подключите Telegram для получения уведомлений'),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: openTelegramBot,
              child: Text('Привязать Telegram'),
            ),
            SizedBox(height: 10),
            Text(
              'Device ID: ${widget.deviceId}',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ],
      ),
    );
  }
}
```

## 🔧 API Эндпоинты

### 1. Регистрация устройства

```http
POST /applications/register-device
{
  "token": "fcm_token",
  "appName": "etf.flow",
  "userId": "user_12345",
  "deviceId": "device_abc123",
  "deviceInfo": { ... }
}
```

### 2. Привязка Telegram по Device ID (ручная)

```http
POST /applications/link-telegram-by-device-id
{
  "deviceId": "device_abc123",
  "telegramChatId": "123456789"
}
```

## 🧪 Тестирование

### Тест автоматической привязки

1. **Регистрация пользователя:**

```bash
curl -X POST http://localhost:3000/applications/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test_token_123",
    "appName": "etf.flow",
    "userId": "user_12345",
    "deviceId": "device_abc123",
    "deviceInfo": {
      "deviceType": "android",
      "firstName": "Тест",
      "lastName": "Пользователь"
    }
  }'
```

2. **Открытие Telegram бота:**

```
https://t.me/your_bot_username?start=device_abc123
```

3. **Проверка привязки:**

```bash
curl http://localhost:3000/applications/user/test_token_123
```

## 🎯 Преимущества нового flow

1. **Автоматическая привязка** - пользователь не вводит Chat ID вручную
2. **Безопасность** - deviceId уникален и привязан к конкретному устройству
3. **Удобство** - один клик для привязки Telegram
4. **Надежность** - меньше ошибок пользователя
5. **Масштабируемость** - легко добавлять новые приложения

## 🔒 Безопасность

- `deviceId` должен быть уникальным для каждого устройства
- Telegram Chat ID уникален в системе
- Валидация всех входящих данных
- Логирование всех операций привязки

## 🎉 Готово!

Теперь процесс привязки Telegram максимально простой:

1. Пользователь регистрируется в приложении
2. Получает уникальный `deviceId`
3. Нажимает "Привязать Telegram"
4. Telegram открывается с параметром `deviceId`
5. Бот автоматически привязывает аккаунт
6. Пользователь получает уведомления
