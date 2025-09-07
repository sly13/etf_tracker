# 🚀 Быстрая интеграция Telegram настроек

## 📱 Что нужно добавить в мобильное приложение

### 1. В раздел "Subscription Status" добавить:

```javascript
// Кнопка для подключения Telegram
<TouchableOpacity style={styles.telegramButton} onPress={openTelegramBot}>
  <Text style={styles.telegramButtonText}>
    📱 Получать уведомления в Telegram
  </Text>
</TouchableOpacity>
```

### 2. Функция открытия Telegram:

```javascript
const openTelegramBot = async () => {
  const deviceId = 'device_abc123'; // Получить из регистрации
  const botUrl = `https://t.me/your_bot_username?start=${deviceId}`;

  await Linking.openURL(botUrl);

  Alert.alert(
    'Инструкции',
    'Telegram откроется автоматически. Отправьте команду /start боту для привязки аккаунта.',
  );
};
```

### 3. Регистрация устройства при первом запуске:

```javascript
// При запуске приложения
const registerDevice = async () => {
  const deviceId = generateDeviceId(); // Генерируем уникальный ID

  await fetch('/applications/register-device', {
    method: 'POST',
    body: JSON.stringify({
      token: fcmToken,
      appName: 'etf.flow',
      userId: currentUser.id,
      deviceId: deviceId,
      deviceInfo: { ... }
    })
  });

  // Сохраняем deviceId локально
  await AsyncStorage.setItem('deviceId', deviceId);
};
```

## 🎯 Полный flow:

1. **Пользователь открывает приложение** → генерируется `deviceId` → регистрация на сервере
2. **Пользователь идет в настройки** → видит кнопку "Получать уведомления в Telegram"
3. **Пользователь нажимает кнопку** → открывается Telegram с ссылкой `?start=deviceId`
4. **Пользователь отправляет `/start`** → бот автоматически привязывает аккаунт
5. **Пользователь получает уведомления** → все готово!

## 🔧 Минимальный код для интеграции:

```javascript
// 1. Генерация Device ID
const generateDeviceId = () => {
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 2. Регистрация устройства
const registerDevice = async (fcmToken, userInfo) => {
  const deviceId = generateDeviceId();

  await fetch('/applications/register-device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: fcmToken,
      appName: 'etf.flow',
      userId: userInfo.userId,
      deviceId: deviceId,
      deviceInfo: {
        deviceType: Platform.OS,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
      },
    }),
  });

  return deviceId;
};

// 3. Открытие Telegram
const openTelegramBot = async (deviceId) => {
  const botUrl = `https://t.me/your_bot_username?start=${deviceId}`;
  await Linking.openURL(botUrl);
};

// 4. Использование в компоненте
const TelegramButton = () => {
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    // Загружаем deviceId из локального хранилища
    AsyncStorage.getItem('deviceId').then((id) => {
      if (!id) {
        // Если нет, регистрируем новое устройство
        registerDevice(fcmToken, userInfo).then((id) => {
          setDeviceId(id);
          AsyncStorage.setItem('deviceId', id);
        });
      } else {
        setDeviceId(id);
      }
    });
  }, []);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => openTelegramBot(deviceId)}
    >
      <Text style={styles.buttonText}>📱 Получать уведомления в Telegram</Text>
    </TouchableOpacity>
  );
};
```

## 🎨 Стили для кнопки:

```javascript
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0088cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## ✅ Готово!

Теперь у вас есть:

- ✅ Кнопка "Получать уведомления в Telegram"
- ✅ Автоматическая генерация `deviceId`
- ✅ Регистрация устройства на сервере
- ✅ Открытие Telegram с параметром
- ✅ Автоматическая привязка через бота

Пользователи смогут легко подключить Telegram уведомления в один клик!
