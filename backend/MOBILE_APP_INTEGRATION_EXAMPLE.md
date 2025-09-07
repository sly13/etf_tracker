# 📱 Пример интеграции для мобильного приложения

## 🔧 Настройка в мобильном приложении

### 1. Регистрация пользователя при запуске приложения

```javascript
// В мобильном приложении (React Native/Flutter/Web)
class NotificationService {
  constructor() {
    this.baseUrl = 'https://your-backend.com';
    this.userId = null; // ID пользователя из мобильного приложения
  }

  async registerUser(fcmToken, userInfo) {
    try {
      const response = await fetch(
        `${this.baseUrl}/applications/register-device`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: fcmToken,
            appName: 'etf.flow', // или другое приложение
            userId: this.userId, // Уникальный ID пользователя
            deviceInfo: {
              deviceType: Platform.OS, // 'android' или 'ios'
              appVersion: '1.0.0',
              osVersion: Platform.Version.toString(),
              language: 'ru',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              deviceName: DeviceInfo.deviceName,
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              email: userInfo.email,
              phone: userInfo.phone,
            },
          }),
        },
      );

      const result = await response.json();
      if (result.success) {
        console.log('✅ Пользователь зарегистрирован:', result.message);
        return true;
      } else {
        console.error('❌ Ошибка регистрации:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      return false;
    }
  }
}
```

### 2. Компонент для управления Telegram уведомлениями

```javascript
// React Native компонент
import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert, Linking } from 'react-native';

const TelegramSettings = ({ userId, baseUrl }) => {
  const [chatId, setChatId] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Проверяем статус привязки при загрузке
  useEffect(() => {
    checkTelegramStatus();
  }, []);

  const checkTelegramStatus = async () => {
    try {
      const response = await fetch(`${baseUrl}/applications/user/${userId}`);
      const result = await response.json();

      if (result.success && result.user.enableTelegramNotifications) {
        setIsLinked(true);
      }
    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
    }
  };

  const openTelegramBot = () => {
    const botUrl = 'https://t.me/your_bot_username';
    Linking.openURL(botUrl);

    Alert.alert(
      'Инструкции',
      '1. Отправьте команду /start боту\n2. Скопируйте Chat ID из ответа\n3. Введите Chat ID в поле ниже',
      [{ text: 'Понятно' }],
    );
  };

  const linkTelegramAccount = async () => {
    if (!chatId.trim()) {
      Alert.alert('Ошибка', 'Введите Chat ID');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}/applications/link-telegram-by-user-id`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            telegramChatId: chatId.trim(),
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setIsLinked(true);
        Alert.alert('Успех', 'Telegram аккаунт успешно привязан!');
      } else {
        Alert.alert('Ошибка', result.message);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось привязать аккаунт');
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkTelegramAccount = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/applications/unlink-telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceToken: 'your_fcm_token', // или получить из контекста
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsLinked(false);
        setChatId('');
        Alert.alert('Успех', 'Telegram аккаунт отвязан');
      } else {
        Alert.alert('Ошибка', result.message);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отвязать аккаунт');
    } finally {
      setIsLoading(false);
    }
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
          <Button
            title="Отвязать Telegram"
            onPress={unlinkTelegramAccount}
            disabled={isLoading}
          />
        </View>
      ) : (
        <View>
          <Text style={{ marginBottom: 10 }}>
            Подключите Telegram для получения уведомлений
          </Text>

          <Button
            title="Открыть Telegram бота"
            onPress={openTelegramBot}
            style={{ marginBottom: 10 }}
          />

          <TextInput
            placeholder="Введите Chat ID"
            value={chatId}
            onChangeText={setChatId}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              marginBottom: 10,
              borderRadius: 5,
            }}
          />

          <Button
            title="Привязать аккаунт"
            onPress={linkTelegramAccount}
            disabled={isLoading || !chatId.trim()}
          />
        </View>
      )}
    </View>
  );
};

export default TelegramSettings;
```

### 3. Flutter пример (Dart)

```dart
// Flutter сервис для работы с уведомлениями
class NotificationService {
  final String baseUrl = 'https://your-backend.com';
  String? userId;

  Future<bool> registerUser(String fcmToken, Map<String, dynamic> userInfo) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/applications/register-device'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'token': fcmToken,
          'appName': 'etf.flow',
          'userId': userId,
          'deviceInfo': {
            'deviceType': Platform.isAndroid ? 'android' : 'ios',
            'appVersion': '1.0.0',
            'osVersion': Platform.operatingSystemVersion,
            'language': 'ru',
            'timezone': DateTime.now().timeZoneName,
            'deviceName': await DeviceInfoPlugin().deviceName,
            'firstName': userInfo['firstName'],
            'lastName': userInfo['lastName'],
            'email': userInfo['email'],
            'phone': userInfo['phone'],
          },
        }),
      );

      final result = jsonDecode(response.body);
      if (result['success']) {
        print('✅ Пользователь зарегистрирован: ${result['message']}');
        return true;
      } else {
        print('❌ Ошибка регистрации: ${result['message']}');
        return false;
      }
    } catch (error) {
      print('❌ Ошибка регистрации: $error');
      return false;
    }
  }

  Future<bool> linkTelegramAccount(String chatId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/applications/link-telegram-by-user-id'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'telegramChatId': chatId,
        }),
      );

      final result = jsonDecode(response.body);
      return result['success'];
    } catch (error) {
      print('❌ Ошибка привязки Telegram: $error');
      return false;
    }
  }
}
```

### 4. Настройка в приложении

```javascript
// В главном компоненте приложения
const App = () => {
  const [userId, setUserId] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    // Получаем FCM токен
    getFCMToken().then((token) => {
      setFcmToken(token);
    });

    // Получаем ID пользователя из локального хранилища
    getUserId().then((id) => {
      setUserId(id);
    });
  }, []);

  useEffect(() => {
    // Регистрируем пользователя когда есть и токен и ID
    if (fcmToken && userId) {
      const notificationService = new NotificationService();
      notificationService.userId = userId;
      notificationService.registerUser(fcmToken, {
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan@example.com',
      });
    }
  }, [fcmToken, userId]);

  return (
    <View>
      {/* Ваш основной интерфейс */}
      <TelegramSettings userId={userId} baseUrl="https://your-backend.com" />
    </View>
  );
};
```

## 🎯 Ключевые моменты

1. **User ID**: Должен быть уникальным для каждого пользователя в приложении
2. **FCM Token**: Получается при инициализации Firebase
3. **Регистрация**: Происходит при первом запуске приложения
4. **Telegram связывание**: Через простой интерфейс с вводом Chat ID
5. **Обработка ошибок**: Всегда проверяйте ответы сервера

## 🔒 Безопасность

- Не передавайте чувствительные данные в `deviceInfo`
- Используйте HTTPS для всех запросов
- Валидируйте `userId` на стороне клиента
- Логируйте ошибки для отладки

Теперь ваше мобильное приложение готово для работы с новой системой связывания!
