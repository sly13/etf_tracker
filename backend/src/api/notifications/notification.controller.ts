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
   * Отправка тестового уведомления на конкретное устройство по FCM токену
   */
  @Post('test-token')
  async sendTestNotificationToToken(
    @Body()
    body: {
      token: string;
      title?: string;
      body?: string;
    },
  ) {
    if (!body.token) {
      return {
        success: false,
        error: 'FCM токен обязателен',
      };
    }

    const success = await this.notificationService.sendTestNotification(
      body.token,
      body.body ||
        'Тестовое уведомление с бэкенда для проверки работы на симуляторе',
      body.title,
    );

    return {
      success,
      message: success
        ? 'Тестовое уведомление отправлено на устройство'
        : 'Ошибка отправки уведомления',
    };
  }

  /**
   * Отправка тестового уведомления на любое зарегистрированное устройство
   */
  @Post('test-any')
  async sendTestNotificationToAnyDevice(
    @Body()
    body: {
      appName?: string;
      title?: string;
      body?: string;
    },
  ) {
    const appName = body.appName || 'etf.flow';

    try {
      // Находим любое зарегистрированное устройство с FCM токеном
      // Используем прямой доступ через PrismaService (нужно добавить его в конструктор)
      const prismaService = (this.notificationService as any).prismaService;
      // Находим пользователей с токенами и фильтруем вручную
      const users = await prismaService.user.findMany({
        where: {
          isActive: true,
          application: { name: appName },
        },
        include: { application: true },
        orderBy: { createdAt: 'desc' },
      });

      // Фильтруем пользователей с валидным FCM токеном
      const user = users.find((u) => u.deviceToken && u.deviceToken.length > 0);

      if (!user) {
        return {
          success: false,
          error: `Не найдено зарегистрированных устройств для приложения ${appName}`,
        };
      }

      if (!user.deviceToken) {
        return {
          success: false,
          error: 'У найденного устройства нет FCM токена',
        };
      }

      const success = await this.notificationService.sendTestNotification(
        user.deviceToken,
        body.body ||
          'Тестовое уведомление с бэкенда для проверки работы на симуляторе',
        body.title,
      );

      return {
        success,
        message: success
          ? `Тестовое уведомление отправлено на устройство ${user.deviceId || 'unknown'}`
          : 'Ошибка отправки уведомления',
        deviceId: user.deviceId,
        deviceToken: user.deviceToken.substring(0, 20) + '...',
      };
    } catch (error) {
      return {
        success: false,
        error: `Ошибка поиска устройства: ${error.message}`,
      };
    }
  }

  /**
   * Отправка тестового уведомления на устройство по device ID
   */
  @Post('test-device')
  async sendTestNotificationToDevice(
    @Body()
    body: {
      deviceId: string;
      appName?: string;
      title?: string;
      body?: string;
    },
  ) {
    if (!body.deviceId) {
      return {
        success: false,
        error: 'Device ID обязателен',
      };
    }

    const appName = body.appName || 'etf.flow';

    // Очищаем device ID от префикса (если есть)
    let cleanDeviceId = body.deviceId;
    if (cleanDeviceId.startsWith('ios_')) {
      cleanDeviceId = cleanDeviceId.substring(4);
    } else if (cleanDeviceId.startsWith('android_')) {
      cleanDeviceId = cleanDeviceId.substring(8);
    }

    // Получаем пользователя по device ID (пробуем оба варианта)
    let user = await this.notificationService.getUserByDeviceId(
      appName,
      cleanDeviceId,
    );

    // Если не нашли с чистым ID, пробуем с исходным
    if (!user && cleanDeviceId !== body.deviceId) {
      user = await this.notificationService.getUserByDeviceId(
        appName,
        body.deviceId,
      );
    }

    if (!user) {
      return {
        success: false,
        error: `Устройство с deviceId ${body.deviceId} не найдено`,
      };
    }

    if (!user.deviceToken) {
      return {
        success: false,
        error: 'У устройства нет FCM токена',
      };
    }

    const success = await this.notificationService.sendTestNotification(
      user.deviceToken,
      body.body ||
        'Тестовое уведомление с бэкенда для проверки работы на симуляторе',
      body.title,
    );

    return {
      success,
      message: success
        ? `Тестовое уведомление отправлено на устройство ${body.deviceId}`
        : 'Ошибка отправки уведомления',
      deviceId: body.deviceId,
      deviceToken: user.deviceToken.substring(0, 20) + '...',
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
