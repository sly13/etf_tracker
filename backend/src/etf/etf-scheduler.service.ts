import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import { NotificationService } from '../notifications/notification.service';
import { schedulerConfig } from '../config/scheduler.config';

@Injectable()
export class ETFSchedulerService {
  private readonly logger = new Logger(ETFSchedulerService.name);

  constructor(
    private readonly etfFlowService: UniversalETFFlowService,
    private readonly notificationService: NotificationService,
  ) {}

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

      // Отправляем уведомление о новых данных
      await this.sendETFUpdateNotification(ethereumData, bitcoinData);

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

  /**
   * Отправка уведомления о новых данных ETF
   */
  private async sendETFUpdateNotification(
    ethereumData: any[],
    bitcoinData: any[],
  ) {
    try {
      // Получаем последние данные
      const latestEthereum = ethereumData[0];
      const latestBitcoin = bitcoinData[0];

      if (!latestEthereum || !latestBitcoin) {
        this.logger.warn('⚠️ Нет данных для отправки уведомления');
        return;
      }

      // Проверяем, есть ли новые данные (не нулевые потоки)
      const ethereumFlow = latestEthereum.total || 0;
      const bitcoinFlow = latestBitcoin.total || 0;

      // Отправляем уведомление только если есть значительные потоки
      if (Math.abs(ethereumFlow) > 0.1 || Math.abs(bitcoinFlow) > 0.1) {
        const notificationData = {
          bitcoinFlow,
          ethereumFlow,
          bitcoinTotal: bitcoinFlow,
          ethereumTotal: ethereumFlow,
          date: latestEthereum.date || new Date().toISOString(),
        };

        await this.notificationService.sendETFUpdateNotification(
          notificationData,
        );
        this.logger.log('📱 Уведомление о новых данных ETF отправлено');
      } else {
        this.logger.log('📊 Потоки ETF слишком малы для уведомления');
      }
    } catch (error) {
      this.logger.error('❌ Ошибка отправки уведомления о ETF:', error);
    }
  }
}
