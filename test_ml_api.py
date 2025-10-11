#!/usr/bin/env python3
"""
Скрипт для тестирования ML API endpoints.
"""

import requests
import json
from datetime import datetime

# Базовый URL API
BASE_URL = "http://localhost:3066/api/ml"

def test_health():
    """Тест проверки здоровья сервиса."""
    print("🔍 Тестирование health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
        return False

def test_model_info():
    """Тест получения информации о модели."""
    print("\n📊 Тестирование получения информации о модели...")
    try:
        response = requests.get(f"{BASE_URL}/model-info")
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
        return False

def test_prediction():
    """Тест получения предсказания."""
    print("\n🔮 Тестирование получения предсказания...")
    try:
        response = requests.get(f"{BASE_URL}/predict")
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
        return False

def test_prediction_with_data():
    """Тест предсказания с переданными данными."""
    print("\n📋 Тестирование предсказания с данными...")
    
    # Пример данных
    sample_data = {
        "timestamp": ["2024-01-01", "2024-01-02", "2024-01-03"],
        "open": [45000, 45500, 46000],
        "high": [46000, 46500, 47000],
        "low": [44000, 45000, 45500],
        "close": [45500, 46000, 46500],
        "volume": [1000, 1200, 1100],
        "etf_flow": [1000000, 1500000, 1200000]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=sample_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
        return False

def main():
    """Основная функция тестирования."""
    print("🚀 ТЕСТИРОВАНИЕ ML API")
    print("=" * 50)
    print(f"Базовый URL: {BASE_URL}")
    print(f"Время: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    
    # Запуск тестов
    results.append(("Health Check", test_health()))
    results.append(("Model Info", test_model_info()))
    results.append(("Prediction", test_prediction()))
    results.append(("Prediction with Data", test_prediction_with_data()))
    
    # Итоги
    print("\n" + "=" * 50)
    print("📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:25} {status}")
        if result:
            passed += 1
    
    print(f"\nИтого: {passed}/{len(results)} тестов прошли успешно")
    
    if passed == len(results):
        print("🎉 Все тесты прошли успешно!")
    else:
        print("⚠️  Некоторые тесты не прошли. Проверьте, что сервер запущен.")

if __name__ == "__main__":
    main()
