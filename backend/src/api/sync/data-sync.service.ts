import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class DataSyncService {
  private readonly logger = new Logger(DataSyncService.name);

  /**
   * Синхронизация данных при старте приложения
   */
  async onApplicationBootstrap() {
    this.logger.log('🚀 Запуск начальной синхронизации данных...');
    await this.syncAllData();
  }

  /**
   * Синхронизация всех данных (BTC и ETH klines)
   */
  async syncAllData(): Promise<void> {
    try {
      this.logger.log('📊 Начинаем синхронизацию всех данных...');

      // Синхронизация BTC klines
      await this.syncBTCKlines();

      // Небольшая пауза между синхронизациями
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Синхронизация ETH klines
      await this.syncETHKlines();

      this.logger.log('✅ Синхронизация всех данных завершена');
    } catch (error) {
      this.logger.error('❌ Ошибка при синхронизации данных:', error);
    }
  }

  /**
   * Синхронизация BTC klines
   */
  async syncBTCKlines(): Promise<void> {
    try {
      this.logger.log('🟠 Синхронизация BTC klines...');
      const { stdout, stderr } = await execAsync('npm run sync:btc-klines');

      if (stderr) {
        this.logger.warn('⚠️ Предупреждения при синхронизации BTC:', stderr);
      }

      this.logger.log('✅ BTC klines синхронизированы');
    } catch (error) {
      this.logger.error('❌ Ошибка при синхронизации BTC klines:', error);
    }
  }

  /**
   * Синхронизация ETH klines
   */
  async syncETHKlines(): Promise<void> {
    try {
      this.logger.log('🔵 Синхронизация ETH klines...');
      const { stdout, stderr } = await execAsync('npm run sync:eth-klines');

      if (stderr) {
        this.logger.warn('⚠️ Предупреждения при синхронизации ETH:', stderr);
      }

      this.logger.log('✅ ETH klines синхронизированы');
    } catch (error) {
      this.logger.error('❌ Ошибка при синхронизации ETH klines:', error);
    }
  }

  /**
   * Автоматическая синхронизация каждые 5 минут
   */
  @Cron('*/5 * * * *')
  async handlePeriodicSync() {
    this.logger.log('⏰ Запуск периодической синхронизации данных...');
    await this.syncAllData();
  }

  /**
   * Ручной запуск синхронизации (для API)
   */
  async triggerManualSync(): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log('🔧 Ручной запуск синхронизации данных...');
      await this.syncAllData();
      return {
        success: true,
        message: 'Синхронизация данных выполнена успешно',
      };
    } catch (error) {
      this.logger.error('❌ Ошибка при ручной синхронизации:', error);
      return {
        success: false,
        message: `Ошибка синхронизации: ${error.message}`,
      };
    }
  }
}



