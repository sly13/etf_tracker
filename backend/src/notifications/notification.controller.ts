import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import {
  NotificationService,
  ETFNotificationData,
} from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Регистрация устройства
   */
  @Post('register-device')
  async registerDevice(
    @Body()
    body: {
      token: string;
      deviceType?: string;
      appVersion?: string;
      osVersion?: string;
      language?: string;
      timezone?: string;
      deviceName?: string;
    },
  ) {
    const success = await this.notificationService.registerDevice(body.token, {
      deviceType: body.deviceType,
      appVersion: body.appVersion,
      osVersion: body.osVersion,
      language: body.language,
      timezone: body.timezone,
      deviceName: body.deviceName,
    });
    return {
      success,
      message: success
        ? 'Устройство зарегистрировано'
        : 'Ошибка регистрации устройства',
    };
  }

  /**
   * Обновление настроек устройства
   */
  @Post('device-settings')
  async updateDeviceSettings(
    @Body()
    body: {
      token: string;
      isActive?: boolean;
      enableETFUpdates?: boolean;
      enableSignificantFlow?: boolean;
      enableTestNotifications?: boolean;
      minFlowThreshold?: number;
      significantChangePercent?: number;
      quietHoursStart?: string;
      quietHoursEnd?: string;
    },
  ) {
    const success = await this.notificationService.updateDeviceSettings(
      body.token,
      {
        isActive: body.isActive,
        enableETFUpdates: body.enableETFUpdates,
        enableSignificantFlow: body.enableSignificantFlow,
        enableTestNotifications: body.enableTestNotifications,
        minFlowThreshold: body.minFlowThreshold,
        significantChangePercent: body.significantChangePercent,
        quietHoursStart: body.quietHoursStart,
        quietHoursEnd: body.quietHoursEnd,
      },
    );
    return {
      success,
      message: success ? 'Настройки обновлены' : 'Ошибка обновления настроек',
    };
  }

  /**
   * Получение настроек устройства
   */
  @Get('device-settings/:token')
  async getDeviceSettings(@Param('token') token: string) {
    const settings = await this.notificationService.getDeviceSettings(token);
    return {
      success: settings !== null,
      settings,
      message: settings ? 'Настройки получены' : 'Устройство не найдено',
    };
  }

  /**
   * Отправка тестового уведомления
   */
  @Post('test')
  async sendTestNotification() {
    const success = await this.notificationService.sendTestNotification();
    return {
      success,
      message: success
        ? 'Тестовое уведомление отправлено'
        : 'Ошибка отправки уведомления',
    };
  }

  /**
   * Отправка уведомления о обновлении ETF (для тестирования)
   */
  @Post('etf-update')
  async sendETFUpdateNotification(@Body() data: ETFNotificationData) {
    const success =
      await this.notificationService.sendETFUpdateNotification(data);
    return {
      success,
      message: success
        ? 'Уведомление о ETF отправлено'
        : 'Ошибка отправки уведомления',
    };
  }

  /**
   * Получение статистики токенов
   */
  @Get('stats')
  async getNotificationStats() {
    const stats = await this.notificationService.getTokenStats();
    return {
      ...stats,
      message: `Всего токенов: ${stats.total}, активных: ${stats.active}`,
    };
  }

  /**
   * Получение настроек уведомлений
   */
  @Get('settings')
  async getNotificationSettings() {
    const settings = await this.notificationService.getNotificationSettings();
    return {
      success: true,
      settings,
    };
  }

  /**
   * Обновление настроек уведомлений
   */
  @Post('settings')
  async updateNotificationSettings(
    @Body()
    settings: {
      enableETFUpdates?: boolean;
      enableSignificantFlow?: boolean;
      enableTestNotifications?: boolean;
      minFlowThreshold?: number;
      significantChangePercent?: number;
      quietHoursStart?: string;
      quietHoursEnd?: string;
    },
  ) {
    const success =
      await this.notificationService.updateNotificationSettings(settings);
    return {
      success,
      message: success ? 'Настройки обновлены' : 'Ошибка обновления настроек',
    };
  }

  /**
   * Очистка невалидных токенов
   */
  @Post('cleanup-tokens')
  async cleanupInvalidTokens() {
    await this.notificationService.cleanupInvalidTokens();
    return {
      success: true,
      message: 'Невалидные токены очищены',
    };
  }
}
