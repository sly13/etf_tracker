# ETF Flow Tracker Widget для macOS

Этот виджет для macOS отображает данные о потоках Bitcoin и Ethereum ETF в реальном времени.

## Возможности

- Отображение общего потока ETF
- Детализация по Bitcoin и Ethereum
- Индикаторы направления потока (Inflow/Outflow)
- Автоматическое обновление каждый час
- Поддержка трех размеров: Small, Medium, Large

## Установка и настройка

### 1. Добавление виджета в Xcode проект

1. Откройте проект macOS в Xcode: `open Runner.xcworkspace`
2. В навигаторе проекта нажмите правой кнопкой на папку проекта
3. Выберите "Add Files to [Project Name]"
4. Добавьте папку `ETFTrackerMacWidget`

### 2. Настройка Target

1. В Xcode выберите File → New → Target
2. Выберите "Widget Extension" под macOS
3. Назовите target "ETFTrackerMacWidget"
4. Убедитесь, что выбран язык Swift и платформа macOS

### 3. Замена файлов

Замените созданные файлы на наши:

- `ETFTrackerMacWidget.swift` - основной файл виджета
- `ETFTrackerMacWidgetBundle.swift` - bundle файл
- `Info.plist` - конфигурация

### 4. Настройка Bundle Identifier

Убедитесь, что Bundle Identifier виджета соответствует основному приложению с добавлением `.widget`:

```
com.yourcompany.etfapp.widget
```

### 5. Настройка Capabilities

В настройках target виджета:

1. Перейдите в Signing & Capabilities
2. Добавьте App Groups если необходимо для обмена данными
3. Убедитесь, что Network Access включен

## Структура файлов

```
ETFTrackerMacWidget/
├── ETFTrackerMacWidget.swift          # Основной файл виджета
├── ETFTrackerMacWidgetBundle.swift    # Bundle файл
├── Info.plist                         # Конфигурация
├── Assets.xcassets/                   # Ресурсы (если нужны)
└── README.md                          # Этот файл
```

## API Endpoint

Виджет использует API endpoint: `https://etf-flow.vadimsemenko.ru/etf-flow/summary`

## Размеры виджета

- **Small**: Компактное отображение основного потока
- **Medium**: Детализированное отображение с разделением по криптовалютам
- **Large**: Полная информация с дополнительными деталями

## Сборка и тестирование

1. Выберите target ETFTrackerMacWidget
2. Нажмите Cmd+R для сборки и запуска
3. Виджет появится в Notification Center или на рабочем столе (в зависимости от настроек)

## Добавление на рабочий стол

1. Нажмите правой кнопкой на рабочий стол
2. Выберите "Edit Widgets"
3. Найдите "ETF Flow Tracker"
4. Перетащите нужный размер на рабочий стол

## Устранение неполадок

### Виджет не отображается

- Проверьте Bundle Identifier
- Убедитесь, что target правильно настроен
- Проверьте логи в Console.app

### Данные не загружаются

- Проверьте подключение к интернету
- Убедитесь, что API endpoint доступен
- Проверьте Network Access в capabilities

### Ошибки компиляции

- Убедитесь, что все файлы добавлены в target
- Проверьте импорты SwiftUI и WidgetKit
- Убедитесь, что используется macOS 11.0+ (для WidgetKit)

## Требования

- macOS 11.0 или новее
- Xcode 12.0 или новее
- Swift 5.3 или новее
