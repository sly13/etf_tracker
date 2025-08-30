# Настройка переменных окружения

## Автоматическое определение окружения

Приложение автоматически определяет, какое окружение использовать:

- **Режим отладки (Debug)** → Использует локальный бэкенд: `http://localhost:3066`
- **Режим релиза (Release)** → Использует продакшн бэкенд: `https://etf-flow.vadimsemenko.ru`

## Как это работает

### 1. Автоматическое переключение

```dart
// В режиме отладки (flutter run)
AppConfig.backendBaseUrl // → http://localhost:3066

// В режиме релиза (flutter build)
AppConfig.backendBaseUrl // → https://etf-flow.vadimsemenko.ru
```

### 2. Использование в сервисах

```dart
// Автоматически получает правильный URL
final response = await http.get(Uri.parse(AppConfig.getApiUrl('/etf-flow/eth')));
```

## Принудительное переключение

Если нужно принудительно использовать определенный бэкенд:

```dart
// Принудительно локальный
AppConfig.getLocalBackendUrl('/etf-flow/eth')

// Принудительно продакшн
AppConfig.getProductionBackendUrl('/etf-flow/eth')
```

## Проверка текущего окружения

```dart
print(AppConfig.environmentInfo);
// Выведет: "Development (Local Backend: http://localhost:3066)"
// или: "Production (Server Backend: https://etf-flow.vadimsemenko.ru)"
```

## Настройка для разработки

### Локальный бэкенд

1. Запустите бэкенд локально на порту 3066
2. Запустите Flutter приложение в режиме отладки: `flutter run`
3. Приложение автоматически подключится к `localhost:3066`

### Продакшн бэкенд

1. Запустите Flutter приложение в режиме релиза: `flutter build`
2. Приложение автоматически подключится к продакшн серверу

## Структура файлов

```
app/
├── lib/
│   ├── config/
│   │   └── app_config.dart      # Конфигурация приложения
│   ├── services/
│   │   └── etf_service.dart     # Сервис с API вызовами
│   └── ...
└── ENVIRONMENT_SETUP.md         # Эта документация
```

## Примеры использования

### В ETFService

```dart
class ETFService {
  Future<List<ETFFlowData>> getEthereumData() async {
    final response = await http.get(
      Uri.parse(AppConfig.getApiUrl('/etf-flow/eth'))
    );
    // ... остальной код
  }
}
```

### В других частях приложения

```dart
// Получить базовый URL
String baseUrl = AppConfig.backendBaseUrl;

// Получить полный URL для эндпоинта
String apiUrl = AppConfig.getApiUrl('/etf-flow/summary');

// Проверить режим
if (AppConfig.isDebugMode) {
  print('Запущено в режиме отладки');
}
```
