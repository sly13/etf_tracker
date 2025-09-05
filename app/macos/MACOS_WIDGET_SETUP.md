# Настройка виджета для macOS

## Пошаговая инструкция

### Шаг 1: Открытие проекта в Xcode

```bash
cd /Users/vadimsemenko/Programming/ideas/etf_app/app/macos
open Runner.xcworkspace
```

### Шаг 2: Создание Widget Extension Target

1. В Xcode выберите **File → New → Target**
2. В разделе **macOS** выберите **Widget Extension**
3. Настройте target:
   - **Product Name**: `ETFTrackerMacWidget`
   - **Language**: Swift
   - **Platform**: macOS
   - **Include Configuration Intent**: Не отмечено
4. Нажмите **Finish**

### Шаг 3: Замена файлов виджета

После создания target, замените автоматически созданные файлы на наши:

1. **Удалите** созданные файлы:

   - `ETFTrackerMacWidget.swift`
   - `ETFTrackerMacWidgetBundle.swift`
   - `Info.plist`

2. **Добавьте** наши файлы:
   - Скопируйте `ETFTrackerMacWidget/ETFTrackerMacWidget.swift` в target
   - Скопируйте `ETFTrackerMacWidget/ETFTrackerMacWidgetBundle.swift` в target
   - Скопируйте `ETFTrackerMacWidget/Info.plist` в target

### Шаг 4: Настройка Bundle Identifier

1. Выберите target `ETFTrackerMacWidget`
2. В разделе **General** найдите **Bundle Identifier**
3. Установите: `com.yourcompany.etfapp.widget` (замените на ваш реальный bundle ID + `.widget`)

### Шаг 5: Настройка Capabilities

1. Выберите target `ETFTrackerMacWidget`
2. Перейдите в **Signing & Capabilities**
3. Добавьте следующие capabilities:
   - **App Groups** (если планируете обмен данными с основным приложением)
   - **Network Access** (для API запросов)

### Шаг 6: Настройка Info.plist

Убедитесь, что в `Info.plist` виджета есть правильные настройки:

```xml
<key>NSExtension</key>
<dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
</dict>
```

### Шаг 7: Сборка и тестирование

1. Выберите target `ETFTrackerMacWidget`
2. Выберите схему сборки (Debug/Release)
3. Нажмите **Cmd+R** для сборки
4. Если сборка успешна, виджет будет доступен в системе

### Шаг 8: Добавление виджета на рабочий стол

1. Нажмите правой кнопкой на рабочий стол
2. Выберите **Edit Widgets**
3. Найдите **ETF Flow Tracker**
4. Перетащите нужный размер на рабочий стол

## Возможные проблемы и решения

### Ошибка: "Widget Extension target requires macOS 11.0 or later"

**Решение**: В настройках target установите **Deployment Target** на macOS 11.0 или новее.

### Ошибка: "Bundle identifier conflicts"

**Решение**: Убедитесь, что Bundle Identifier виджета уникален и соответствует основному приложению с добавлением `.widget`.

### Виджет не отображается в списке

**Решение**:

1. Проверьте, что target правильно настроен
2. Убедитесь, что все файлы добавлены в target
3. Проверьте логи в Console.app

### Данные не загружаются

**Решение**:

1. Проверьте подключение к интернету
2. Убедитесь, что API endpoint доступен
3. Проверьте Network Access в capabilities

## Структура проекта после настройки

```
macos/
├── Runner.xcodeproj/
│   ├── project.pbxproj
│   └── ...
├── Runner/
│   ├── AppDelegate.swift
│   └── ...
├── ETFTrackerMacWidget/
│   ├── ETFTrackerMacWidget.swift
│   ├── ETFTrackerMacWidgetBundle.swift
│   ├── Info.plist
│   └── Assets.xcassets/
└── MACOS_WIDGET_SETUP.md
```

## Проверка работы

После успешной настройки:

1. Виджет должен появиться в списке доступных виджетов
2. Данные должны загружаться из API
3. Обновления должны происходить каждый час
4. Виджет должен корректно отображаться в разных размерах

## Дополнительные настройки

### Настройка обновлений

Виджет настроен на обновление каждый час. Для изменения частоты обновлений отредактируйте файл `ETFTrackerMacWidget.swift`:

```swift
let timeline = Timeline(entries: entries, policy: .after(Calendar.current.date(byAdding: .minute, value: 30, to: currentDate)!))
```

### Добавление иконок

Для добавления иконок виджета:

1. Добавьте изображения в `Assets.xcassets`
2. Настройте их для разных размеров
3. Обновите код виджета для использования кастомных иконок

### Настройка цветовой схемы

Виджет автоматически адаптируется к системной теме (светлая/темная). Для кастомных цветов отредактируйте соответствующие части кода.
