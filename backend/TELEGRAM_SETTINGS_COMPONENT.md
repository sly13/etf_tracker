# 📱 Компонент настроек Telegram для мобильного приложения

## 🎯 Задача

Добавить в раздел "Subscription Status" кнопку "Получать уведомления в Telegram", которая:

1. Генерирует ссылку с уникальным `deviceId`
2. Открывает Telegram бота с автоматической привязкой
3. Показывает статус подключения

## 📱 React Native компонент

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';

const TelegramSettings = ({ deviceId, userId }) => {
  const [isLinked, setIsLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkTelegramStatus();
  }, []);

  const checkTelegramStatus = async () => {
    try {
      const response = await fetch(
        `https://your-backend.com/applications/user/${deviceId}`,
      );
      const result = await response.json();

      if (result.success && result.user.enableTelegramNotifications) {
        setIsLinked(true);
      }
    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
    }
  };

  const openTelegramBot = async () => {
    if (!deviceId) {
      Alert.alert('Ошибка', 'Device ID не найден');
      return;
    }

    setIsLoading(true);

    try {
      const botUrl = `https://t.me/your_bot_username?start=${deviceId}`;

      const canOpen = await Linking.canOpenURL(botUrl);
      if (canOpen) {
        await Linking.openURL(botUrl);

        Alert.alert(
          'Инструкции',
          'Telegram откроется автоматически. Отправьте команду /start боту для привязки аккаунта.',
          [{ text: 'Понятно' }],
        );
      } else {
        Alert.alert('Ошибка', 'Не удалось открыть Telegram');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось открыть Telegram');
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkTelegram = async () => {
    try {
      const response = await fetch(
        'https://your-backend.com/applications/unlink-telegram',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceToken: 'your_fcm_token' }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setIsLinked(false);
        Alert.alert('Успех', 'Telegram аккаунт отвязан');
      } else {
        Alert.alert('Ошибка', result.message);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отвязать аккаунт');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Subscription Status</Text>

      <View style={styles.telegramSection}>
        <View style={styles.telegramHeader}>
          <Text style={styles.telegramTitle}>Telegram Notifications</Text>
          {isLinked && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Connected</Text>
            </View>
          )}
        </View>

        <Text style={styles.telegramDescription}>
          Get real-time ETF flow updates directly in Telegram
        </Text>

        {isLinked ? (
          <TouchableOpacity
            style={[styles.button, styles.unlinkButton]}
            onPress={unlinkTelegram}
          >
            <Text style={styles.unlinkButtonText}>Disconnect Telegram</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.linkButton]}
            onPress={openTelegramBot}
            disabled={isLoading}
          >
            <Text style={styles.linkButtonText}>
              {isLoading ? 'Opening...' : 'Connect Telegram'}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.deviceIdText}>Device ID: {deviceId}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  telegramSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  telegramHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  telegramTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  telegramDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  linkButton: {
    backgroundColor: '#0088cc',
  },
  unlinkButton: {
    backgroundColor: '#ff4444',
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  unlinkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  deviceIdText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});

export default TelegramSettings;
```

## 📱 Flutter компонент

```dart
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class TelegramSettings extends StatefulWidget {
  final String deviceId;
  final String userId;

  const TelegramSettings({
    Key? key,
    required this.deviceId,
    required this.userId,
  }) : super(key: key);

  @override
  _TelegramSettingsState createState() => _TelegramSettingsState();
}

class _TelegramSettingsState extends State<TelegramSettings> {
  bool isLinked = false;
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    checkTelegramStatus();
  }

  Future<void> checkTelegramStatus() async {
    try {
      final response = await http.get(
        Uri.parse('https://your-backend.com/applications/user/${widget.deviceId}'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] && data['user']['enableTelegramNotifications']) {
          setState(() {
            isLinked = true;
          });
        }
      }
    } catch (error) {
      print('Ошибка проверки статуса: $error');
    }
  }

  Future<void> openTelegramBot() async {
    if (widget.deviceId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Device ID не найден')),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
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
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Не удалось открыть Telegram')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> unlinkTelegram() async {
    try {
      final response = await http.post(
        Uri.parse('https://your-backend.com/applications/unlink-telegram'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'deviceToken': 'your_fcm_token'}),
      );

      final result = jsonDecode(response.body);

      if (result['success']) {
        setState(() {
          isLinked = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Telegram аккаунт отвязан')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'])),
        );
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Не удалось отвязать аккаунт')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Subscription Status',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 20),

          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Color(0xFF2A2A2A),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Telegram Notifications',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    if (isLinked)
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.green,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'Connected',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                  ],
                ),
                SizedBox(height: 8),
                Text(
                  'Get real-time ETF flow updates directly in Telegram',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFFCCCCCC),
                    height: 1.4,
                  ),
                ),
                SizedBox(height: 16),

                if (isLinked)
                  ElevatedButton(
                    onPressed: unlinkTelegram,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      padding: EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      'Disconnect Telegram',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  )
                else
                  ElevatedButton(
                    onPressed: isLoading ? null : openTelegramBot,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xFF0088CC),
                      padding: EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      isLoading ? 'Opening...' : 'Connect Telegram',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),

                SizedBox(height: 12),
                Text(
                  'Device ID: ${widget.deviceId}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF666666),
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

## 🔧 Интеграция в главный экран настроек

```javascript
// В главном компоненте настроек
import TelegramSettings from './TelegramSettings';

const SettingsScreen = () => {
  const [deviceId, setDeviceId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Получаем deviceId и userId из локального хранилища или API
    getDeviceInfo();
  }, []);

  const getDeviceInfo = async () => {
    try {
      const response = await fetch('/applications/register-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: fcmToken,
          appName: 'etf.flow',
          userId: currentUser.id,
          deviceId: generateDeviceId(), // Генерируем уникальный ID
          deviceInfo: { ... }
        })
      });

      const result = await response.json();
      if (result.success) {
        setDeviceId(result.deviceId);
        setUserId(result.userId);
      }
    } catch (error) {
      console.error('Ошибка получения deviceId:', error);
    }
  };

  const generateDeviceId = () => {
    // Генерируем уникальный ID устройства
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        {/* ... существующие настройки ... */}
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        {/* ... существующие настройки ... */}
      </View>

      {/* Subscription Status Section */}
      {deviceId && (
        <TelegramSettings
          deviceId={deviceId}
          userId={userId}
        />
      )}
    </ScrollView>
  );
};
```

## 🎯 Как это работает

1. **При первом запуске приложения:**
   - Генерируется уникальный `deviceId`
   - Отправляется запрос на регистрацию устройства
   - `deviceId` сохраняется локально

2. **При нажатии "Connect Telegram":**
   - Формируется ссылка: `https://t.me/your_bot_username?start=${deviceId}`
   - Открывается Telegram с автоматической передачей параметра
   - Пользователь отправляет `/start` боту
   - Бот автоматически привязывает аккаунт

3. **Статус подключения:**
   - Показывается badge "Connected" если Telegram привязан
   - Кнопка меняется на "Disconnect Telegram"
   - Отображается Device ID для отладки

## 🔒 Безопасность

- `deviceId` уникален для каждого устройства
- Ссылка содержит только `deviceId`, никаких чувствительных данных
- Валидация на стороне сервера
- Логирование всех операций привязки

Теперь пользователи смогут легко подключить Telegram уведомления прямо из настроек приложения!
