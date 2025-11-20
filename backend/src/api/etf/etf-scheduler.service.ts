import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import { NotificationService } from '../notifications/notification.service';
import { ETFNotificationService } from './etf-notification.service';
import { schedulerConfig } from '../../shared/config/scheduler.config';

@Injectable()
export class ETFSchedulerService {
  private readonly logger = new Logger(ETFSchedulerService.name);

  constructor(
    private readonly etfFlowService: UniversalETFFlowService,
    private readonly notificationService: NotificationService,
    private readonly etfNotificationService: ETFNotificationService,
  ) {}

  // Запуск каждый час в 00 минут
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyETFDataUpdate() {
    if (!schedulerConfig.enableAutoUpdate) {
      this.logger.log('⏸️ Автоматическое обновление отключено в конфигурации');
      return;
    }

    this.logger.log('🕐 Запуск автоматического обновления ETF данных...');

    // Проверяем, нужно ли обновление
    const shouldUpdate = await this.etfFlowService.shouldUpdateToday();
    if (!shouldUpdate) {
      this.logger.log(
        '⏭️ Пропускаю автоматическое обновление - данные за сегодня уже актуальны',
      );
      return;
    }

    try {
      // Парсинг Ethereum данных
      this.logger.log('📊 Парсинг Ethereum ETF данных...');
      const ethereumData =
        await this.etfFlowService.parseETFFlowData('ethereum');
      const ethereumSaveResult = await this.etfFlowService.saveETFFlowData(
        'ethereum',
        ethereumData,
      );
      this.logger.log(
        `✅ Ethereum данные обновлены: ${ethereumData.length} записей, новых: ${ethereumSaveResult.newDataCount}`,
      );

      // Парсинг Bitcoin данных
      this.logger.log('📊 Парсинг Bitcoin ETF данных...');
      const bitcoinData = await this.etfFlowService.parseETFFlowData('bitcoin');
      const bitcoinSaveResult = await this.etfFlowService.saveETFFlowData(
        'bitcoin',
        bitcoinData,
      );
      this.logger.log(
        `✅ Bitcoin данные обновлены: ${bitcoinData.length} записей, новых: ${bitcoinSaveResult.newDataCount}`,
      );

      // Парсинг Solana данных
      this.logger.log('📊 Парсинг Solana ETF данных...');
      const solanaData = await this.etfFlowService.parseETFFlowData('solana');
      const solanaSaveResult = await this.etfFlowService.saveETFFlowData(
        'solana',
        solanaData,
      );
      this.logger.log(
        `✅ Solana данные обновлены: ${solanaData.length} записей, новых: ${solanaSaveResult.newDataCount}`,
      );

      // Отправляем уведомления о новых записях ETF (новая система - более точная)
      const allNewRecords = [
        ...(ethereumSaveResult.newRecords || []),
        ...(bitcoinSaveResult.newRecords || []),
        ...(solanaSaveResult.newRecords || []),
      ];

      if (allNewRecords.length > 0) {
        this.logger.log(
          `🔔 Обнаружено ${allNewRecords.length} новых записей ETF для уведомлений`,
        );
        await this.etfNotificationService.sendETFNotificationsForNewRecords(
          'etf.flow',
        );
      } else {
        // Если нет новых записей через новую систему, используем старую систему для совместимости
        // Но только если действительно есть новые данные (не просто обновление существующих)
        if (
          ethereumSaveResult.hasNewData ||
          bitcoinSaveResult.hasNewData ||
          solanaSaveResult.hasNewData
        ) {
          this.logger.log(
            '📊 Новых записей через новую систему нет, но есть новые данные - используем старую систему уведомлений',
          );
          await this.sendETFUpdateNotification(
            ethereumData,
            bitcoinData,
            ethereumSaveResult,
            bitcoinSaveResult,
            solanaSaveResult,
          );
        } else {
          this.logger.log(
            '📭 Новых данных не обнаружено, уведомления не отправляются',
          );
        }
      }

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

  // Отправка уведомлений о новых записях каждые 15 минут
  @Cron('*/15 * * * *')
  async handleETFNotificationsUpdate() {
    if (!schedulerConfig.enableAutoUpdate) {
      return;
    }

    this.logger.log('🔔 Проверка новых записей ETF для уведомлений...');

    try {
      await this.etfNotificationService.sendETFNotificationsForNewRecords(
        'etf.flow',
      );
    } catch (error) {
      this.logger.error(
        '❌ Ошибка при отправке уведомлений о новых записях ETF:',
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
    ethereumSaveResult?: any,
    bitcoinSaveResult?: any,
    solanaSaveResult?: any,
  ) {
    try {
      // Используем только новые данные для уведомления
      const ethereumNewData = ethereumSaveResult?.newData;
      const bitcoinNewData = bitcoinSaveResult?.newData;
      const solanaNewData = solanaSaveResult?.newData;

      // Если нет новых данных, не отправляем уведомление
      if (!ethereumNewData && !bitcoinNewData && !solanaNewData) {
        this.logger.log('📭 Нет новых данных для отправки уведомления');
        return;
      }

      // Получаем последние данные для сравнения
      const latestEthereum = ethereumData[0];
      const latestBitcoin = bitcoinData[0];

      if (!latestEthereum || !latestBitcoin) {
        this.logger.warn('⚠️ Нет данных для отправки уведомления');
        return;
      }

      // Вычисляем реальный поток как разницу между текущим и предыдущим днем
      // ethereumData и bitcoinData отсортированы по дате desc, поэтому:
      // [0] - текущий день, [1] - предыдущий день
      const currentEthereumTotal =
        ethereumNewData?.total || latestEthereum.total || 0;
      const previousEthereumTotal = ethereumData[1]?.total || 0;
      const ethereumFlow = currentEthereumTotal - previousEthereumTotal;

      const currentBitcoinTotal =
        bitcoinNewData?.total || latestBitcoin.total || 0;
      const previousBitcoinTotal = bitcoinData[1]?.total || 0;
      const bitcoinFlow = currentBitcoinTotal - previousBitcoinTotal;

      // Для Solana используем тот же подход
      const currentSolanaTotal = solanaNewData?.total || 0;
      const solanaData = await this.etfFlowService.getETFFlowData('solana');
      const previousSolanaTotal = (solanaData as any[])[1]?.total || 0;
      const solanaFlow = currentSolanaTotal - previousSolanaTotal;

      // Логируем вычисленные потоки для отладки
      this.logger.log(
        `📊 Вычисленные потоки: Bitcoin: ${bitcoinFlow.toFixed(2)}M (текущий: ${currentBitcoinTotal.toFixed(2)}M, предыдущий: ${previousBitcoinTotal.toFixed(2)}M), Ethereum: ${ethereumFlow.toFixed(2)}M (текущий: ${currentEthereumTotal.toFixed(2)}M, предыдущий: ${previousEthereumTotal.toFixed(2)}M)`,
      );

      // Проверяем, что данные за текущий день (не за прошлые дни)
      const notificationDate = ethereumNewData?.date
        ? new Date(ethereumNewData.date)
        : latestEthereum?.date
          ? new Date(latestEthereum.date)
          : new Date();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const notificationDateOnly = new Date(notificationDate);
      notificationDateOnly.setHours(0, 0, 0, 0);

      // Отправляем уведомление только за текущий день
      if (notificationDateOnly.getTime() !== today.getTime()) {
        this.logger.log(
          `⏭️ Пропускаем отправку уведомления - данные за ${notificationDateOnly.toISOString().split('T')[0]}, а не за сегодня`,
        );
        return;
      }

      // Отправляем уведомление только если есть значительные потоки
      if (
        Math.abs(ethereumFlow) > 0.1 ||
        Math.abs(bitcoinFlow) > 0.1 ||
        Math.abs(solanaFlow) > 0.1
      ) {
        const notificationData = {
          bitcoinFlow,
          ethereumFlow,
          solanaFlow,
          bitcoinTotal: currentBitcoinTotal,
          ethereumTotal: currentEthereumTotal,
          solanaTotal: currentSolanaTotal,
          date: notificationDate.toISOString(),
          bitcoinData: bitcoinNewData || latestBitcoin,
          ethereumData: ethereumNewData || latestEthereum,
          solanaData: solanaNewData || undefined,
        };

        await this.notificationService.sendETFNotifications(
          notificationData,
          'etf.flow', // appName
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
