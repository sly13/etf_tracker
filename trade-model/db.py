"""
Database connection and data loading utilities for ETF Bitcoin prediction model.
"""

import os
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
import logging
from typing import Optional, Tuple

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Загрузка переменных окружения
load_dotenv()


class DatabaseManager:
    """Менеджер для работы с базой данных PostgreSQL."""
    
    def __init__(self):
        """Инициализация подключения к базе данных."""
        self.engine = None
        self._connect()
    
    def _connect(self) -> None:
        """Создание подключения к базе данных."""
        try:
            db_host = os.getenv('DB_HOST', 'localhost')
            db_port = os.getenv('DB_PORT', '5432')
            db_name = os.getenv('DB_NAME', 'etf_tracker')
            db_user = os.getenv('DB_USER', 'postgres')
            db_password = os.getenv('DB_PASSWORD', '')
            
            connection_string = (
                f"postgresql://{db_user}:{db_password}@"
                f"{db_host}:{db_port}/{db_name}"
            )
            
            self.engine = create_engine(connection_string)
            
            # Проверка подключения
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            logger.info("Успешное подключение к базе данных")
            
        except SQLAlchemyError as e:
            logger.error(f"Ошибка подключения к базе данных: {e}")
            self.engine = None
    
    def is_connected(self) -> bool:
        """Проверка состояния подключения."""
        return self.engine is not None
    
    def load_bitcoin_data(self, symbol: str = 'BTCUSDT', lookback_days: int = 365) -> Optional[pd.DataFrame]:
        """
        Загрузка данных о цене Биткоина из базы данных.
        
        Args:
            symbol: Символ торговой пары (по умолчанию BTCUSDT)
            lookback_days: Количество дней для загрузки данных
            
        Returns:
            DataFrame с данными OHLCV или None в случае ошибки
        """
        if not self.is_connected():
            logger.error("Нет подключения к базе данных")
            return None
        
        try:
            query = text("""
                SELECT 
                    open_time as timestamp,
                    open,
                    high,
                    low,
                    close,
                    volume
                FROM btc_candles 
                WHERE symbol = :symbol 
                AND interval = '5m'
                AND open_time >= NOW() - INTERVAL ':lookback_days days'
                ORDER BY open_time ASC
            """)
            
            df = pd.read_sql(
                query, 
                self.engine, 
                params={'symbol': symbol, 'lookback_days': lookback_days}
            )
            
            if df.empty:
                logger.warning(f"Нет данных для символа {symbol}")
                return None
            
            # Конвертация timestamp в datetime
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df.set_index('timestamp', inplace=True)
            
            # Агрегация в дневные данные
            df_daily = df.resample('D').agg({
                'open': 'first',
                'high': 'max',
                'low': 'min',
                'close': 'last',
                'volume': 'sum'
            }).dropna()
            
            logger.info(f"Загружено {len(df_daily)} дневных записей для {symbol}")
            return df_daily
            
        except SQLAlchemyError as e:
            logger.error(f"Ошибка загрузки данных Биткоина: {e}")
            return None
    
    def load_etf_flow_data(self, lookback_days: int = 365) -> Optional[pd.DataFrame]:
        """
        Загрузка данных о притоках ETF из базы данных.
        
        Args:
            lookback_days: Количество дней для загрузки данных
            
        Returns:
            DataFrame с данными о притоках ETF или None в случае ошибки
        """
        if not self.is_connected():
            logger.error("Нет подключения к базе данных")
            return None
        
        try:
            query = text("""
                SELECT 
                    date,
                    total as etf_flow
                FROM btc_flows 
                WHERE date >= NOW() - INTERVAL ':lookback_days days'
                ORDER BY date ASC
            """)
            
            df = pd.read_sql(
                query, 
                self.engine, 
                params={'lookback_days': lookback_days}
            )
            
            if df.empty:
                logger.warning("Нет данных о притоках ETF")
                return None
            
            # Конвертация date в datetime
            df['date'] = pd.to_datetime(df['date'])
            df.set_index('date', inplace=True)
            
            logger.info(f"Загружено {len(df)} записей о притоках ETF")
            return df
            
        except SQLAlchemyError as e:
            logger.error(f"Ошибка загрузки данных ETF: {e}")
            return None
    
    def load_combined_data(self, symbol: str = 'BTCUSDT', lookback_days: int = 365) -> Optional[pd.DataFrame]:
        """
        Загрузка и объединение данных о Биткоине и притоках ETF.
        
        Args:
            symbol: Символ торговой пары
            lookback_days: Количество дней для загрузки данных
            
        Returns:
            Объединенный DataFrame или None в случае ошибки
        """
        # Загрузка данных
        btc_data = self.load_bitcoin_data(symbol, lookback_days)
        etf_data = self.load_etf_flow_data(lookback_days)
        
        if btc_data is None:
            logger.error("Не удалось загрузить данные Биткоина")
            return None
        
        if etf_data is None:
            logger.warning("Не удалось загрузить данные ETF, используем только данные Биткоина")
            return btc_data
        
        # Объединение данных по дате
        combined_data = pd.merge(
            btc_data, 
            etf_data, 
            left_index=True, 
            right_index=True, 
            how='left'
        )
        
        # Заполнение пропущенных значений ETF потока нулями
        combined_data['etf_flow'] = combined_data['etf_flow'].fillna(0)
        
        logger.info(f"Объединено {len(combined_data)} записей")
        return combined_data
    
    def close_connection(self) -> None:
        """Закрытие подключения к базе данных."""
        if self.engine:
            self.engine.dispose()
            logger.info("Подключение к базе данных закрыто")


# Глобальный экземпляр менеджера базы данных
db_manager = DatabaseManager()


def get_database_manager() -> DatabaseManager:
    """Получение экземпляра менеджера базы данных."""
    return db_manager


def load_training_data(symbol: str = 'BTCUSDT', lookback_days: int = 365) -> Optional[pd.DataFrame]:
    """
    Удобная функция для загрузки данных для обучения модели.
    
    Args:
        symbol: Символ торговой пары
        lookback_days: Количество дней для загрузки данных
        
    Returns:
        DataFrame с данными для обучения или None в случае ошибки
    """
    return db_manager.load_combined_data(symbol, lookback_days)


if __name__ == "__main__":
    # Тестирование подключения
    manager = DatabaseManager()
    
    if manager.is_connected():
        print("✅ Подключение к базе данных успешно")
        
        # Тестовая загрузка данных
        data = load_training_data(lookback_days=30)
        if data is not None:
            print(f"✅ Загружено {len(data)} записей")
            print(data.head())
        else:
            print("❌ Не удалось загрузить данные")
    else:
        print("❌ Не удалось подключиться к базе данных")
    
    manager.close_connection()
