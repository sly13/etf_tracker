# ⚡ Быстрая установка ETF Flow Tracker

## 📦 Что у вас есть

- `ETF_Flow_Tracker.dmg` - установочный файл
- `ETFTrackerMacWidget/` - файлы виджета

## 🚀 Установка (2 минуты)

### 1. Установите приложение

```bash
# Откройте DMG
open ETF_Flow_Tracker.dmg

# Перетащите в Applications
# Запустите приложение
```

### 2. Настройте виджет

```bash
# Откройте проект
open Runner.xcworkspace

# В Xcode:
# File → New → Target → Widget Extension (macOS)
# Назовите: ETFTrackerMacWidget
# Замените файлы на наши из ETFTrackerMacWidget/
# Настройте Bundle Identifier
# Добавьте Network Access
# Соберите (Cmd+R)
```

### 3. Добавьте виджет

- Правый клик на рабочий стол
- Edit Widgets
- Найдите "ETF Flow Tracker"
- Перетащите нужный размер

## ✅ Готово!

Виджет будет показывать данные о потоках Bitcoin и Ethereum ETF с обновлением каждый час.

**Подробная инструкция**: [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
