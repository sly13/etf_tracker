# ML API Documentation

API для работы с моделью машинного обучения предсказания цены Биткоина.

## 🚀 Быстрый старт

1. **Запустите backend сервер:**

   ```bash
   cd backend
   npm run start:dev
   ```

2. **Проверьте работу API:**
   ```bash
   python test_ml_api.py
   ```

## 📡 API Endpoints

### 1. Health Check

**GET** `/api/ml/health`

Проверка работоспособности ML сервиса.

**Response:**

```json
{
  "success": true,
  "message": "ML Service is running",
  "timestamp": "2025-10-11T17:40:00.000Z"
}
```

### 2. Информация о модели

**GET** `/api/ml/model-info`

Получение информации о загруженной модели.

**Response:**

```json
{
  "success": true,
  "data": {
    "model_exists": true,
    "model_size": 1234567,
    "last_trained": "2025-10-11T17:35:01.835963",
    "features_count": 25,
    "model_type": "XGBoost"
  },
  "timestamp": "2025-10-11T17:40:00.000Z"
}
```

### 3. Предсказание (с данными из БД)

**GET** `/api/ml/predict`

Получение предсказания на основе данных из базы данных.

**Response:**

```json
{
  "success": true,
  "data": {
    "direction": "Рост",
    "probability_up": 0.641,
    "confidence": 0.641,
    "last_price": 112342.11,
    "timestamp": "2025-10-11T17:40:00.000Z"
  },
  "timestamp": "2025-10-11T17:40:00.000Z"
}
```

### 4. Предсказание с переданными данными

**POST** `/api/ml/predict`

Предсказание на основе переданных JSON данных.

**Request Body:**

```json
{
  "timestamp": ["2024-01-01", "2024-01-02", "2024-01-03"],
  "open": [45000, 45500, 46000],
  "high": [46000, 46500, 47000],
  "low": [44000, 45000, 45500],
  "close": [45500, 46000, 46500],
  "volume": [1000, 1200, 1100],
  "etf_flow": [1000000, 1500000, 1200000]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "direction": "Рост",
    "probability_up": 0.641,
    "confidence": 0.641,
    "timestamp": "2025-10-11T17:40:00.000Z"
  },
  "timestamp": "2025-10-11T17:40:00.000Z"
}
```

## 🔧 Настройки

### CORS

API настроен для принятия запросов отовсюду (`origin: true`).

### Таймауты

- Предсказания: 30 секунд
- Информация о модели: 10 секунд

## 📊 Примеры использования

### cURL

```bash
# Health check
curl http://localhost:3066/api/ml/health

# Получение предсказания
curl http://localhost:3066/api/ml/predict

# Предсказание с данными
curl -X POST http://localhost:3066/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{"timestamp":["2024-01-01"],"open":[45000],"high":[46000],"low":[44000],"close":[45500],"volume":[1000],"etf_flow":[1000000]}'
```

### JavaScript

```javascript
// Получение предсказания
fetch("http://localhost:3066/api/ml/predict")
  .then(response => response.json())
  .then(data => console.log(data));

// Предсказание с данными
fetch("http://localhost:3066/api/ml/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    timestamp: ["2024-01-01"],
    open: [45000],
    high: [46000],
    low: [44000],
    close: [45500],
    volume: [1000],
    etf_flow: [1000000],
  }),
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Python

```python
import requests

# Получение предсказания
response = requests.get('http://localhost:3066/api/ml/predict')
print(response.json())

# Предсказание с данными
data = {
    "timestamp": ["2024-01-01"],
    "open": [45000],
    "high": [46000],
    "low": [44000],
    "close": [45500],
    "volume": [1000],
    "etf_flow": [1000000]
}
response = requests.post('http://localhost:3066/api/ml/predict', json=data)
print(response.json())
```

## ⚠️ Ошибки

### 500 Internal Server Error

- Модель не найдена
- Ошибка выполнения Python скрипта
- Проблемы с базой данных

### 400 Bad Request

- Неверный формат данных
- Отсутствуют обязательные поля

### Пример ошибки:

```json
{
  "success": false,
  "error": "Ошибка ML модели: Model not found",
  "timestamp": "2025-10-11T17:40:00.000Z"
}
```

## 🔄 Обновление модели

Для обновления модели:

1. Обучите новую модель: `python trade-model/train.py`
2. Перезапустите backend сервер
3. Проверьте информацию о модели: `GET /api/ml/model-info`

## 📝 Логи

Логи ML сервиса можно найти в консоли backend сервера:

- `MLService` - основные операции
- Ошибки выполнения Python скриптов
- Время выполнения запросов
