#!/bin/bash

echo "🚀 Настройка виджета ETF Flow Tracker для macOS"
echo "================================================"

# Проверяем, что мы в правильной директории
if [ ! -d "Runner.xcworkspace" ]; then
    echo "❌ Ошибка: Runner.xcworkspace не найден"
    echo "Убедитесь, что вы находитесь в папке macos проекта"
    exit 1
fi

# Проверяем наличие файлов виджета
if [ ! -d "ETFTrackerMacWidget" ]; then
    echo "❌ Ошибка: Папка ETFTrackerMacWidget не найдена"
    exit 1
fi

echo "✅ Файлы виджета найдены"
echo ""

echo "📋 Следующие шаги для завершения настройки:"
echo ""
echo "1. Откройте проект в Xcode:"
echo "   open Runner.xcworkspace"
echo ""
echo "2. Создайте Widget Extension Target:"
echo "   - File → New → Target"
echo "   - Выберите Widget Extension (macOS)"
echo "   - Назовите ETFTrackerMacWidget"
echo "   - Нажмите Finish"
echo ""
echo "3. Замените созданные файлы на наши:"
echo "   - Удалите созданные ETFTrackerMacWidget.swift, ETFTrackerMacWidgetBundle.swift, Info.plist"
echo "   - Добавьте наши файлы из папки ETFTrackerMacWidget/"
echo ""
echo "4. Настройте Bundle Identifier:"
echo "   - com.yourcompany.etfapp.widget"
echo ""
echo "5. Установите Deployment Target на macOS 11.0+"
echo ""
echo "6. Добавьте Network Access в Capabilities"
echo ""
echo "7. Соберите проект (Cmd+R)"
echo ""
echo "📖 Подробная инструкция: XCODE_INTEGRATION.md"
echo "⚡ Быстрый старт: QUICK_START.md"
echo ""

# Открываем проект в Xcode
echo "🔧 Открываю проект в Xcode..."
open Runner.xcworkspace

echo ""
echo "🎉 Готово! Следуйте инструкциям выше для завершения настройки."
