# IBM Plex Mono Font Setup Instructions

## Шаг 1: Загрузка шрифтов

1. Перейдите на [Google Fonts - IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)
2. Нажмите "Download family" для загрузки всех вариантов шрифта
3. Распакуйте архив в папку `app/fonts/`

## Шаг 2: Переименование файлов

Переименуйте загруженные файлы следующим образом:

```
IBMPlexMono-Regular.ttf     (обычный)
IBMPlexMono-Medium.ttf      (средний)
IBMPlexMono-SemiBold.ttf    (полужирный)
IBMPlexMono-Bold.ttf        (жирный)
```

## Шаг 3: Удаление лишних файлов

Удалите следующие файлы для уменьшения размера приложения:

```bash
# Удаляем тонкие и светлые варианты
rm IBMPlexMono-Thin.ttf IBMPlexMono-ThinItalic.ttf
rm IBMPlexMono-ExtraLight.ttf IBMPlexMono-ExtraLightItalic.ttf
rm IBMPlexMono-Light.ttf IBMPlexMono-LightItalic.ttf

# Удаляем курсивные варианты
rm IBMPlexMono-Italic.ttf IBMPlexMono-MediumItalic.ttf
rm IBMPlexMono-SemiBoldItalic.ttf IBMPlexMono-BoldItalic.ttf
```

## Шаг 4: Проверка структуры папок

Убедитесь, что структура папок выглядит так:

```
app/
├── fonts/
│   ├── IBMPlexMono-Regular.ttf
│   ├── IBMPlexMono-Medium.ttf
│   ├── IBMPlexMono-SemiBold.ttf
│   └── IBMPlexMono-Bold.ttf
├── lib/
└── pubspec.yaml
```

## Шаг 5: Обновление зависимостей

Выполните команду для обновления зависимостей:

```bash
cd app
flutter pub get
```

## Шаг 6: Тестирование

После загрузки шрифтов приложение автоматически будет использовать IBM Plex Mono для:
- Цен и финансовых данных
- Процентов изменений
- Объемов и метрик
- Дат и времени

## Fallback

Если шрифт не загружен, приложение автоматически использует системный моноширинный шрифт как fallback.

## Использование в коде

```dart
// Для финансовых данных
Text(
  '\$1,234.56',
  style: AdaptiveTextUtils.createAdaptiveFinancialStyle(
    context,
    'headlineMedium',
    fontWeight: FontWeight.bold,
  ),
)

// Прямое использование
Text(
  'Price: \$100.00',
  style: FontUtils.getPriceStyle(
    fontSize: 18.0,
    color: Colors.green,
  ),
)
```

## Размер файлов

После оптимизации размер шрифтов составляет:
- IBMPlexMono-Regular.ttf: ~134KB
- IBMPlexMono-Medium.ttf: ~135KB  
- IBMPlexMono-SemiBold.ttf: ~138KB
- IBMPlexMono-Bold.ttf: ~136KB
- **Общий размер: ~543KB** (вместо ~1.8MB)