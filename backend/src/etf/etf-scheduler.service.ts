import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import { schedulerConfig } from '../config/scheduler.config';

@Injectable()
export class ETFSchedulerService {
  private readonly logger = new Logger(ETFSchedulerService.name);

  constructor(private readonly etfFlowService: UniversalETFFlowService) {}

  // Запуск каждый час в 00 минут
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyETFDataUpdate() {
    if (!schedulerConfig.enableAutoUpdate) {
      this.logger.log('⏸️ Автоматическое обновление отключено в конфигурации');
      return;
    }

    this.logger.log('🕐 Запуск автоматического обновления ETF данных...');

    try {
      // Парсинг Ethereum данных
      this.logger.log('📊 Парсинг Ethereum ETF данных...');
      const ethereumData =
        await this.etfFlowService.parseETFFlowData('ethereum');
      await this.etfFlowService.saveETFFlowData('ethereum', ethereumData);
      this.logger.log(
        `✅ Ethereum данные обновлены: ${ethereumData.length} записей`,
      );

      // Парсинг Bitcoin данных
      this.logger.log('📊 Парсинг Bitcoin ETF данных...');
      const bitcoinData = await this.etfFlowService.parseETFFlowData('bitcoin');
      await this.etfFlowService.saveETFFlowData('bitcoin', bitcoinData);
      this.logger.log(
        `✅ Bitcoin данные обновлены: ${bitcoinData.length} записей`,
      );

      this.logger.log(
        '🎉 Автоматическое обновление ETF данных завершено успешно!',
      );
    } catch (error) {
      this.logger.error(
        '❌ Ошибка при автоматическом обновлении ETF данных:',
        error,
      );
    }
  }

  // Запуск каждый день в 9:00 утра
  @Cron('0 9 * * *')
  async handleDailyETFDataUpdate() {
    this.logger.log('🌅 Запуск ежедневного обновления ETF данных...');

    try {
      // Полный парсинг всех данных
      this.logger.log('📊 Полный парсинг всех ETF данных...');
      await this.etfFlowService.parseAllETFFlowData();
      this.logger.log('✅ Ежедневное обновление ETF данных завершено успешно!');
    } catch (error) {
      this.logger.error(
        '❌ Ошибка при ежедневном обновлении ETF данных:',
        error,
      );
    }
  }

  // Ручной запуск обновления (для тестирования)
  async manualUpdate() {
    this.logger.log('🔄 Ручной запуск обновления ETF данных...');
    await this.handleHourlyETFDataUpdate();
  }
}
