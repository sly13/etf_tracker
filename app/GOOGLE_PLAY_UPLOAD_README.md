# Инструкция по загрузке в Google Play

## Созданные файлы

✅ **AAB файл готов для загрузки**: `build/app/outputs/bundle/release/app-release.aab` (53.2MB)

## Информация о приложении

- **Application ID**: `com.etfapp.etf_app`
- **Версия**: `1.0.1+40` (versionName: 1.0.1, versionCode: 40)
- **Название**: ETF Flow: Bitcoin & Ethereum
- **Описание**: Application for tracking Ethereum and Bitcoin ETF flows

## Что было настроено

1. ✅ Создан keystore для подписи приложения
2. ✅ Настроена конфигурация подписи в build.gradle.kts
3. ✅ Отключена минификация для избежания проблем с R8
4. ✅ Включен core library desugaring для совместимости
5. ✅ Обновлены зависимости (особенно vibration plugin)

## Следующие шаги для загрузки в Google Play

1. **Перейдите в Google Play Console**: https://play.google.com/console
2. **Создайте новое приложение** или выберите существующее
3. **Загрузите AAB файл** в разделе "Release" → "Production"
4. **Заполните информацию о приложении**:
   - Название: ETF Flow: Bitcoin & Ethereum
   - Краткое описание: Приложение для отслеживания потоков ETF Bitcoin и Ethereum
   - Полное описание: Детальное описание функций приложения
   - Скриншоты и иконки
5. **Настройте контент-рейтинг** и политики конфиденциальности
6. **Отправьте на модерацию**

## Важные файлы для сохранения

⚠️ **ОБЯЗАТЕЛЬНО СОХРАНИТЕ**:

- `android/etf-app-release-key.keystore` - ключ для подписи
- `android/key.properties` - пароли и настройки

**БЕЗ ЭТИХ ФАЙЛОВ ВЫ НЕ СМОЖЕТЕ ОБНОВИТЬ ПРИЛОЖЕНИЕ!**

## Размер файла

AAB файл: 53.2MB - это нормальный размер для Flutter приложения с Firebase и другими зависимостями.

