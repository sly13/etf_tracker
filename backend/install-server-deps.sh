#!/bin/bash

echo "🔧 Установка системных зависимостей для ETF Tracker Backend..."

# Определяем тип системы
if [ -f /etc/debian_version ]; then
    echo "📦 Обнаружена Debian/Ubuntu система"
    
    # Обновляем пакеты
    echo "🔄 Обновление списка пакетов..."
    sudo apt-get update
    
    # Устанавливаем необходимые зависимости для Chrome
    echo "📥 Установка зависимостей для Chrome..."
    sudo apt-get install -y \
        ca-certificates \
        fonts-liberation \
        libappindicator3-1 \
        libasound2 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdbus-1-3 \
        libdrm2 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        xdg-utils \
        libxss1 \
        libxtst6 \
        libx11-xcb1 \
        libxcb-dri3-0 \
        libdrm2 \
        libgbm1 \
        wget \
        gnupg \
        unzip
    
    # Устанавливаем Google Chrome
    echo "🌐 Установка Google Chrome..."
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
    sudo apt-get update
    sudo apt-get install -y google-chrome-stable
    
elif [ -f /etc/redhat-release ]; then
    echo "📦 Обнаружена RedHat/CentOS система"
    
    # Устанавливаем EPEL репозиторий
    sudo yum install -y epel-release
    
    # Устанавливаем зависимости
    sudo yum install -y \
        nss \
        nspr \
        gtk3 \
        libXcomposite \
        libXcursor \
        libXdamage \
        libXext \
        libXi \
        libXrandr \
        libXScrnSaver \
        libXtst \
        cups-libs \
        libXss \
        alsa-lib \
        pango \
        atk \
        atk-bridge-atk \
        cairo \
        gdk-pixbuf2 \
        libdrm \
        mesa-libgbm \
        wget \
        unzip
    
    # Устанавливаем Google Chrome
    echo "🌐 Установка Google Chrome..."
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
    sudo yum localinstall -y google-chrome-stable_current_x86_64.rpm
    rm google-chrome-stable_current_x86_64.rpm
    
else
    echo "❌ Неподдерживаемая система. Установите зависимости вручную."
    exit 1
fi

# Проверяем установку Chrome
if command -v google-chrome-stable &> /dev/null; then
    echo "✅ Google Chrome успешно установлен"
    google-chrome-stable --version
else
    echo "❌ Ошибка установки Google Chrome"
    exit 1
fi

# Создаем папку для логов
echo "📁 Создание папки для логов..."
mkdir -p logs

# Устанавливаем права на скрипты
echo "🔐 Установка прав на скрипты..."
chmod +x start-pm2.sh stop-pm2.sh

echo ""
echo "🎉 Установка зависимостей завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Пересоберите проект: npm run build"
echo "2. Запустите через PM2: ./start-pm2.sh"
echo ""
echo "🌐 Приложение будет доступно по адресу: http://localhost:3066"
