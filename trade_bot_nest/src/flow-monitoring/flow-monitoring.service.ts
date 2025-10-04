import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FlowMonitoringService {
  private readonly logger = new Logger(FlowMonitoringService.name);
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastCheckTime = {
    btc: null as Date | null,
    eth: null as Date | null,
  };
  private stats = {
    totalChecks: 0,
    btcChecks: 0,
    ethChecks: 0,
    positionsOpened: 0,
    errors: 0,
  };

  constructor(private databaseService: DatabaseService) {}

  async start() {
    if (this.isRunning) {
      this.logger.warn('Мониторинг уже запущен');
      return;
    }

    this.isRunning = true;
    this.logger.log('🚀 Запуск мониторинга Flow данных');

    // Запускаем периодическую проверку
    const checkInterval = parseInt(process.env.CHECK_INTERVAL || '60000');
    this.intervalId = setInterval(() => {
      this.checkFlowData();
    }, checkInterval);

    // Первоначальная проверка
    await this.checkFlowData();
  }

  async stop() {
    if (!this.isRunning) {
      this.logger.warn('Мониторинг не запущен');
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.logger.log('🛑 Мониторинг Flow данных остановлен');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheckTime: this.lastCheckTime,
      stats: this.stats,
    };
  }

  getStats() {
    return this.stats;
  }

  resetStats() {
    this.stats = {
      totalChecks: 0,
      btcChecks: 0,
      ethChecks: 0,
      positionsOpened: 0,
      errors: 0,
    };
    this.logger.log('📊 Статистика сброшена');
  }

  private async checkFlowData() {
    try {
      this.stats.totalChecks++;
      this.logger.debug('🔍 Проверка Flow данных...');

      // Проверяем BTC Flow
      await this.checkBTCFlow();

      // Проверяем ETH Flow
      await this.checkETHFlow();
    } catch (error) {
      this.stats.errors++;
      this.logger.error('❌ Ошибка при проверке Flow данных:', error);
    }
  }

  private async checkBTCFlow() {
    try {
      this.stats.btcChecks++;
      this.lastCheckTime.btc = new Date();

      // Получаем последние данные BTC Flow
      const flows = await this.databaseService.getLatestBTCFlow(1);

      if (flows.length > 0) {
        const latestFlow = flows[0];
        const totalFlow = latestFlow.total || 0;

        this.logger.debug(`📊 BTC Flow: ${totalFlow}`);

        // Проверяем пороговое значение
        const minFlowThreshold = parseFloat(
          process.env.MIN_FLOW_THRESHOLD || '1000000',
        );

        if (Math.abs(totalFlow) >= minFlowThreshold) {
          this.logger.log(`🚨 BTC Flow превысил порог: ${totalFlow}`);
          // Здесь можно добавить логику открытия позиций
          await this.handleFlowThreshold('BTC', totalFlow);
        }
      }
    } catch (error) {
      this.logger.error('Ошибка проверки BTC Flow:', error);
      throw error;
    }
  }

  private async checkETHFlow() {
    try {
      this.stats.ethChecks++;
      this.lastCheckTime.eth = new Date();

      // Получаем последние данные ETH Flow
      const flows = await this.databaseService.getLatestETHFlow(1);

      if (flows.length > 0) {
        const latestFlow = flows[0];
        const totalFlow = latestFlow.total || 0;

        this.logger.debug(`📊 ETH Flow: ${totalFlow}`);

        // Проверяем пороговое значение
        const minFlowThreshold = parseFloat(
          process.env.MIN_FLOW_THRESHOLD || '1000000',
        );

        if (Math.abs(totalFlow) >= minFlowThreshold) {
          this.logger.log(`🚨 ETH Flow превысил порог: ${totalFlow}`);
          // Здесь можно добавить логику открытия позиций
          await this.handleFlowThreshold('ETH', totalFlow);
        }
      }
    } catch (error) {
      this.logger.error('Ошибка проверки ETH Flow:', error);
      throw error;
    }
  }

  private async handleFlowThreshold(asset: string, flowValue: number) {
    try {
      // Определяем направление торговли на основе знака flow
      const side = flowValue > 0 ? 'long' : 'short';
      const symbol = `${asset}-USDT`;

      this.logger.log(
        `💼 Открытие позиции: ${symbol} ${side} (Flow: ${flowValue})`,
      );

      // Здесь можно добавить логику размещения ордеров через OKX API
      // Пока просто логируем

      this.stats.positionsOpened++;
    } catch (error) {
      this.logger.error(`Ошибка обработки порога Flow для ${asset}:`, error);
    }
  }
}
