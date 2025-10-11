#!/usr/bin/env python3
"""
Демонстрационная версия предсказания с использованием обученной модели.
Работает с синтетическими данными для демонстрации полного цикла.
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Dict, Any, Optional
import joblib
from dotenv import load_dotenv

# Local imports
from predict import BitcoinPredictor
from train_demo import create_synthetic_data

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Загрузка переменных окружения
load_dotenv()


def load_demo_model(model_path: Optional[str] = None) -> BitcoinPredictor:
    """
    Загрузка демонстрационной модели.
    
    Args:
        model_path: Путь к модели
        
    Returns:
        Экземпляр BitcoinPredictor
    """
    if model_path is None:
        model_path = os.getenv('MODEL_PATH', 'models/etf_model_v1.pkl')
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Модель не найдена: {model_path}\n"
            "Сначала запустите: python train_demo.py"
        )
    
    return BitcoinPredictor(model_path)


def predict_with_synthetic_data(model_path: Optional[str] = None, days: int = 60) -> Dict[str, Any]:
    """
    Предсказание с использованием синтетических данных.
    
    Args:
        model_path: Путь к модели
        days: Количество дней данных для предсказания
        
    Returns:
        Результаты предсказания
    """
    logger.info(f"Загрузка модели и создание синтетических данных на {days} дней...")
    
    # Загрузка модели
    predictor = load_demo_model(model_path)
    
    # Создание синтетических данных
    data = create_synthetic_data(days)
    
    logger.info(f"Загружено {len(data)} записей")
    
    # Выполнение предсказания
    result = predictor.predict(data)
    
    # Добавление информации о данных
    result['data_info'] = {
        'data_type': 'synthetic',
        'days': days,
        'last_price': float(data['close'].iloc[-1]),
        'last_date': data.index[-1].strftime('%Y-%m-%d'),
        'price_change_1d': float(data['close'].pct_change().iloc[-1]),
        'price_change_period': float((data['close'].iloc[-1] / data['close'].iloc[0]) - 1)
    }
    
    return result


def predict_with_json_data(model_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Предсказание с использованием JSON данных.
    
    Args:
        model_path: Путь к модели
        
    Returns:
        Результаты предсказания
    """
    logger.info("Предсказание с JSON данными...")
    
    # Загрузка модели
    predictor = load_demo_model(model_path)
    
    # Создание примерных JSON данных (нужно больше данных для создания признаков)
    dates = pd.date_range(start='2024-01-01', periods=50, freq='D')
    base_price = 45000
    
    sample_json = {
        "timestamp": [d.strftime('%Y-%m-%d') for d in dates],
        "open": [],
        "high": [],
        "low": [],
        "close": [],
        "volume": [],
        "etf_flow": []
    }
    
    # Генерация реалистичных данных
    np.random.seed(42)
    for i in range(50):
        change = np.random.normal(0, 0.02)
        if i == 0:
            price = base_price
        else:
            price = sample_json["close"][-1] * (1 + change)
        
        high = price * (1 + np.random.uniform(0, 0.01))
        low = price * (1 - np.random.uniform(0, 0.01))
        open_price = price * (1 + np.random.uniform(-0.005, 0.005))
        
        sample_json["open"].append(round(open_price, 2))
        sample_json["high"].append(round(high, 2))
        sample_json["low"].append(round(low, 2))
        sample_json["close"].append(round(price, 2))
        sample_json["volume"].append(round(np.random.uniform(1000, 2000), 0))
        sample_json["etf_flow"].append(round(np.random.normal(1000000, 200000), 2))
    
    # Выполнение предсказания
    result = predictor.predict_from_json(sample_json)
    
    # Добавление информации о данных
    result['data_info'] = {
        'data_type': 'json',
        'records': len(sample_json['timestamp']),
        'last_price': sample_json['close'][-1],
        'last_date': sample_json['timestamp'][-1]
    }
    
    return result


def main():
    """Основная функция демонстрационного предсказания."""
    logger.info("🔮 ДЕМОНСТРАЦИОННОЕ ПРЕДСКАЗАНИЕ ЦЕНЫ БИТКОИНА")
    logger.info("=" * 60)
    
    # Параметры из переменных окружения
    model_path = os.getenv('MODEL_PATH', 'models/etf_model_v1.pkl')
    
    try:
        # Предсказание с синтетическими данными
        print("\n📊 ПРЕДСКАЗАНИЕ С СИНТЕТИЧЕСКИМИ ДАННЫМИ")
        print("-" * 50)
        
        result_synthetic = predict_with_synthetic_data(model_path, days=60)
        
        print(f"Символ: BTCUSDT (синтетические данные)")
        print(f"Последняя цена: ${result_synthetic['data_info']['last_price']:,.2f}")
        print(f"Дата: {result_synthetic['data_info']['last_date']}")
        print(f"Изменение за день: {result_synthetic['data_info']['price_change_1d']:.2%}")
        print(f"Изменение за период: {result_synthetic['data_info']['price_change_period']:.2%}")
        print()
        print(f"ПРОГНОЗ:")
        print(f"Направление: {result_synthetic['prediction_text']}")
        print(f"Вероятность роста: {result_synthetic['probability_up']:.2%}")
        print(f"Вероятность падения: {result_synthetic['probability_down']:.2%}")
        print(f"Уверенность: {result_synthetic['confidence']:.2%}")
        
        # Предсказание с JSON данными
        print("\n📋 ПРЕДСКАЗАНИЕ С JSON ДАННЫМИ")
        print("-" * 50)
        
        result_json = predict_with_json_data(model_path)
        
        print(f"Данные: {result_json['data_info']['records']} записей из JSON")
        print(f"Последняя цена: ${result_json['data_info']['last_price']:,.2f}")
        print(f"Дата: {result_json['data_info']['last_date']}")
        print()
        print(f"ПРОГНОЗ:")
        print(f"Направление: {result_json['prediction_text']}")
        print(f"Вероятность роста: {result_json['probability_up']:.2%}")
        print(f"Вероятность падения: {result_json['probability_down']:.2%}")
        print(f"Уверенность: {result_json['confidence']:.2%}")
        
        # Топ-5 важных признаков
        if result_synthetic['feature_importance']:
            print(f"\n📈 ТОП-5 ВАЖНЫХ ПРИЗНАКОВ:")
            sorted_features = sorted(
                result_synthetic['feature_importance'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]
            
            for i, (feature, importance) in enumerate(sorted_features, 1):
                print(f"{i}. {feature}: {importance:.4f}")
        
        print(f"\n⏰ Время предсказания: {result_synthetic['timestamp']}")
        print(f"📊 Использовано точек данных: {result_synthetic['data_points_used']}")
        
        # Сохранение результатов
        output_file = f"prediction_demo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        results = {
            'synthetic_prediction': result_synthetic,
            'json_prediction': result_json,
            'generated_at': datetime.now().isoformat()
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\n💾 Результаты сохранены в {output_file}")
        
        print("\n" + "="*60)
        print("🎉 ДЕМОНСТРАЦИОННОЕ ПРЕДСКАЗАНИЕ ЗАВЕРШЕНО УСПЕШНО!")
        print("="*60)
        
    except FileNotFoundError as e:
        logger.error(f"Модель не найдена: {e}")
        print("\n❌ ОШИБКА: Модель не найдена!")
        print("Сначала запустите обучение:")
        print("   python train_demo.py")
        
    except Exception as e:
        logger.error(f"Ошибка при демонстрационном предсказании: {e}")
        raise


if __name__ == "__main__":
    main()
