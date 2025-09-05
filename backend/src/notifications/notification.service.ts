import { Injectable, Logger } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { PrismaService } from '../prisma/prisma.service';

export interface ETFNotificationData {
  bitcoinFlow: number;
  ethereumFlow: number;
  bitcoinTotal: number;
  ethereumTotal: number;
  date: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Регистрация устройства пользователя
   */
  async registerDevice(
    token: string,
    deviceInfo?: {
      deviceType?: string;
      appVersion?: string;
      osVersion?: string;
      language?: string;
      timezone?: string;
      deviceName?: string;
    },
  ): Promise<boolean> {
    try {
      // Проверяем валидность токена
      const isValid = await this.firebaseAdminService.validateToken(token);
      if (!isValid) {
        this.logger.warn(`⚠️ Невалидный FCM токен: ${token}`);
        return false;
      }

      // Сохраняем устройство в базе данных
      await this.prismaService.device.upsert({
        where: { token },
        update: {
          token,
          lastUsed: new Date(),
          isValid: true,
          isActive: true,
          deviceType: deviceInfo?.deviceType,
          appVersion: deviceInfo?.appVersion,
          osVersion: deviceInfo?.osVersion,
          language: deviceInfo?.language,
          timezone: deviceInfo?.timezone,
          deviceName: deviceInfo?.deviceName,
        },
        create: {
          token,
          lastUsed: new Date(),
          isValid: true,
          isActive: true,
          deviceType: deviceInfo?.deviceType,
          appVersion: deviceInfo?.appVersion,
          osVersion: deviceInfo?.osVersion,
          language: deviceInfo?.language,
          timezone: deviceInfo?.timezone,
          deviceName: deviceInfo?.deviceName,
          enableETFUpdates: true,
          enableSignificantFlow: true,
          enableTestNotifications: false,
          minFlowThreshold: 0.1,
          significantChangePercent: 20.0,
        },
      });

      this.logger.log(
        `✅ Устройство зарегистрировано: ${token.substring(0, 20)}...`,
      );
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка регистрации устройства:', error);
      return false;
    }
  }

  /**
   * Отправка уведомления о новых данных ETF
   */
  async sendETFUpdateNotification(data: ETFNotificationData): Promise<boolean> {
    try {
      const title = '📊 Обновление ETF потоков';
      const body = this.formatNotificationBody(data);

      const notificationData = {
        type: 'etf_update',
        bitcoin_flow: data.bitcoinFlow.toString(),
        ethereum_flow: data.ethereumFlow.toString(),
        bitcoin_total: data.bitcoinTotal.toString(),
        ethereum_total: data.ethereumTotal.toString(),
        date: data.date,
      };

      // Получаем активные устройства для ETF уведомлений
      const activeTokens = await this.getActiveDevicesForETFUpdates();

      if (activeTokens.length === 0) {
        this.logger.log('📱 Нет активных устройств для ETF уведомлений');
        return true;
      }

      // Отправляем уведомление на топик
      const success = await this.firebaseAdminService.sendNotificationToTopic(
        'etf_updates',
        title,
        body,
        notificationData,
      );

      // Обновляем статистику устройств
      if (success) {
        await this.updateDeviceNotificationStats(activeTokens);
      }

      // Логируем результат
      await this.logNotification(
        'etf_update',
        title,
        body,
        notificationData,
        activeTokens.length,
        success ? activeTokens.length : 0,
        success ? 0 : activeTokens.length,
      );

      if (success) {
        this.logger.log('✅ Уведомление о обновлении ETF отправлено');
      }

      return success;
    } catch (error) {
      this.logger.error('❌ Ошибка отправки уведомления о ETF:', error);
      return false;
    }
  }

  /**
   * Отправка уведомления о значительных изменениях в потоках
   */
  async sendSignificantFlowNotification(
    type: 'bitcoin' | 'ethereum',
    flow: number,
    previousFlow: number,
  ): Promise<boolean> {
    try {
      const change = flow - previousFlow;
      const changePercent =
        previousFlow !== 0 ? (change / Math.abs(previousFlow)) * 100 : 0;

      // Отправляем уведомление только при значительных изменениях (>20%)
      if (Math.abs(changePercent) < 20) {
        return false;
      }

      const isPositive = change > 0;
      const emoji = isPositive ? '📈' : '📉';
      const title = `${emoji} ${type === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} ETF`;

      const body = `${isPositive ? 'Приток' : 'Отток'}: ${Math.abs(change).toFixed(2)}M$ (${changePercent.toFixed(1)}%)`;

      const notificationData = {
        type: 'significant_flow',
        crypto_type: type,
        flow: flow.toString(),
        previous_flow: previousFlow.toString(),
        change: change.toString(),
        change_percent: changePercent.toString(),
      };

      const success = await this.firebaseAdminService.sendNotificationToTopic(
        'etf_updates',
        title,
        body,
        notificationData,
      );

      if (success) {
        this.logger.log(
          `✅ Уведомление о значительном изменении ${type} отправлено`,
        );
      }

      return success;
    } catch (error) {
      this.logger.error(
        '❌ Ошибка отправки уведомления о значительном изменении:',
        error,
      );
      return false;
    }
  }

