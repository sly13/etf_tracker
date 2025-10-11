"""
Скрипт для загрузки обученной модели и выполнения прогнозов роста цены Биткоина.
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
from db import load_training_data, get_database_manager
from train import FeatureEngineer

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Загрузка переменных окружения
load_dotenv()


class BitcoinPredictor:
    """Класс для загрузки и использования обученной модели предсказания Биткоина."""
    
    def __init__(self, model_path: str):
        """
        Инициализация предсказателя с загрузкой модели.
        
        Args:
            model_path: Путь к файлу с обученной моделью
        """
        self.model_path = model_path
        self.model = None
        self.feature_columns = None
        self.model_params = None
        self.trained_at = None
        self.feature_engineer = FeatureEngineer()
        
        self._load_model()
    
    def _load_model(self) -> None:
        """Загрузка обученной модели из файла."""
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Файл модели не найден: {self.model_path}")
            
            model_data = joblib.load(self.model_path)
            
            self.model = model_data['model']
            self.feature_columns = model_data['feature_columns']
            self.model_params = model_data.get('model_params', {})
            self.trained_at = model_data.get('trained_at', 'Unknown')
            
            logger.info(f"Модель успешно загружена из {self.model_path}")
            logger.info(f"Модель обучена: {self.trained_at}")
            logger.info(f"Количество признаков: {len(self.feature_columns)}")
            
        except Exception as e:
            logger.error(f"Ошибка загрузки модели: {e}")
            raise
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Подготовка признаков для предсказания.
        
        Args:
            df: DataFrame с данными OHLCV и ETF потоками
            
        Returns:
            DataFrame с подготовленными признаками
        """
        # Создание признаков
        features_df = self.feature_engineer.create_features(df)
        
        # Выбор только нужных признаков
        available_features = [col for col in self.feature_columns if col in features_df.columns]
        missing_features = [col for col in self.feature_columns if col not in features_df.columns]
        
        if missing_features:
            logger.warning(f"Отсутствующие признаки: {missing_features}")
            # Заполнение отсутствующих признаков нулями
            for feature in missing_features:
                features_df[feature] = 0
        
        # Создание финального датасета
        X = features_df[self.feature_columns].copy()
        
        # Удаление строк с NaN
        X = X.dropna()
        
        return X
    
    def predict(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Выполнение предсказания на основе данных.
        
        Args:
            data: DataFrame с данными для предсказания
            
        Returns:
            Словарь с результатами предсказания
        """
        if self.model is None:
            raise ValueError("Модель не загружена")
        
        # Подготовка признаков
        X = self.prepare_features(data)
        
        if len(X) == 0:
            raise ValueError("Нет данных для предсказания после обработки")
        
        # Предсказание
        probabilities = self.model.predict_proba(X)
        predictions = self.model.predict(X)
        
        # Результаты для последней строки (самые свежие данные)
        last_probability = probabilities[-1, 1]  # Вероятность роста
        last_prediction = predictions[-1]
        
        # Дополнительная информация
        confidence = max(last_probability, 1 - last_probability)
        
        # Важность признаков (если доступна)
        feature_importance = None
        if hasattr(self.model, 'feature_importances_'):
            feature_importance = dict(zip(
                self.feature_columns,
                self.model.feature_importances_
            ))
        
        result = {
            'prediction': int(last_prediction),
            'probability_up': float(last_probability),
            'probability_down': float(1 - last_probability),
            'confidence': float(confidence),
            'prediction_text': 'Рост' if last_prediction == 1 else 'Падение',
            'timestamp': datetime.now().isoformat(),
            'data_points_used': len(X),
            'feature_importance': feature_importance
        }
        
        return result
    
    def predict_from_database(self, symbol: str = 'BTCUSDT', lookback_days: int = 60) -> Dict[str, Any]:
        """
        Загрузка данных из базы данных и выполнение предсказания.
        
        Args:
            symbol: Символ торговой пары
            lookback_days: Количество дней для загрузки данных
            
        Returns:
            Словарь с результатами предсказания
        """
        logger.info(f"Загрузка данных для предсказания: {symbol}, {lookback_days} дней")
        
        # Загрузка данных
        data = load_training_data(symbol=symbol, lookback_days=lookback_days)
        
        if data is None or len(data) < 30:
            raise ValueError("Недостаточно данных для предсказания")
        
        logger.info(f"Загружено {len(data)} записей")
        
        # Выполнение предсказания
        result = self.predict(data)
        
        # Добавление информации о данных
        result['data_info'] = {
            'symbol': symbol,
            'lookback_days': lookback_days,
            'last_price': float(data['close'].iloc[-1]),
            'last_date': data.index[-1].strftime('%Y-%m-%d'),
            'price_change_1d': float(data['close'].pct_change().iloc[-1])
        }
        
        return result
    
    def predict_from_json(self, json_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Выполнение предсказания на основе JSON данных.
        
        Args:
            json_data: Словарь с данными в формате JSON
            
        Returns:
            Словарь с результатами предсказания
        """
        try:
            # Конвертация JSON в DataFrame
            df = pd.DataFrame(json_data)
            
            # Установка индекса если есть поле timestamp
            if 'timestamp' in df.columns:
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                df.set_index('timestamp', inplace=True)
            
            # Выполнение предсказания
            result = self.predict(df)
            
            return result
            
        except Exception as e:
            logger.error(f"Ошибка при обработке JSON данных: {e}")
            raise


def load_model(model_path: Optional[str] = None) -> BitcoinPredictor:
    """
    Удобная функция для загрузки модели.
    
    Args:
        model_path: Путь к модели (если None, берется из переменных окружения)
        
    Returns:
        Экземпляр BitcoinPredictor
    """
    if model_path is None:
        model_path = os.getenv('MODEL_PATH', 'models/etf_model_v1.pkl')
    
    return BitcoinPredictor(model_path)


def get_available_days() -> int:
    """
    Получить количество доступных дней данных ETF.
    
    Returns:
        Количество дней с первой записи ETF
    """
    try:
        from db import get_database_manager
        import pandas as pd
        
        db_manager = get_database_manager()
        if not db_manager.is_connected():
            return 60  # Fallback к 60 дням
        
        # Получаем первую и последнюю дату ETF данных
        query = """
        SELECT MIN(date) as first_date, MAX(date) as last_date
        FROM btc_flows
        """
        result = pd.read_sql(query, db_manager.engine)
        
        if result.empty or result.iloc[0]['first_date'] is None:
            return 60  # Fallback к 60 дням
        
        first_date = result.iloc[0]['first_date']
        last_date = result.iloc[0]['last_date']
        
        # Рассчитываем количество дней
        days_diff = (last_date - first_date).days
        db_manager.close_connection()
        
        return max(days_diff, 30)  # Минимум 30 дней
        
    except Exception as e:
        logger.warning(f"Не удалось получить количество дней: {e}")
        return 60  # Fallback к 60 дням


def predict_from_database(model_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Удобная функция для предсказания с использованием данных из базы данных.
    
    Args:
        model_path: Путь к модели
        
    Returns:
        Результаты предсказания
    """
    predictor = load_model(model_path)
    
    # Используем все доступные дни данных ETF
    available_days = get_available_days()
    logger.info(f"Используем {available_days} дней данных ETF")
    
    return predictor.predict_from_database(lookback_days=available_days)


def main():
    """Основная функция для выполнения предсказания."""
    logger.info("Запуск предсказания цены Биткоина")
    
    # Параметры из переменных окружения
    model_path = os.getenv('MODEL_PATH', 'models/etf_model_v1.pkl')
    symbol = os.getenv('BTC_SYMBOL', 'BTCUSDT')
    
    # Используем все доступные дни данных ETF
    lookback_days = get_available_days()
    logger.info(f"Используем {lookback_days} дней данных ETF")
    
    try:
        # Загрузка модели и выполнение предсказания
        result = predict_from_database(model_path)
        
        # Вывод результатов
        print("\n" + "="*50)
        print("ПРОГНОЗ ЦЕНЫ БИТКОИНА")
        print("="*50)
        print(f"Символ: {result['data_info']['symbol']}")
        print(f"Последняя цена: ${result['data_info']['last_price']:,.2f}")
        print(f"Дата: {result['data_info']['last_date']}")
        print(f"Изменение за день: {result['data_info']['price_change_1d']:.2%}")
        print()
        print(f"ПРОГНОЗ:")
        print(f"Направление: {result['prediction_text']}")
        print(f"Вероятность роста: {result['probability_up']:.2%}")
        print(f"Вероятность падения: {result['probability_down']:.2%}")
        print(f"Уверенность: {result['confidence']:.2%}")
        print()
        print(f"Время предсказания: {result['timestamp']}")
        print(f"Использовано точек данных: {result['data_points_used']}")
        
        # Топ-5 важных признаков
        if result['feature_importance']:
            print("\nТОП-5 ВАЖНЫХ ПРИЗНАКОВ:")
            sorted_features = sorted(
                result['feature_importance'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]
            
            for i, (feature, importance) in enumerate(sorted_features, 1):
                print(f"{i}. {feature}: {importance:.4f}")
        
        print("="*50)
        
        # Сохранение результатов в JSON файл
        output_file = f"prediction_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"Результаты сохранены в {output_file}")
        
    except Exception as e:
        logger.error(f"Ошибка при выполнении предсказания: {e}")
        raise
    
    finally:
        # Закрытие подключения к базе данных
        db_manager = get_database_manager()
        db_manager.close_connection()


if __name__ == "__main__":
    main()
