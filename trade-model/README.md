# Bitcoin ETF Prediction Model

Модель машинного обучения для предсказания роста цены Биткоина на основе данных о притоках ETF.

## 🎯 Описание проекта

Этот проект реализует модель XGBoost, которая обучается предсказывать вероятность роста цены Биткоина на следующий день, используя:

- Данные о цене Биткоина (OHLCV)
- Данные о притоках ETF
- Технические индикаторы и признаки

## 📁 Структура проекта

```text
trade-model/
├── data/                # Кэш данных или CSV-экспорт
├── models/              # Обученные модели
├── train.py             # Скрипт обучения модели
├── predict.py           # Скрипт для прогнозирования
├── db.py                # Подключение к PostgreSQL
├── env.example          # Пример конфигурации
├── requirements.txt     # Зависимости Python
└── README.md           # Документация
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
# Создание виртуального окружения
python3 -m venv venv

# Активация виртуального окружения
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt
```

### 2. Настройка конфигурации

```bash
# Копирование примера конфигурации
cp env.example .env

# Редактирование конфигурации
nano .env
```

Настройте параметры подключения к базе данных в файле `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=etf_tracker
DB_USER=postgres
DB_PASSWORD=your_password_here

# Model Configuration
MODEL_VERSION=v1
MODEL_PATH=models/etf_model_v1.pkl
```

### 3. Обучение модели

```bash
python train.py
```

### 4. Выполнение прогноза

```bash
python predict.py
```

## 📊 Особенности модели

### Создаваемые признаки

1. **Returns (доходность)**

   - `return_prev`: Доходность за предыдущий день
   - `return_3d`: Доходность за 3 дня
   - `return_7d`: Доходность за 7 дней

2. **Volatility (волатильность)**

   - `volatility`: Скользящее стандартное отклонение доходности

3. **Moving Averages (скользящие средние)**

   - `ma_7`: Скользящее среднее за 7 дней
   - `ma_30`: Скользящее среднее за 30 дней
   - `price_to_ma7`: Отношение цены к MA7
   - `price_to_ma30`: Отношение цены к MA30

4. **ETF Flow features**

   - `etf_flow_change`: Изменение притока ETF
   - `etf_flow_ratio`: Отношение текущего потока к среднему

5. **Technical Indicators**

   - `rsi`: Relative Strength Index
   - `macd`: MACD индикатор
   - `macd_signal`: Сигнальная линия MACD

6. **Lag features**

   - Лаговые признаки для доходности, объема и ETF потоков

### Параметры модели

- **Алгоритм**: XGBoost Classifier
- **Max Depth**: 5
- **N Estimators**: 300
- **Learning Rate**: 0.05
- **Objective**: binary:logistic

## 🔧 Использование API

### Обучение модели

```python
from train import main as train_model

# Обучение с параметрами по умолчанию
train_model()
```

### Прогнозирование

```python
from predict import load_model, predict_from_database

# Загрузка модели
predictor = load_model('models/etf_model_v1.pkl')

# Прогноз с данными из базы
result = predictor.predict_from_database()

print(f"Вероятность роста: {result['probability_up']:.2%}")
print(f"Предсказание: {result['prediction_text']}")
```

### Прогноз с JSON данными

```python
import json

# Пример данных
json_data = {
    "timestamp": ["2024-01-01", "2024-01-02"],
    "open": [45000, 45500],
    "high": [46000, 46500],
    "low": [44000, 45000],
    "close": [45500, 46000],
    "volume": [1000, 1200],
    "etf_flow": [1000000, 1500000]
}

result = predictor.predict_from_json(json_data)
```

## 📈 Метрики модели

Модель выводит следующие метрики:

- **Accuracy**: Точность классификации
- **AUC**: Area Under Curve (ROC)
- **Classification Report**: Подробный отчет по классам

## 🛠️ Требования к системе

- **Python**: 3.11+
- **ОС**: macOS (совместимо с M1/M2/M3)
- **RAM**: Рекомендуется 16GB+ (поддерживает до 64GB)
- **База данных**: PostgreSQL с данными о Биткоине и ETF

## 📦 Зависимости

Основные библиотеки:

- `pandas` >= 2.0.0
- `numpy` >= 1.24.0
- `scikit-learn` >= 1.3.0
- `xgboost` >= 1.7.0
- `sqlalchemy` >= 2.0.0
- `psycopg2-binary` >= 2.9.0

Полный список в `requirements.txt`.

## 🔍 Мониторинг и логирование

Проект использует встроенное логирование Python:

- Уровень: INFO
- Формат: Временная метка, модуль, уровень, сообщение
- Логи сохраняются в консоль

## 🚀 Развитие проекта

### Планируемые улучшения

1. **Дополнительные признаки**

   - Сезонные паттерны
   - Социальные сети и новости
   - Макроэкономические индикаторы

2. **Улучшение модели**

   - Ансамбли моделей
   - Нейронные сети (LSTM, Transformer)
   - Автоматический подбор гиперпараметров

3. **Инфраструктура**

   - FastAPI для REST API
   - Docker контейнеризация
   - Автоматическое переобучение

4. **Мониторинг**

   - MLflow для отслеживания экспериментов
   - Grafana дашборды
   - Алерты при деградации модели

### Добавление новых признаков

```python
# В train.py, класс FeatureEngineer
def create_custom_features(self, df):
    # Ваши новые признаки
    df['custom_feature'] = df['close'].rolling(14).std()
    return df
```

### Настройка гиперпараметров

```python
# В train.py, метод train()
from sklearn.model_selection import GridSearchCV

param_grid = {
    'max_depth': [3, 5, 7],
    'n_estimators': [100, 300, 500],
    'learning_rate': [0.01, 0.05, 0.1]
}

grid_search = GridSearchCV(self.model, param_grid, cv=3)
grid_search.fit(X_train, y_train)
```

## 🐛 Устранение неполадок

### Частые проблемы

1. **Ошибка подключения к базе данных**

   ```bash
   # Проверьте настройки в .env
   # Убедитесь, что PostgreSQL запущен
   ```

2. **Недостаточно данных**

   ```bash
   # Увеличьте LOOKBACK_DAYS в .env
   # Проверьте наличие данных в базе
   ```

3. **Ошибки зависимостей**

   ```bash
   # Переустановите виртуальное окружение
   pip install --upgrade pip
   pip install -r requirements.txt --force-reinstall
   ```

### Логи и отладка

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📄 Лицензия

Этот проект создан для образовательных и исследовательских целей.

## 🤝 Вклад в проект

Приветствуются предложения по улучшению:

1. Fork проекта
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request

## 📞 Поддержка

При возникновении вопросов или проблем:

1. Проверьте документацию
2. Изучите логи ошибок
3. Создайте issue с подробным описанием

---

**Примечание**: Эта модель предназначена для образовательных целей. Не используйте для реальной торговли без дополнительного тестирования и валидации.