  /**
   * Форматирование текста уведомления
   */
  private formatNotificationBody(data: ETFNotificationData): string {
    const bitcoinFlowText =
      data.bitcoinFlow >= 0
        ? `Bitcoin: +${data.bitcoinFlow.toFixed(2)}M$`
        : `Bitcoin: ${data.bitcoinFlow.toFixed(2)}M$`;

    const ethereumFlowText =
      data.ethereumFlow >= 0
        ? `Ethereum: +${data.ethereumFlow.toFixed(2)}M$`
        : `Ethereum: ${data.ethereumFlow.toFixed(2)}M$`;

    return `${bitcoinFlowText}, ${ethereumFlowText}`;
  }

  /**
   * Получение всех активных устройств для ETF уведомлений
   */
  async getActiveDevicesForETFUpdates(): Promise<string[]> {
    try {
      const devices = await this.prismaService.device.findMany({
        where: {
          isValid: true,
          isActive: true,
          enableETFUpdates: true,
        },
        select: { token: true },
      });

      return devices.map((d) => d.token);
    } catch (error) {
      this.logger.error('❌ Ошибка получения активных устройств:', error);
      return [];
    }
  }

  /**
   * Получение всех активных устройств для тестовых уведомлений
   */
  async getActiveDevicesForTestNotifications(): Promise<string[]> {
    try {
      const devices = await this.prismaService.device.findMany({
        where: {
          isValid: true,
          isActive: true,
          enableTestNotifications: true,
        },
        select: { token: true },
      });

      return devices.map((d) => d.token);
    } catch (error) {
      this.logger.error('❌ Ошибка получения устройств для тестов:', error);
      return [];
    }
  }

