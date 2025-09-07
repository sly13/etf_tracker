# 📱 Добавление кнопки Telegram в настройки приложения

## 🎯 Где добавить кнопку

В разделе **"Subscription Status"** (который сейчас пустой) нужно добавить кнопку для подключения Telegram.

## 📱 Код для добавления в настройки

### React Native (если используете React Native)

```javascript
// В файле настроек приложения
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [deviceId, setDeviceId] = useState(null);
  const [isTelegramLinked, setIsTelegramLinked] = useState(false);

  useEffect(() => {
    loadDeviceId();
    checkTelegramStatus();
  }, []);

  // Загрузка Device ID из локального хранилища
  const loadDeviceId = async () => {
    try {
      const savedDeviceId = await AsyncStorage.getItem('deviceId');
      if (savedDeviceId) {
        setDeviceId(savedDeviceId);
      } else {
        // Генерируем новый Device ID
        const newDeviceId = generateDeviceId();
        setDeviceId(newDeviceId);
        await AsyncStorage.setItem('deviceId', newDeviceId);

        // Регистрируем устройство на сервере
        await registerDevice(newDeviceId);
      }
    } catch (error) {
      console.error('Ошибка загрузки Device ID:', error);
    }
  };

  // Генерация уникального Device ID
  const generateDeviceId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `device_${timestamp}_${random}`;
  };

  // Регистрация устройства на сервере
  const registerDevice = async (deviceId) => {
    try {
      const response = await fetch(
        'https://your-backend.com/applications/register-device',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: 'your_fcm_token', // Получить из Firebase
            appName: 'etf.flow',
            userId: 'user_12345', // Получить из локального хранилища
            deviceId: deviceId,
            deviceInfo: {
              deviceType: Platform.OS,
              appVersion: '1.0.0',
              firstName: 'Иван',
              lastName: 'Петров',
              email: 'ivan@example.com',
            },
          }),
        },
      );

      const result = await response.json();
      if (result.success) {
        console.log('✅ Устройство зарегистрировано:', deviceId);
      }
    } catch (error) {
      console.error('Ошибка регистрации устройства:', error);
    }
  };

  // Проверка статуса Telegram
  const checkTelegramStatus = async () => {
    if (!deviceId) return;

    try {
      const response = await fetch(
        `https://your-backend.com/applications/user/${deviceId}`,
      );
      const result = await response.json();

      if (result.success && result.user.enableTelegramNotifications) {
        setIsTelegramLinked(true);
      }
    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
    }
  };

  // Открытие Telegram бота
  const openTelegramBot = async () => {
    if (!deviceId) {
      Alert.alert('Ошибка', 'Device ID не найден');
      return;
    }

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
    }
  };

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.proBadge}>
          <Text style={styles.proText}>Pro</Text>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        {/* Ваши существующие настройки темы */}
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        {/* Ваши существующие настройки языка */}
      </View>

      {/* Subscription Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription Status</Text>

        {/* Telegram Settings */}
        <View style={styles.telegramSection}>
          <View style={styles.telegramHeader}>
            <Text style={styles.telegramTitle}>Telegram Notifications</Text>
            {isTelegramLinked && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Connected</Text>
              </View>
            )}
          </View>

          <Text style={styles.telegramDescription}>
            Get real-time ETF flow updates directly in Telegram
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              isTelegramLinked ? styles.unlinkButton : styles.linkButton,
            ]}
            onPress={openTelegramBot}
          >
            <Text style={styles.buttonText}>
              {isTelegramLinked ? 'Disconnect Telegram' : 'Connect Telegram'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.deviceIdText}>Device ID: {deviceId}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  proBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  proText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  telegramSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
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
  buttonText: {
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

export default SettingsScreen;
```

### Flutter (если используете Flutter)

```dart
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class SettingsScreen extends StatefulWidget {
  @override
  _SettingsScreenState createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String? deviceId;
  bool isTelegramLinked = false;

  @override
  void initState() {
    super.initState();
    loadDeviceId();
  }

  // Загрузка Device ID
  Future<void> loadDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    String? savedDeviceId = prefs.getString('deviceId');

    if (savedDeviceId != null) {
      setState(() {
        deviceId = savedDeviceId;
      });
      checkTelegramStatus();
    } else {
      // Генерируем новый Device ID
      String newDeviceId = generateDeviceId();
      setState(() {
        deviceId = newDeviceId;
      });
      await prefs.setString('deviceId', newDeviceId);
      await registerDevice(newDeviceId);
    }
  }

  // Генерация Device ID
  String generateDeviceId() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final random = (100000000 + (999999999 - 100000000) * DateTime.now().millisecond / 1000).round();
    return 'device_${timestamp}_$random';
  }

  // Регистрация устройства
  Future<void> registerDevice(String deviceId) async {
    try {
      final response = await http.post(
        Uri.parse('https://your-backend.com/applications/register-device'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'token': 'your_fcm_token',
          'appName': 'etf.flow',
          'userId': 'user_12345',
          'deviceId': deviceId,
          'deviceInfo': {
            'deviceType': 'android',
            'appVersion': '1.0.0',
            'firstName': 'Иван',
            'lastName': 'Петров',
            'email': 'ivan@example.com',
          }
        }),
      );

      if (response.statusCode == 200) {
        print('✅ Устройство зарегистрировано: $deviceId');
      }
    } catch (error) {
      print('Ошибка регистрации устройства: $error');
    }
  }

  // Проверка статуса Telegram
  Future<void> checkTelegramStatus() async {
    if (deviceId == null) return;

    try {
      final response = await http.get(
        Uri.parse('https://your-backend.com/applications/user/$deviceId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] && data['user']['enableTelegramNotifications']) {
          setState(() {
            isTelegramLinked = true;
          });
        }
      }
    } catch (error) {
      print('Ошибка проверки статуса: $error');
    }
  }

  // Открытие Telegram бота
  Future<void> openTelegramBot() async {
    if (deviceId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Device ID не найден')),
      );
      return;
    }

    try {
      final botUrl = 'https://t.me/your_bot_username?start=$deviceId';

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
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFF1A1A1A),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Settings',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Color(0xFFFFA500),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'Pro',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 30),

            // Appearance Section
            Text(
              'Appearance',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 15),
            // Ваши существующие настройки темы
            SizedBox(height: 30),

            // Language Section
            Text(
              'Language',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 15),
            // Ваши существующие настройки языка
            SizedBox(height: 30),

            // Subscription Status Section
            Text(
              'Subscription Status',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 15),

            // Telegram Settings
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
                      if (isTelegramLinked)
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
                  ElevatedButton(
                    onPressed: openTelegramBot,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isTelegramLinked ? Colors.red : Color(0xFF0088CC),
                      padding: EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      isTelegramLinked ? 'Disconnect Telegram' : 'Connect Telegram',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Device ID: $deviceId',
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
      ),
    );
  }
}
```

## 🎯 Что нужно сделать:

1. **Найти файл настроек** в вашем приложении
2. **Добавить код** в раздел "Subscription Status"
3. **Обновить URL бота** на ваш реальный бот
4. **Добавить зависимости** (AsyncStorage для React Native или shared_preferences для Flutter)

## 🔧 Быстрое добавление (минимальный код):

```javascript
// Просто добавьте это в раздел "Subscription Status"
<TouchableOpacity
  style={{
    backgroundColor: '#0088cc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  }}
  onPress={() => {
    const deviceId = 'device_12345'; // Ваш Device ID
    const botUrl = `https://t.me/your_bot_username?start=${deviceId}`;
    Linking.openURL(botUrl);
  }}
>
  <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
    📱 Получать уведомления в Telegram
  </Text>
</TouchableOpacity>
```

Теперь кнопка Telegram будет в разделе "Subscription Status"!
