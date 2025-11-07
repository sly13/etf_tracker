import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { spawn } from 'child_process';

@Injectable()
export class DataSyncService {
  private readonly logger = new Logger(DataSyncService.name);
  private syncInProgress = false;
  private syncProcess: any = null;

  /**
   * Синхронизация данных при старте приложения (запускается в фоне)
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async onApplicationBootstrap() {
    this.logger.log(
      '🚀 Запуск начальной синхронизации данных в фоновом режиме...',
    );
    // Запускаем в фоне, не блокируя старт сервера
    void this.syncAllDataInBackground().catch((error) => {
      this.logger.error('❌ Ошибка при фоновой синхронизации:', error);
    });
  }

  /**
   * Синхронизация всех данных в фоновом режиме (не блокирует выполнение)
   */
  private async syncAllDataInBackground(): Promise<void> {
    if (this.syncInProgress) {
      this.logger.warn('⚠️ Синхронизация уже выполняется, пропускаем...');
      return;
    }

    this.syncInProgress = true;
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
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Синхронизация всех данных (BTC и ETH klines) - для ручного запуска
   */
  async syncAllData(): Promise<void> {
    if (this.syncInProgress) {
      this.logger.warn('⚠️ Синхронизация уже выполняется, запускаем в фоне...');
      return;
    }

    await this.syncAllDataInBackground();
  }

  /**
   * Синхронизация BTC klines
   */
  async syncBTCKlines(maxHoursBack?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.logger.log('🟠 Синхронизация BTC klines...');

        // Подготавливаем переменные окружения
        const env = { ...process.env };
        if (maxHoursBack !== undefined && maxHoursBack > 0) {
          env.MAX_HOURS_BACK = maxHoursBack.toString();
          this.logger.log(
            `⏰ Ограничение: синхронизируем только последние ${maxHoursBack} часов`,
          );
        }

        // Используем spawn для потоковой обработки вывода
        const childProcess = spawn('npm', ['run', 'sync:btc-klines'], {
          cwd: process.cwd(),
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe'],
          env,
        });

        this.syncProcess = childProcess;

        let stderr = '';

        childProcess.stdout?.on('data', (data) => {
          const output = data.toString();
          // Логируем прогресс
          if (
            output.includes('Батч') ||
            output.includes('✅') ||
            output.includes('❌')
          ) {
            this.logger.log(`[BTC Sync] ${output.trim()}`);
          }
        });

        childProcess.stderr?.on('data', (data) => {
          const output = data.toString();
          stderr += output;
          // Логируем только важные предупреждения
          if (!output.includes('npm') && !output.includes('WARN')) {
            this.logger.warn(`[BTC Sync] ${output.trim()}`);
          }
        });

        childProcess.on('close', (code) => {
          this.syncProcess = null;
          if (code === 0) {
            this.logger.log('✅ BTC klines синхронизированы');
            resolve();
          } else {
            const error = new Error(`Процесс завершился с кодом ${code}`);
            this.logger.error('❌ Ошибка при синхронизации BTC klines:', error);
            if (stderr) {
              this.logger.error('Stderr:', stderr);
            }
            reject(error);
          }
        });

        childProcess.on('error', (error) => {
          this.syncProcess = null;
          this.logger.error(
            '❌ Ошибка при запуске синхронизации BTC klines:',
            error,
          );
          reject(error);
        });
      } catch (error) {
        this.logger.error('❌ Ошибка при синхронизации BTC klines:', error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Синхронизация ETH klines
   */
  async syncETHKlines(maxHoursBack?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.logger.log('🔵 Синхронизация ETH klines...');

        // Подготавливаем переменные окружения
        const env = { ...process.env };
        if (maxHoursBack !== undefined && maxHoursBack > 0) {
          env.MAX_HOURS_BACK = maxHoursBack.toString();
          this.logger.log(
            `⏰ Ограничение: синхронизируем только последние ${maxHoursBack} часов`,
          );
        }

        // Используем spawn для потоковой обработки вывода
        const childProcess = spawn('npm', ['run', 'sync:eth-klines'], {
          cwd: process.cwd(),
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe'],
          env,
        });

        this.syncProcess = childProcess;

        let stderr = '';

        childProcess.stdout?.on('data', (data) => {
          const output = data.toString();
          // Логируем прогресс
          if (
            output.includes('Батч') ||
            output.includes('✅') ||
            output.includes('❌')
          ) {
            this.logger.log(`[ETH Sync] ${output.trim()}`);
          }
        });

        childProcess.stderr?.on('data', (data) => {
          const output = data.toString();
          stderr += output;
          // Логируем только важные предупреждения
          if (!output.includes('npm') && !output.includes('WARN')) {
            this.logger.warn(`[ETH Sync] ${output.trim()}`);
          }
        });

        childProcess.on('close', (code) => {
          this.syncProcess = null;
          if (code === 0) {
            this.logger.log('✅ ETH klines синхронизированы');
            resolve();
          } else {
            const error = new Error(`Процесс завершился с кодом ${code}`);
            this.logger.error('❌ Ошибка при синхронизации ETH klines:', error);
            if (stderr) {
              this.logger.error('Stderr:', stderr);
            }
            reject(error);
          }
        });

        childProcess.on('error', (error) => {
          this.syncProcess = null;
          this.logger.error(
            '❌ Ошибка при запуске синхронизации ETH klines:',
            error,
          );
          reject(error);
        });
      } catch (error) {
        this.logger.error('❌ Ошибка при синхронизации ETH klines:', error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Автоматическая синхронизация каждые 30 минут
   * Синхронизирует от последней даты в БД (без ограничения по времени)
   */
  @Cron('*/30 * * * *')
  async handlePeriodicSync() {
    this.logger.log(
      '⏰ Запуск периодической синхронизации данных (от последней даты в БД)...',
    );

    if (this.syncInProgress) {
      this.logger.warn(
        '⚠️ Синхронизация уже выполняется, пропускаем периодическую синхронизацию...',
      );
      return;
    }

    this.syncInProgress = true;
    try {
      // Синхронизируем от последней даты в БД (без ограничения по времени)
      // Передаем undefined, чтобы скрипт использовал последнюю дату из БД
      const maxHoursBack = undefined;

      // Синхронизация BTC klines
      await this.syncBTCKlines(maxHoursBack);

      // Небольшая пауза между синхронизациями
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Синхронизация ETH klines
      await this.syncETHKlines(maxHoursBack);

      this.logger.log('✅ Периодическая синхронизация завершена');
    } catch (error) {
      this.logger.error(
        '❌ Ошибка при периодической синхронизации данных:',
        error,
      );
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Ручной запуск синхронизации (для API)
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async triggerManualSync(): Promise<{ success: boolean; message: string }> {
    if (this.syncInProgress) {
      return {
        success: false,
        message: 'Синхронизация уже выполняется',
      };
    }

    try {
      this.logger.log('🔧 Ручной запуск синхронизации данных...');
      // Запускаем в фоне, не блокируя ответ API
      void this.syncAllDataInBackground().catch((error) => {
        this.logger.error('❌ Ошибка при ручной синхронизации:', error);
      });

      return {
        success: true,
        message: 'Синхронизация данных запущена в фоновом режиме',
      };
    } catch (error) {
      this.logger.error('❌ Ошибка при запуске синхронизации:', error);
      return {
        success: false,
        message: `Ошибка запуска синхронизации: ${error.message}`,
      };
    }
  }

  /**
   * Получить статус синхронизации
   */
  getSyncStatus(): { inProgress: boolean; message: string } {
    return {
      inProgress: this.syncInProgress,
      message: this.syncInProgress
        ? 'Синхронизация выполняется'
        : 'Синхронизация не выполняется',
    };
  }

  /**
   * Прервать синхронизацию (если выполняется)
   * Метод async для совместимости, но не использует await
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async stopSync(): Promise<{ success: boolean; message: string }> {
    if (!this.syncInProgress || !this.syncProcess) {
      return {
        success: false,
        message: 'Синхронизация не выполняется',
      };
    }

    try {
      this.syncProcess.kill('SIGTERM');
      this.syncInProgress = false;
      this.syncProcess = null;
      this.logger.log('🛑 Синхронизация прервана');
      return {
        success: true,
        message: 'Синхронизация прервана',
      };
    } catch (error) {
      this.logger.error('❌ Ошибка при прерывании синхронизации:', error);
      return {
        success: false,
        message: `Ошибка: ${error.message}`,
      };
    }
  }
}