  /**
   * Получение статистики токенов
   */
  async getTokenStats(): Promise<{
    total: number;
    active: number;
    byDeviceType: Record<string, number>;
    byLanguage: Record<string, number>;
  }> {
    try {
      const [total, active, deviceStats, languageStats] = await Promise.all([
        this.prismaService.device.count(),
        this.prismaService.device.count({
          where: { isValid: true, isActive: true },
        }),
        this.prismaService.device.groupBy({
          by: ['deviceType'],
          where: { isValid: true },
          _count: { deviceType: true },
        }),
        this.prismaService.device.groupBy({
          by: ['language'],
          where: { isValid: true },
          _count: { language: true },
        }),
      ]);

      const byDeviceType = deviceStats.reduce(
        (acc, stat) => {
          acc[stat.deviceType || 'unknown'] = stat._count.deviceType;
          return acc;
        },
        {} as Record<string, number>,
      );

      const byLanguage = languageStats.reduce(
        (acc, stat) => {
          acc[stat.language || 'unknown'] = stat._count.language;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        total,
        active,
        byDeviceType,
        byLanguage,
      };
    } catch (error) {
      this.logger.error('❌ Ошибка получения статистики токенов:', error);
      return {
        total: 0,
        active: 0,
        byDeviceType: {},
        byLanguage: {},
      };
    }
  }

  /**
   * Логирование отправки уведомления
   */
  async logNotification(
    type: string,
    title: string,
    body: string,
    data: any,
    sentToTokens: number,
    successCount: number,
    failureCount: number,
  ): Promise<void> {
    try {
      await this.prismaService.notificationLog.create({
        data: {
          type,
          title,
          body,
          data: data ? JSON.stringify(data) : undefined,
          sentToTokens,
          successCount,
          failureCount,
        },
      });
    } catch (error) {
      this.logger.error('❌ Ошибка логирования уведомления:', error);
    }
  }

  /**
   * Получение настроек уведомлений
   */
  async getNotificationSettings(): Promise<any> {
    try {
      let settings = await this.prismaService.notificationSettings.findFirst();

      if (!settings) {
        // Создаем настройки по умолчанию
        settings = await this.prismaService.notificationSettings.create({
          data: {},
        });
      }

      return settings;
    } catch (error) {
      this.logger.error('❌ Ошибка получения настроек уведомлений:', error);
      return null;
    }
  }

  /**
   * Обновление настроек уведомлений
   */
  async updateNotificationSettings(settings: {
    enableETFUpdates?: boolean;
    enableSignificantFlow?: boolean;
    enableTestNotifications?: boolean;
    minFlowThreshold?: number;
    significantChangePercent?: number;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  }): Promise<boolean> {
    try {
      await this.prismaService.notificationSettings.upsert({
        where: { id: 'default' },
        update: settings,
        create: {
          id: 'default',
          ...settings,
        },
      });

      this.logger.log('✅ Настройки уведомлений обновлены');
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка обновления настроек уведомлений:', error);
      return false;
    }
  }

  /**
   * Очистка невалидных токенов
   */
  async cleanupInvalidTokens(): Promise<void> {
    try {
      const tokens = await this.prismaService.device.findMany({
        where: { isValid: true },
      });

      const invalidTokens: string[] = [];

      for (const tokenRecord of tokens) {
        const isValid = await this.firebaseAdminService.validateToken(
          tokenRecord.token,
        );
        if (!isValid) {
          invalidTokens.push(tokenRecord.token);
        }
      }

      if (invalidTokens.length > 0) {
        await this.prismaService.device.updateMany({
          where: { token: { in: invalidTokens } },
          data: { isValid: false },
        });

        this.logger.log(
          `🧹 Очищено ${invalidTokens.length} невалидных токенов`,
        );
      }
    } catch (error) {
      this.logger.error('❌ Ошибка очистки невалидных токенов:', error);
    }
  }

  /**
   * Обновление статистики уведомлений для устройств
   */
  async updateDeviceNotificationStats(tokens: string[]): Promise<void> {
    try {
      await this.prismaService.device.updateMany({
        where: { token: { in: tokens } },
        data: {
          lastNotificationSent: new Date(),
          notificationCount: { increment: 1 },
        },
      });
    } catch (error) {
      this.logger.error('❌ Ошибка обновления статистики устройств:', error);
    }
  }

  /**
   * Обновление настроек устройства
   */
  async updateDeviceSettings(
    token: string,
    settings: {
      isActive?: boolean;
      enableETFUpdates?: boolean;
      enableSignificantFlow?: boolean;
      enableTestNotifications?: boolean;
      minFlowThreshold?: number;
      significantChangePercent?: number;
      quietHoursStart?: string;
      quietHoursEnd?: string;
    },
  ): Promise<boolean> {
    try {
      await this.prismaService.device.update({
        where: { token },
        data: settings,
      });

      this.logger.log(
        `✅ Настройки устройства обновлены: ${token.substring(0, 20)}...`,
      );
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка обновления настроек устройства:', error);
      return false;
    }
  }

  /**
   * Получение настроек устройства
   */
  async getDeviceSettings(token: string): Promise<any> {
    try {
      const device = await this.prismaService.device.findUnique({
        where: { token },
        select: {
          isActive: true,
          enableETFUpdates: true,
          enableSignificantFlow: true,
          enableTestNotifications: true,
          minFlowThreshold: true,
          significantChangePercent: true,
          quietHoursStart: true,
          quietHoursEnd: true,
          notificationCount: true,
          lastNotificationSent: true,
        },
      });

      return device;
    } catch (error) {
      this.logger.error('❌ Ошибка получения настроек устройства:', error);
      return null;
    }
  }

  /**
   * Отправка тестового уведомления
   */
  async sendTestNotification(): Promise<boolean> {
    try {
      const title = '🧪 Тестовое уведомление';
      const body = 'ETF Tracker работает корректно!';

      // Получаем устройства, которые разрешили тестовые уведомления
      const testTokens = await this.getActiveDevicesForTestNotifications();

      if (testTokens.length === 0) {
        this.logger.log(
          '📱 Нет устройств с разрешенными тестовыми уведомлениями',
        );
        return true;
      }

      const success = await this.firebaseAdminService.sendNotificationToTopic(
        'etf_updates',
        title,
        body,
        { type: 'test' },
      );

      if (success) {
        await this.updateDeviceNotificationStats(testTokens);
        this.logger.log('✅ Тестовое уведомление отправлено');
      }

      return success;
    } catch (error) {
      this.logger.error('❌ Ошибка отправки тестового уведомления:', error);
      return false;
    }
  }
}
