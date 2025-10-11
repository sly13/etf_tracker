"""
Обучение модели XGBoost для предсказания роста цены Биткоина на основе данных о притоках ETF.
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime
import logging
from typing import Tuple, Optional
import joblib
from dotenv import load_dotenv

# ML libraries
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import xgboost as xgb

# Local imports
from db import load_training_data, get_database_manager

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Загрузка переменных окружения
load_dotenv()


class FeatureEngineer:
    """Класс для создания признаков из сырых данных."""
    
    def __init__(self):
        """Инициализация параметров для создания признаков."""
        self.volatility_window = int(os.getenv('VOLATILITY_WINDOW', '7'))
        self.ma_short_window = int(os.getenv('MA_SHORT_WINDOW', '7'))
        self.ma_long_window = int(os.getenv('MA_LONG_WINDOW', '30'))
    
    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Создание признаков для модели машинного обучения.
        
        Args:
            df: DataFrame с данными OHLCV и ETF потоками
            
        Returns:
            DataFrame с созданными признаками
        """
        logger.info("Создание признаков...")
        
        # Создаем копию для безопасности
        features_df = df.copy()
        
        # 1. Returns (доходность)
        features_df['return_prev'] = features_df['close'].pct_change(1)
        features_df['return_3d'] = features_df['close'].pct_change(3)
        features_df['return_7d'] = features_df['close'].pct_change(7)
        
        # 2. Volatility (волатильность)
        features_df['volatility'] = features_df['return_prev'].rolling(
            window=self.volatility_window
        ).std()
        
        # 3. Moving Averages (скользящие средние)
        features_df['ma_7'] = features_df['close'].rolling(
            window=self.ma_short_window
        ).mean()
        features_df['ma_30'] = features_df['close'].rolling(
            window=self.ma_long_window
        ).mean()
        
        # 4. Price relative to moving averages
        features_df['price_to_ma7'] = features_df['close'] / features_df['ma_7'].replace(0, 1)
        features_df['price_to_ma30'] = features_df['close'] / features_df['ma_30'].replace(0, 1)
        features_df['ma7_to_ma30'] = features_df['ma_7'] / features_df['ma_30'].replace(0, 1)
        
        # 5. High-Low spread
        features_df['hl_spread'] = (features_df['high'] - features_df['low']) / features_df['close']
        
        # 6. Volume features
        features_df['volume_ma7'] = features_df['volume'].rolling(
            window=self.ma_short_window
        ).mean()
        features_df['volume_ratio'] = features_df['volume'] / features_df['volume_ma7'].replace(0, 1)
        
        # 7. ETF Flow features
        if 'etf_flow' in features_df.columns:
            features_df['etf_flow_change'] = features_df['etf_flow'].pct_change(1)
            features_df['etf_flow_ma7'] = features_df['etf_flow'].rolling(
                window=self.ma_short_window
            ).mean()
            # Избегаем деления на ноль
            features_df['etf_flow_ratio'] = features_df['etf_flow'] / features_df['etf_flow_ma7'].replace(0, 1)
        else:
            # Если нет данных ETF, заполняем нулями
            features_df['etf_flow_change'] = 0
            features_df['etf_flow_ma7'] = 0
            features_df['etf_flow_ratio'] = 0
        
        # 8. Lag features (лаговые признаки)
        for lag in [1, 2, 3]:
            features_df[f'return_lag_{lag}'] = features_df['return_prev'].shift(lag)
            features_df[f'volume_lag_{lag}'] = features_df['volume'].shift(lag)
            if 'etf_flow' in features_df.columns:
                features_df[f'etf_flow_lag_{lag}'] = features_df['etf_flow'].shift(lag)
        
        # 9. Technical indicators
        features_df['rsi'] = self._calculate_rsi(features_df['close'])
        features_df['macd'], features_df['macd_signal'] = self._calculate_macd(features_df['close'])
        
        # 10. Очистка от бесконечных значений
        features_df = features_df.replace([np.inf, -np.inf], np.nan)
        
        logger.info(f"Создано {len(features_df.columns)} признаков")
        return features_df
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Расчет RSI (Relative Strength Index)."""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def _calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[pd.Series, pd.Series]:
        """Расчет MACD (Moving Average Convergence Divergence)."""
        ema_fast = prices.ewm(span=fast).mean()
        ema_slow = prices.ewm(span=slow).mean()
        macd = ema_fast - ema_slow
        macd_signal = macd.ewm(span=signal).mean()
        return macd, macd_signal


class BitcoinPredictor:
    """Класс для обучения и использования модели предсказания Биткоина."""
    
    def __init__(self):
        """Инициализация модели."""
        self.model = None
        self.feature_columns = None
        self.feature_engineer = FeatureEngineer()
        
        # Параметры модели из переменных окружения
        self.model_params = {
            'max_depth': int(os.getenv('XGB_MAX_DEPTH', '5')),
            'n_estimators': int(os.getenv('XGB_N_ESTIMATORS', '300')),
            'learning_rate': float(os.getenv('XGB_LEARNING_RATE', '0.05')),
            'random_state': int(os.getenv('XGB_RANDOM_STATE', '42')),
            'eval_metric': 'logloss',
            'objective': 'binary:logistic'
        }
    
    def create_target(self, df: pd.DataFrame) -> pd.Series:
        """
        Создание целевой переменной: рост цены на следующий день.
        
        Args:
            df: DataFrame с данными
            
        Returns:
            Series с целевой переменной (1 - рост, 0 - падение)
        """
        # Целевая переменная: цена завтра > цена сегодня
        target = (df['close'].shift(-1) > df['close']).astype(int)
        return target
    
    def prepare_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, list]:
        """
        Подготовка данных для обучения модели.
        
        Args:
            df: Исходный DataFrame
            
        Returns:
            Tuple с признаками, целевой переменной и списком названий признаков
        """
        logger.info("Подготовка данных для обучения...")
        
        # Создание признаков
        features_df = self.feature_engineer.create_features(df)
        
        # Создание целевой переменной
        target = self.create_target(features_df)
        
        # Выбор признаков для модели
        feature_columns = [
            'return_prev', 'return_3d', 'return_7d',
            'volatility', 'ma_7', 'ma_30',
            'price_to_ma7', 'price_to_ma30', 'ma7_to_ma30',
            'hl_spread', 'volume_ratio',
            'etf_flow_change', 'etf_flow_ratio',
            'return_lag_1', 'return_lag_2', 'return_lag_3',
            'volume_lag_1', 'volume_lag_2', 'volume_lag_3',
            'etf_flow_lag_1', 'etf_flow_lag_2', 'etf_flow_lag_3',
            'rsi', 'macd', 'macd_signal'
        ]
        
        # Фильтрация существующих признаков
        available_features = [col for col in feature_columns if col in features_df.columns]
        
        # Создание финального датасета
        X = features_df[available_features].copy()
        y = target.copy()
        
        # Удаление строк с NaN
        valid_idx = ~(X.isnull().any(axis=1) | y.isnull())
        X = X[valid_idx]
        y = y[valid_idx]
        
        logger.info(f"Подготовлено {len(X)} образцов с {len(available_features)} признаками")
        logger.info(f"Распределение классов: {y.value_counts().to_dict()}")
        
        return X, y, available_features
    
    def train(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2) -> dict:
        """
        Обучение модели XGBoost.
        
        Args:
            X: Признаки
            y: Целевая переменная
            test_size: Размер тестовой выборки
            
        Returns:
            Словарь с метриками модели
        """
        logger.info("Начало обучения модели...")
        
        # Разделение на train/test (без перемешивания для временных рядов)
        split_idx = int(len(X) * (1 - test_size))
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
        
        logger.info(f"Размер обучающей выборки: {len(X_train)}")
        logger.info(f"Размер тестовой выборки: {len(X_test)}")
        
        # Создание и обучение модели
        self.model = xgb.XGBClassifier(**self.model_params)
        
        # Обучение с валидацией
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=False
        )
        
        # Предсказания
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        
        # Метрики
        accuracy = accuracy_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_pred_proba)
        
        metrics = {
            'accuracy': accuracy,
            'auc': auc,
            'classification_report': classification_report(y_test, y_pred)
        }
        
        logger.info(f"Точность (Accuracy): {accuracy:.4f}")
        logger.info(f"AUC: {auc:.4f}")
        
        return metrics
    
    def save_model(self, model_path: str) -> None:
        """
        Сохранение обученной модели.
        
        Args:
            model_path: Путь для сохранения модели
        """
        if self.model is None:
            raise ValueError("Модель не обучена")
        
        # Создание директории если не существует
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Сохранение модели и метаданных
        model_data = {
            'model': self.model,
            'feature_columns': self.feature_columns,
            'model_params': self.model_params,
            'trained_at': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, model_path)
        logger.info(f"Модель сохранена в {model_path}")
    
    def predict_last_row(self, X: pd.DataFrame) -> dict:
        """
        Предсказание для последней строки данных.
        
        Args:
            X: DataFrame с признаками
            
        Returns:
            Словарь с результатами предсказания
        """
        if self.model is None:
            raise ValueError("Модель не обучена")
        
        # Предсказание для последней строки
        last_row = X.iloc[-1:][self.feature_columns]
        probability = self.model.predict_proba(last_row)[0, 1]
        prediction = self.model.predict(last_row)[0]
        
        return {
            'probability_up': probability,
            'prediction': prediction,
            'confidence': max(probability, 1 - probability)
        }


def main():
    """Основная функция для обучения модели."""
    logger.info("Запуск обучения модели предсказания Биткоина")
    
    # Параметры из переменных окружения
    symbol = os.getenv('BTC_SYMBOL', 'BTCUSDT')
    lookback_days = int(os.getenv('LOOKBACK_DAYS', '365'))
    model_path = os.getenv('MODEL_PATH', 'models/etf_model_v1.pkl')
    
    try:
        # Загрузка данных
        logger.info(f"Загрузка данных для {symbol} за последние {lookback_days} дней...")
        data = load_training_data(symbol=symbol, lookback_days=lookback_days)
        
        if data is None or len(data) < 100:
            logger.error("Недостаточно данных для обучения")
            return
        
        logger.info(f"Загружено {len(data)} записей")
        
        # Создание и обучение модели
        predictor = BitcoinPredictor()
        X, y, feature_columns = predictor.prepare_data(data)
        
        if len(X) < 50:
            logger.error("Недостаточно данных после обработки")
            return
        
        # Сохранение списка признаков
        predictor.feature_columns = feature_columns
        
        # Обучение модели
        metrics = predictor.train(X, y)
        
        # Сохранение модели
        predictor.save_model(model_path)
        
        # Предсказание для последней строки
        prediction = predictor.predict_last_row(X)
        
        # Вывод результатов
        print("\n" + "="*50)
        print("РЕЗУЛЬТАТЫ ОБУЧЕНИЯ МОДЕЛИ")
        print("="*50)
        print(f"Точность (Accuracy): {metrics['accuracy']:.4f}")
        print(f"AUC: {metrics['auc']:.4f}")
        print(f"\nОтчет о классификации:")
        print(metrics['classification_report'])
        
        print(f"\nПРИМЕР ПРОГНОЗА (последняя строка):")
        print(f"Вероятность роста: {prediction['probability_up']:.4f}")
        print(f"Предсказание: {'Рост' if prediction['prediction'] == 1 else 'Падение'}")
        print(f"Уверенность: {prediction['confidence']:.4f}")
        print("="*50)
        
    except Exception as e:
        logger.error(f"Ошибка при обучении модели: {e}")
        raise
    
    finally:
        # Закрытие подключения к базе данных
        db_manager = get_database_manager()
        db_manager.close_connection()


if __name__ == "__main__":
    main()
