import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

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
      appName?: string;
      userId?: string;
      deviceId?: string;
      deviceType?: string;
      appVersion?: string;
      osVersion?: string;
      language?: string;
      timezone?: string;
      deviceName?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    },
  ) {
    const success = await this.notificationService.registerDevice(
      body.token,
      body.appName || 'etf.flow',
      body.userId,
      body.deviceId,
      {
        deviceType: body.deviceType,
        appVersion: body.appVersion,
        osVersion: body.osVersion,
        language: body.language,
        timezone: body.timezone,
        deviceName: body.deviceName,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
      },
    );
    return {
      success,
      message: success
        ? 'Устройство зарегистрировано'
        : 'Ошибка регистрации устройства',
    };
  }

  /**
   * Отправка тестового уведомления
   */
  @Post('test')
  async sendTestNotification() {
    const success = await this.notificationService.sendTestNotificationToAll();
    return {
      success,
      message: success
        ? 'Тестовое уведомление отправлено'
        : 'Ошибка отправки уведомления',
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
      message: settings ? 'Настройки получены' : 'Настройки не найдены',
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
      enableETFUpdates?: boolean;
      enableSignificantFlow?: boolean;
      enableTestNotifications?: boolean;
      enableFlowAmount?: boolean;
      minFlowThreshold?: number;
      significantChangePercent?: number;
      flowAmountThreshold?: number;
      quietHoursStart?: string;
      quietHoursEnd?: string;
    },
  ) {
    const success = await this.notificationService.updateDeviceSettings(
      body.token,
      body,
    );
    return {
      success,
      message: success ? 'Настройки обновлены' : 'Ошибка обновления настроек',
    };
  }
}
