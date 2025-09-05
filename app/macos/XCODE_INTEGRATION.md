# Интеграция виджета в Xcode проект

## Пошаговая инструкция для Xcode

### Шаг 1: Создание Widget Extension Target

1. В Xcode выберите **File → New → Target**
2. В левой панели выберите **macOS**
3. Найдите и выберите **Widget Extension**
4. Нажмите **Next**

### Шаг 2: Настройка Target

Заполните поля:

- **Product Name**: `ETFTrackerMacWidget`
- **Language**: Swift
- **Platform**: macOS
- **Include Configuration Intent**: ❌ (не отмечено)
- **Embed in Application**: выберите ваше основное приложение

Нажмите **Finish**

### Шаг 3: Удаление созданных файлов

После создания target, Xcode автоматически создаст несколько файлов. Удалите их:

1. В навигаторе проекта найдите папку `ETFTrackerMacWidget`
2. Удалите следующие файлы:
   - `ETFTrackerMacWidget.swift`
   - `ETFTrackerMacWidgetBundle.swift`
   - `Info.plist`

### Шаг 4: Добавление наших файлов

1. Правый клик на папку `ETFTrackerMacWidget` в навигаторе
2. Выберите **Add Files to [Project Name]**
3. Найдите и выберите наши файлы из папки `ETFTrackerMacWidget/`:
   - `ETFTrackerMacWidget.swift`
   - `ETFTrackerMacWidgetBundle.swift`
   - `Info.plist`
4. Убедитесь, что выбран target `ETFTrackerMacWidget`
5. Нажмите **Add**

### Шаг 5: Настройка Bundle Identifier

1. Выберите target `ETFTrackerMacWidget` в навигаторе
2. Перейдите в раздел **General**
3. Найдите **Bundle Identifier**
4. Установите: `com.yourcompany.etfapp.widget`
   (замените на ваш реальный bundle ID + `.widget`)

### Шаг 6: Настройка Deployment Target

1. В том же разделе **General**
2. Найдите **Deployment Target**
3. Установите **macOS 11.0** или новее

### Шаг 7: Настройка Capabilities

1. Перейдите в раздел **Signing & Capabilities**
2. Нажмите **+ Capability**
3. Добавьте:
   - **App Groups** (если планируете обмен данными)
   - **Network Access** (для API запросов)

### Шаг 8: Проверка настроек Info.plist

1. Откройте `Info.plist` в target виджета
2. Убедитесь, что есть секция:
   ```xml
   <key>NSExtension</key>
   <dict>
       <key>NSExtensionPointIdentifier</key>
       <string>com.apple.widgetkit-extension</string>
   </dict>
   ```

### Шаг 9: Сборка и тестирование

1. Выберите target `ETFTrackerMacWidget` в схеме сборки
2. Нажмите **Cmd+R** для сборки
3. Если сборка успешна, виджет готов к использованию

## Проверка работы

### Добавление виджета на рабочий стол

1. Нажмите правой кнопкой на рабочий стол
2. Выберите **Edit Widgets**
3. Найдите **ETF Flow Tracker**
4. Перетащите нужный размер на рабочий стол

### Проверка обновлений

Виджет должен:

- Отображать данные о потоках ETF
- Обновляться каждый час
- Показывать правильные цвета (зеленый для inflow, красный для outflow)

## Устранение неполадок

### Ошибка компиляции

**Проблема**: "Use of unresolved identifier 'WidgetKit'"
**Решение**: Убедитесь, что Deployment Target установлен на macOS 11.0+

### Виджет не появляется

**Проблема**: Виджет не отображается в списке
**Решение**:

1. Проверьте Bundle Identifier
2. Убедитесь, что все файлы добавлены в target
3. Пересоберите проект

### Данные не загружаются

**Проблема**: Виджет показывает placeholder данные
**Решение**:

1. Проверьте подключение к интернету
2. Убедитесь, что API endpoint доступен
3. Проверьте Network Access в capabilities

## Дополнительные настройки

### Изменение частоты обновлений

Откройте `ETFTrackerMacWidget.swift` и найдите строку:

```swift
let timeline = Timeline(entries: entries, policy: .after(Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!))
```

Измените `.hour` на `.minute` и `value: 1` на нужное количество минут.

### Добавление кастомных иконок

1. Добавьте изображения в `Assets.xcassets`
2. Настройте их для разных размеров (1x, 2x, 3x)
3. Обновите код виджета для использования кастомных иконок

### Настройка цветов

Виджет автоматически адаптируется к системной теме. Для кастомных цветов отредактируйте соответствующие части кода в `ETFTrackerMacWidget.swift`.
