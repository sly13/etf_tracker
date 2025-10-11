# Инструкция по установке

## Быстрая установка

```bash
# 1. Переход в директорию проекта
cd trade-model

# 2. Создание виртуального окружения
python3 -m venv venv

# 3. Активация виртуального окружения
source venv/bin/activate

# 4. Установка зависимостей
pip install -r requirements.txt

# 5. Настройка конфигурации
cp env.example .env
# Отредактируйте .env с параметрами подключения к базе данных

# 6. Проверка установки
python test_setup.py

# 7. Демонстрация работы
python example_usage.py
```

## Пошаговая установка

### 1. Проверка Python

Убедитесь, что у вас установлен Python 3.11 или выше:

```bash
python3 --version
```

### 2. Создание виртуального окружения

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Установка зависимостей

```bash
# Обновление pip
pip install --upgrade pip

# Установка зависимостей
pip install -r requirements.txt
```

### 4. Настройка конфигурации

```bash
# Копирование примера конфигурации
cp env.example .env

# Редактирование конфигурации
nano .env  # или любой другой редактор
```

Настройте параметры подключения к базе данных в файле `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=etf_tracker
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 5. Проверка установки

```bash
python test_setup.py
```

Все проверки должны пройти успешно.

### 6. Демонстрация работы

```bash
python example_usage.py
```

## Использование

### Обучение модели

```bash
python train.py
```

### Выполнение прогноза

```bash
python predict.py
```

## Устранение проблем

### Ошибка "No module named 'xgboost'"

```bash
pip install xgboost
```

### Ошибка "No module named 'psycopg2'"

```bash
pip install psycopg2-binary
```

### Ошибки на macOS M1/M2

```bash
# Установка с поддержкой Apple Silicon
pip install --upgrade pip
pip install xgboost --no-cache-dir
```

### Проблемы с зависимостями

```bash
# Переустановка всех зависимостей
pip install -r requirements.txt --force-reinstall --no-cache-dir
```

## Структура проекта после установки

```
trade-model/
├── venv/                 # Виртуальное окружение
├── data/                 # Данные
├── models/               # Обученные модели
├── .env                  # Конфигурация (создается после копирования)
├── db.py                 # Подключение к БД
├── train.py              # Обучение модели
├── predict.py            # Прогнозирование
├── test_setup.py         # Проверка установки
├── example_usage.py      # Демонстрация
├── requirements.txt      # Зависимости
├── env.example           # Пример конфигурации
├── README.md             # Документация
└── INSTALL.md            # Эта инструкция
```

## Следующие шаги

1. Настройте подключение к базе данных PostgreSQL
2. Убедитесь, что в базе есть данные о Биткоине и ETF потоках
3. Запустите обучение модели: `python train.py`
4. Выполните прогноз: `python predict.py`

## Поддержка

При возникновении проблем:

1. Проверьте логи ошибок
2. Убедитесь, что все зависимости установлены
3. Проверьте настройки подключения к базе данных
4. Обратитесь к документации в README.md
