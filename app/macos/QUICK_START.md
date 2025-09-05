# Быстрый старт: Виджет для macOS

## Что нужно сделать

### 1. Откройте проект в Xcode

```bash
cd /Users/vadimsemenko/Programming/ideas/etf_app/app/macos
open Runner.xcworkspace
```

### 2. Создайте Widget Extension Target

1. **File → New → Target**
2. Выберите **Widget Extension** (macOS)
3. Назовите `ETFTrackerMacWidget`
4. Нажмите **Finish**

### 3. Замените файлы

Удалите созданные файлы и добавьте наши из папки `ETFTrackerMacWidget/`:

- `ETFTrackerMacWidget.swift`
- `ETFTrackerMacWidgetBundle.swift`
- `Info.plist`

### 4. Настройте Bundle Identifier

Установите: `com.yourcompany.etfapp.widget`

### 5. Соберите проект

Выберите target `ETFTrackerMacWidget` и нажмите **Cmd+R**

### 6. Добавьте виджет на рабочий стол

1. Правый клик на рабочий стол
2. **Edit Widgets**
3. Найдите **ETF Flow Tracker**
4. Перетащите нужный размер

## Готово! 🎉

Виджет будет отображать данные о потоках Bitcoin и Ethereum ETF с обновлением каждый час.

Подробная инструкция: [MACOS_WIDGET_SETUP.md](MACOS_WIDGET_SETUP.md)
