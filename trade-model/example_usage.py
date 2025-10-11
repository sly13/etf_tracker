#!/usr/bin/env python3
"""
Пример использования модели предсказания Биткоина.
Демонстрирует основные возможности проекта.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json


def create_sample_data() -> pd.DataFrame:
    """
    Создание примерных данных для демонстрации работы модели.
    В реальном использовании данные загружаются из базы данных.
    """
    print("📊 Создание примерных данных...")
    
    # Создание временного ряда на 100 дней
    dates = pd.date_range(start='2024-01-01', periods=100, freq='D')
    
    # Генерация реалистичных данных о цене Биткоина
    np.random.seed(42)
    base_price = 45000
    
    # Создание случайного блуждания с трендом
    returns = np.random.normal(0.001, 0.02, len(dates))  # Средний рост 0.1% в день
    prices = [base_price]
    
    for ret in returns[1:]:
        new_price = prices[-1] * (1 + ret)
        prices.append(new_price)
    
    # Создание OHLCV данных
    data = []
    for i, (date, close) in enumerate(zip(dates, prices)):
        # Генерация реалистичных OHLC на основе close
        volatility = np.random.uniform(0.01, 0.03)
        high = close * (1 + np.random.uniform(0, volatility))
        low = close * (1 - np.random.uniform(0, volatility))
        open_price = close * (1 + np.random.uniform(-volatility/2, volatility/2))
        volume = np.random.uniform(1000, 10000)
        
        # ETF потоки (могут быть отрицательными)
        etf_flow = np.random.normal(1000000, 500000)  # Средний поток $1M
        
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
    
    print(f"✅ Создано {len(df)} записей с {datetime.strftime(dates[0], '%Y-%m-%d')} по {datetime.strftime(dates[-1], '%Y-%m-%d')}")
    return df


def demonstrate_feature_engineering():
    """Демонстрация создания признаков."""
    print("\n🔧 Демонстрация создания признаков...")
    
    # Импорт только после создания данных
    from train import FeatureEngineer
    
    # Создание примерных данных
    data = create_sample_data()
    
    # Создание признаков
    feature_engineer = FeatureEngineer()
    features_df = feature_engineer.create_features(data)
    
    print(f"✅ Исходных колонок: {len(data.columns)}")
    print(f"✅ После создания признаков: {len(features_df.columns)}")
    
    # Показать некоторые созданные признаки
    feature_columns = [
        'return_prev', 'volatility', 'ma_7', 'ma_30',
        'etf_flow_change', 'rsi', 'macd'
    ]
    
    available_features = [col for col in feature_columns if col in features_df.columns]
    
    print(f"\n📈 Примеры созданных признаков:")
    for feature in available_features[:5]:  # Показать первые 5
        if not features_df[feature].isna().all():
            print(f"   {feature}: {features_df[feature].iloc[-1]:.4f}")
    
    return features_df


def demonstrate_model_training():
    """Демонстрация обучения модели (без реального обучения)."""
    print("\n🤖 Демонстрация процесса обучения модели...")
    
    try:
        from train import BitcoinPredictor
        
        # Создание экземпляра предсказателя
        predictor = BitcoinPredictor()
        
        print("✅ Класс BitcoinPredictor создан")
        print(f"✅ Параметры модели: {predictor.model_params}")
        
        # Создание примерных данных
        data = create_sample_data()
        
        # Подготовка данных
        X, y, feature_columns = predictor.prepare_data(data)
        
        print(f"✅ Подготовлено {len(X)} образцов")
        print(f"✅ Количество признаков: {len(feature_columns)}")
        print(f"✅ Распределение классов: {y.value_counts().to_dict()}")
        
        # Показать примеры признаков
        print(f"\n📊 Примеры признаков для последней строки:")
        last_row = X.iloc[-1]
        for i, (feature, value) in enumerate(last_row.items()):
            if i < 5:  # Показать первые 5 признаков
                print(f"   {feature}: {value:.4f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка при демонстрации обучения: {e}")
        return False


def demonstrate_prediction():
    """Демонстрация процесса предсказания."""
    print("\n🔮 Демонстрация процесса предсказания...")
    
    try:
        from predict import BitcoinPredictor
        
        # Создание примерных данных в формате JSON
        sample_json = {
            "timestamp": ["2024-01-01", "2024-01-02", "2024-01-03"],
            "open": [45000, 45500, 46000],
            "high": [46000, 46500, 47000],
            "low": [44000, 45000, 45500],
            "close": [45500, 46000, 46500],
            "volume": [1000, 1200, 1100],
            "etf_flow": [1000000, 1500000, 1200000]
        }
        
        print("✅ Создан пример JSON данных")
        print(f"   Данные: {len(sample_json['timestamp'])} записей")
        
        # Показать структуру данных
        print(f"\n📋 Структура данных:")
        for key, values in sample_json.items():
            if key != 'timestamp':
                print(f"   {key}: {values}")
        
        print("\n💡 В реальном использовании:")
        print("   1. Загрузите обученную модель: predictor = BitcoinPredictor('models/etf_model_v1.pkl')")
        print("   2. Выполните предсказание: result = predictor.predict_from_json(sample_json)")
        print("   3. Получите результат: вероятность роста, направление, уверенность")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка при демонстрации предсказания: {e}")
        return False


def show_usage_instructions():
    """Показать инструкции по использованию."""
    print("\n📖 ИНСТРУКЦИИ ПО ИСПОЛЬЗОВАНИЮ")
    print("=" * 50)
    
    print("\n1️⃣ Настройка окружения:")
    print("   python3 -m venv venv")
    print("   source venv/bin/activate")
    print("   pip install -r requirements.txt")
    
    print("\n2️⃣ Настройка конфигурации:")
    print("   cp env.example .env")
    print("   # Отредактируйте .env с параметрами подключения к БД")
    
    print("\n3️⃣ Проверка настройки:")
    print("   python test_setup.py")
    
    print("\n4️⃣ Обучение модели:")
    print("   python train.py")
    
    print("\n5️⃣ Выполнение прогноза:")
    print("   python predict.py")
    
    print("\n6️⃣ Использование в коде:")
    print("""
   from predict import load_model
   
   # Загрузка модели
   predictor = load_model('models/etf_model_v1.pkl')
   
   # Прогноз с данными из БД
   result = predictor.predict_from_database()
   print(f"Вероятность роста: {result['probability_up']:.2%}")
   """)


def main():
    """Основная функция демонстрации."""
    print("🚀 ДЕМОНСТРАЦИЯ ПРОЕКТА ПРЕДСКАЗАНИЯ БИТКОИНА")
    print("=" * 60)
    
    # Демонстрация создания данных
    data = create_sample_data()
    print(f"   Последняя цена: ${data['close'].iloc[-1]:,.2f}")
    print(f"   Изменение за период: {((data['close'].iloc[-1] / data['close'].iloc[0]) - 1):.2%}")
    
    # Демонстрация создания признаков
    features_df = demonstrate_feature_engineering()
    
    # Демонстрация обучения модели
    training_ok = demonstrate_model_training()
    
    # Демонстрация предсказания
    prediction_ok = demonstrate_prediction()
    
    # Показать инструкции
    show_usage_instructions()
    
    # Итоговый результат
    print("\n" + "=" * 60)
    if training_ok and prediction_ok:
        print("🎉 ДЕМОНСТРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!")
        print("\nПроект готов к использованию. Следуйте инструкциям выше.")
    else:
        print("⚠️  Демонстрация завершена с предупреждениями.")
        print("Проверьте настройку окружения перед использованием.")
    
    print("=" * 60)


if __name__ == "__main__":
    main()
