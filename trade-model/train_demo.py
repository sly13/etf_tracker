#!/usr/bin/env python3
"""
Демонстрационная версия обучения модели без подключения к базе данных.
Использует синтетические данные для демонстрации полного цикла ML.
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Tuple, Optional
import joblib
from dotenv import load_dotenv

# ML libraries
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import xgboost as xgb

# Local imports
from train import FeatureEngineer, BitcoinPredictor

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Загрузка переменных окружения
load_dotenv()


def create_synthetic_data(days: int = 365) -> pd.DataFrame:
    """
    Создание синтетических данных для демонстрации.
    
    Args:
        days: Количество дней данных
        
    Returns:
        DataFrame с синтетическими данными
    """
    logger.info(f"Создание синтетических данных на {days} дней...")
    
    # Создание временного ряда
    dates = pd.date_range(start='2023-01-01', periods=days, freq='D')
    
    # Параметры для генерации реалистичных данных
    np.random.seed(42)
    base_price = 45000
    daily_volatility = 0.02
    trend = 0.0005  # Небольшой восходящий тренд
    
    # Генерация цен
    prices = [base_price]
    for i in range(1, len(dates)):
        # Случайное блуждание с трендом
        change = np.random.normal(trend, daily_volatility)
        new_price = prices[-1] * (1 + change)
        prices.append(new_price)
    
    # Создание OHLCV данных
    data = []
    for i, (date, close) in enumerate(zip(dates, prices)):
        # Генерация реалистичных OHLC
        intraday_vol = np.random.uniform(0.005, 0.02)
        high = close * (1 + np.random.uniform(0, intraday_vol))
        low = close * (1 - np.random.uniform(0, intraday_vol))
        open_price = close * (1 + np.random.uniform(-intraday_vol/2, intraday_vol/2))
        
        # Объем (зависит от волатильности)
        base_volume = 1000
        volume_multiplier = 1 + abs(change) * 10  # Больше объема при больших изменениях
        volume = base_volume * volume_multiplier * np.random.uniform(0.5, 1.5)
        
        # ETF потоки (коррелируют с изменениями цены)
        base_flow = 1000000  # $1M базовый поток
        flow_correlation = change * 10000000  # Потоки реагируют на изменения цены
        etf_flow = base_flow + flow_correlation + np.random.normal(0, 200000)
        
        data.append({
            'timestamp': date,
            'open': round(open_price, 2),
            'high': round(high, 2),
            'low': round(low, 2),
            'close': round(close, 2),
            'volume': round(volume, 0),
            'etf_flow': round(etf_flow, 2)
        })
    
    df = pd.DataFrame(data)
    df.set_index('timestamp', inplace=True)
    
    logger.info(f"Создано {len(df)} записей")
    logger.info(f"Диапазон цен: ${df['close'].min():,.2f} - ${df['close'].max():,.2f}")
    logger.info(f"Общее изменение: {((df['close'].iloc[-1] / df['close'].iloc[0]) - 1):.2%}")
    
    return df


def main():
    """Основная функция для демонстрационного обучения."""
    logger.info("🚀 ДЕМОНСТРАЦИОННОЕ ОБУЧЕНИЕ МОДЕЛИ ПРЕДСКАЗАНИЯ БИТКОИНА")
    logger.info("=" * 60)
    
    # Параметры из переменных окружения
    model_path = os.getenv('MODEL_PATH', 'models/etf_model_v1.pkl')
    lookback_days = int(os.getenv('LOOKBACK_DAYS', '365'))
    
    try:
        # Создание синтетических данных
        logger.info("📊 Создание синтетических данных...")
        data = create_synthetic_data(lookback_days)
        
        # Создание и обучение модели
        logger.info("🤖 Создание модели...")
        predictor = BitcoinPredictor()
        X, y, feature_columns = predictor.prepare_data(data)
        
        if len(X) < 50:
            logger.error("Недостаточно данных после обработки")
            return
        
        # Сохранение списка признаков
        predictor.feature_columns = feature_columns
        
        # Обучение модели
        logger.info("🎯 Обучение модели...")
        metrics = predictor.train(X, y)
        
        # Сохранение модели
        logger.info("💾 Сохранение модели...")
        predictor.save_model(model_path)
        
        # Предсказание для последней строки
        prediction = predictor.predict_last_row(X)
        
        # Вывод результатов
        print("\n" + "="*60)
        print("🎉 РЕЗУЛЬТАТЫ ДЕМОНСТРАЦИОННОГО ОБУЧЕНИЯ")
        print("="*60)
        print(f"📊 Данные:")
        print(f"   • Записей: {len(data)}")
        print(f"   • Признаков: {len(feature_columns)}")
        print(f"   • Образцов для обучения: {len(X)}")
        print(f"   • Распределение классов: {y.value_counts().to_dict()}")
        
        print(f"\n🎯 Метрики модели:")
        print(f"   • Точность (Accuracy): {metrics['accuracy']:.4f}")
        print(f"   • AUC: {metrics['auc']:.4f}")
        
        print(f"\n🔮 Пример прогноза (последняя строка):")
        print(f"   • Вероятность роста: {prediction['probability_up']:.4f}")
        print(f"   • Предсказание: {'Рост' if prediction['prediction'] == 1 else 'Падение'}")
        print(f"   • Уверенность: {prediction['confidence']:.4f}")
        
        print(f"\n💾 Модель сохранена в: {model_path}")
        
        # Показать важность признаков
        if hasattr(predictor.model, 'feature_importances_'):
            print(f"\n📈 ТОП-5 ВАЖНЫХ ПРИЗНАКОВ:")
            feature_importance = dict(zip(feature_columns, predictor.model.feature_importances_))
            sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:5]
            
            for i, (feature, importance) in enumerate(sorted_features, 1):
                print(f"   {i}. {feature}: {importance:.4f}")
        
        print("\n" + "="*60)
        print("✅ ДЕМОНСТРАЦИОННОЕ ОБУЧЕНИЕ ЗАВЕРШЕНО УСПЕШНО!")
        print("Теперь вы можете использовать модель для предсказаний:")
        print("   python predict_demo.py")
        print("="*60)
        
    except Exception as e:
        logger.error(f"Ошибка при демонстрационном обучении: {e}")
        raise


if __name__ == "__main__":
    main()
