import { Injectable, Logger, Optional } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';

export interface ETFNotificationData {
  bitcoinFlow: number;
  ethereumFlow: number;
  bitcoinTotal: number;
  ethereumTotal: number;
  date: string;
  bitcoinData?: any;
  ethereumData?: any;
}

export interface UserSettings {
  notifications: {
    enableETFUpdates: boolean;
    enableSignificantFlow: boolean;
    enableTestNotifications: boolean;
    enableTelegramNotifications: boolean;
    enableFlowAmount?: boolean;
    minFlowThreshold: number;
    significantChangePercent: number;
    flowAmountThreshold?: number;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  preferences: {
    language?: string;
    timezone?: string;
    deviceType?: string;
    appVersion?: string;
    osVersion?: string;
    deviceName?: string;
  };
  profile: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  [key: string]: any; // Добавляем индексную сигнатуру для совместимости с Prisma
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly prismaService: PrismaService,
    @Optional() private readonly telegramBotService?: TelegramBotService,
  ) {}

  /**
   * Форматирование значения потока: числа в БД в миллионах.
   * Если значение >= 1000M, показываем в B (миллиарды), иначе в M (миллионы).
   * Добавляет знак + для положительных значений и - для отрицательных.
   */
  private formatFlow(value: number): string {
    const abs = Math.abs(value);
    const sign = value >= 0 ? '+' : '-';
    
    if (abs >= 1000) {
      const billions = abs / 1000;
      return `${sign}${billions.toFixed(2)}B`;
    }
    return `${sign}${abs.toFixed(2)}M`;
  }

  /**
   * Регистрация устройства пользователя
   */
  async registerDevice(
    token: string,
    appName: string,
    userId?: string,
    deviceId?: string,
    deviceInfo?: {
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
  ): Promise<boolean> {
    try {
      // Логируем входящие данные
      this.logger.log('📥 === ВХОДЯЩИЕ ДАННЫЕ РЕГИСТРАЦИИ ===');
      this.logger.log(`   Token: ${token}`);
      this.logger.log(`   App Name: ${appName}`);
      this.logger.log(`   User ID: ${userId || 'НЕ ПЕРЕДАН'}`);
      this.logger.log(`   Device ID: ${deviceId || 'НЕ ПЕРЕДАН'}`);
      this.logger.log(`   Device Info:`, JSON.stringify(deviceInfo, null, 2));
      this.logger.log('=====================================');

      // Проверяем валидность токена
      this.logger.log('🔍 Проверяем валидность FCM токена...');
      const isValid = await this.firebaseAdminService.validateToken(token);
      if (!isValid) {
        this.logger.warn(
          `⚠️ Невалидный FCM токен: ${token.substring(0, 20)}...`,
        );
        this.logger.warn('💡 Возможные причины:');
        this.logger.warn('   - Токен устарел или был отозван');
        this.logger.warn('   - Приложение было переустановлено');
        this.logger.warn('   - Неверный формат токена');
        this.logger.warn('   - Проблемы с Firebase конфигурацией');
        return false;
      }
      this.logger.log('✅ FCM токен прошел валидацию');

      // Получаем или создаем приложение
      const application = await this.prismaService.application.upsert({
        where: { name: appName },
        update: {},
        create: {
          name: appName,
          displayName: this.getAppDisplayName(appName),
          description: this.getAppDescription(appName),
        },
      });

      // Извлекаем OS из deviceId и очищаем deviceId от префикса
      let os: string | undefined;
      let cleanDeviceId: string | undefined;

      this.logger.log('🔍 === ОБРАБОТКА DEVICE ID ===');
      this.logger.log(`   Исходный deviceId: ${deviceId}`);

      if (deviceId) {
        if (deviceId.startsWith('ios_')) {
          os = 'ios';
          cleanDeviceId = deviceId.substring(4); // Убираем 'ios_'
          this.logger.log(`   Обнаружен iOS префикс, убираем 'ios_'`);
        } else if (deviceId.startsWith('android_')) {
          os = 'android';
          cleanDeviceId = deviceId.substring(8); // Убираем 'android_'
          this.logger.log(`   Обнаружен Android префикс, убираем 'android_'`);
        } else {
          // Если нет префикса, определяем OS из deviceInfo
          os = deviceInfo?.deviceType?.toLowerCase() || 'unknown';
          cleanDeviceId = deviceId;
          this.logger.log(
            `   Префикс не найден, используем deviceType: ${deviceInfo?.deviceType}`,
          );
        }
      } else {
        this.logger.log(`   DeviceId не передан!`);
      }

      this.logger.log(
        `   Результат - OS: ${os}, Clean Device ID: ${cleanDeviceId}`,
      );
      this.logger.log('===============================');

      // Создаем настройки пользователя в JSON формате
      const userSettings: UserSettings = {
        notifications: {
          enableETFUpdates: this.getDefaultETFUpdates(appName),
          enableSignificantFlow: this.getDefaultSignificantFlow(appName),
          enableTestNotifications: false,
          enableTelegramNotifications: false,
          enableFlowAmount: false,
          minFlowThreshold: 0.1,
          significantChangePercent: 20.0,
          flowAmountThreshold: 10.0,
        },
        preferences: {
          language: deviceInfo?.language || 'en',
          timezone: deviceInfo?.timezone || 'UTC',
          deviceType: deviceInfo?.deviceType,
          appVersion: deviceInfo?.appVersion,
          osVersion: deviceInfo?.osVersion,
          deviceName: deviceInfo?.deviceName,
        },
        profile: {
          firstName: deviceInfo?.firstName,
          lastName: deviceInfo?.lastName,
          email: deviceInfo?.email,
          phone: deviceInfo?.phone,
        },
      };

      this.logger.log('💾 === СОХРАНЕНИЕ В БД ===');
      this.logger.log(`   Application ID: ${application.id}`);
      this.logger.log(`   Clean Device ID: ${cleanDeviceId}`);
      this.logger.log(`   OS: ${os}`);
      this.logger.log(`   Settings:`, JSON.stringify(userSettings, null, 2));
      this.logger.log('========================');

      // Сохраняем пользователя в базе данных
      await this.prismaService.user.upsert({
        where: { deviceToken: token },
        update: {
          applicationId: application.id,
          deviceId: cleanDeviceId,
          os: os,
          lastUsed: new Date(),
          isActive: true,
          settings: userSettings,
        },
        create: {
          applicationId: application.id,
          deviceId: cleanDeviceId,
          deviceToken: token,
          os: os,
          lastUsed: new Date(),
          isActive: true,
          settings: userSettings,
        },
      });

      this.logger.log(
        `✅ Устройство зарегистрировано для приложения ${appName}: ${cleanDeviceId || 'unknown'} (OS: ${os || 'unknown'})`,
      );

      // Дополнительная проверка - убеждаемся, что пользователь действительно создан
      const createdUser = await this.prismaService.user.findFirst({
        where: { deviceToken: token },
      });

      if (createdUser) {
        this.logger.log(
          `✅ Подтверждение: Пользователь создан в БД с ID: ${createdUser.id}`,
        );
        this.logger.log(`✅ DeviceId в БД: ${createdUser.deviceId}`);
        this.logger.log(`✅ OS в БД: ${createdUser.os}`);
      } else {
        this.logger.error(
          `❌ ОШИБКА: Пользователь не найден в БД после создания!`,
        );
      }

      // Проверяем, есть ли ожидающие Telegram аккаунты для этого deviceId
      if (cleanDeviceId) {
        this.checkPendingTelegramAccounts(cleanDeviceId);
      }

      return true;
    } catch (error) {
      this.logger.error('Ошибка регистрации устройства:', error);
      return false;
    }
  }

  /**
   * Получение пользователей с включенными ETF уведомлениями
   */
  async getUsersWithETFNotifications(appName: string): Promise<any[]> {
    try {
      const users = await this.prismaService.user.findMany({
        where: {
          application: { name: appName },
          isActive: true,
          settings: {
            path: ['notifications', 'enableETFUpdates'],
            equals: true,
          },
        },
        include: { application: true },
      });

      return users;
    } catch (error) {
      this.logger.error(
        'Ошибка получения пользователей с ETF уведомлениями:',
        error,
      );
      return [];
    }
  }

  /**
   * Получение пользователей с включенными Telegram уведомлениями
   */
  async getUsersWithTelegramNotifications(appName: string): Promise<any[]> {
    try {
      const users = await this.prismaService.user.findMany({
        where: {
          application: { name: appName },
          isActive: true,
          telegramChatId: { not: null },
          settings: {
            path: ['notifications', 'enableTelegramNotifications'],
            equals: true,
          },
        },
        include: { application: true },
      });

      return users;
    } catch (error) {
      this.logger.error(
        'Ошибка получения пользователей с Telegram уведомлениями:',
        error,
      );
      return [];
    }
  }

  /**
   * Отправка ETF уведомлений
   */
  async sendETFNotifications(
    data: ETFNotificationData,
    appName: string,
  ): Promise<void> {
    try {
      // Проверяем, не отправляли ли мы уже такое же уведомление недавно
      // Дедуп по дате и значениям
      const notificationKey = `${data.date}_${data.bitcoinFlow.toFixed(2)}_${data.ethereumFlow.toFixed(2)}`;
      const lastNotification =
        await this.prismaService.notificationLog.findFirst({
          where: {
            type: 'ETF_UPDATE',
            body: {
              contains: notificationKey,
            },
            // Уберём жёсткую привязку к одному часу — ключ по дате сам обеспечит уникальность в день
          },
          orderBy: { createdAt: 'desc' },
        });

      if (lastNotification) {
        this.logger.log(
          '📭 Пропускаем отправку уведомления - такое же уже отправлялось недавно',
        );
        return;
      }

      const users = await this.getUsersWithETFNotifications(appName);

      // Отправляем push уведомления
      for (const user of users) {
        await this.firebaseAdminService.sendNotificationToToken(
          user.deviceToken,
          '📊 ETF Flow Update',
          `Bitcoin: ${this.formatFlow(data.bitcoinFlow)}, Ethereum: ${this.formatFlow(data.ethereumFlow)}`,
          {
            type: 'etf_update',
            bitcoinFlow: data.bitcoinFlow.toString(),
            ethereumFlow: data.ethereumFlow.toString(),
            date: data.date,
          },
        );
      }

      // Отправляем Telegram уведомления
      if (this.telegramBotService) {
        const telegramUsers =
          await this.getUsersWithTelegramNotifications(appName);
        for (let i = 0; i < telegramUsers.length; i++) {
          await this.telegramBotService.sendETFUpdateNotification(data);
        }
      }

      this.logger.log(
        `✅ ETF уведомления отправлены для ${appName}: ${users.length} пользователей`,
      );

      // Логируем отправленное уведомление в базу данных
      await this.prismaService.notificationLog.create({
        data: {
          type: 'ETF_UPDATE',
          title: '📊 ETF Flow Update',
          body: `[key:${notificationKey}] Date: ${data.date} — Bitcoin: ${this.formatFlow(data.bitcoinFlow)}, Ethereum: ${this.formatFlow(data.ethereumFlow)}`,
          data: {
            bitcoinFlow: data.bitcoinFlow.toString(),
            ethereumFlow: data.ethereumFlow.toString(),
            date: data.date,
          },
          sentToTokens: users.length,
          successCount: users.length,
          failureCount: 0,
        },
      });
    } catch (error) {
      this.logger.error('Ошибка отправки ETF уведомлений:', error);
    }
  }

  /**
   * Получение пользователя по deviceId
   */
  async getUserByDeviceId(appName: string, deviceId: string): Promise<any> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          deviceId: deviceId,
          application: { name: appName },
        },
        include: { application: true },
      });

      return user;
    } catch (error) {
      this.logger.error(
        `Ошибка получения пользователя по deviceId ${deviceId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Получение отображаемого имени приложения
   */
  private getAppDisplayName(appName: string): string {
    const appNames: Record<string, string> = {
      'etf.flow': 'ETF Flow Tracker',
      'crypto.tracker': 'Crypto Tracker',
      'portfolio.manager': 'Portfolio Manager',
      'trading.bot': 'Trading Bot',
    };
    return appNames[appName] || appName;
  }

  /**
   * Получение описания приложения
   */
  private getAppDescription(appName: string): string {
    const descriptions: Record<string, string> = {
      'etf.flow': 'Приложение для отслеживания потоков ETF',
      'crypto.tracker': 'Приложение для отслеживания криптовалют',
      'portfolio.manager': 'Менеджер инвестиционного портфеля',
      'trading.bot': 'Автоматический торговый бот',
    };
    return descriptions[appName] || `Приложение ${appName}`;
  }

  /**
   * Получение настроек ETF уведомлений по умолчанию для приложения
   */
  private getDefaultETFUpdates(appName: string): boolean {
    const etfApps = ['etf.flow', 'portfolio.manager'];
    return etfApps.includes(appName);
  }

  /**
   * Получение настроек значительных изменений по умолчанию для приложения
   */
  private getDefaultSignificantFlow(appName: string): boolean {
    const significantFlowApps = ['etf.flow', 'crypto.tracker'];
    return significantFlowApps.includes(appName);
  }

  /**
   * Отправка тестового уведомления всем пользователям с включенными тестовыми уведомлениями
   */
  async sendTestNotificationToAll(): Promise<boolean> {
    try {
      const users = await this.prismaService.user.findMany({
        where: {
          isActive: true,
          settings: {
            path: ['notifications', 'enableTestNotifications'],
            equals: true,
          },
        },
        select: { deviceToken: true },
      });

      for (const user of users) {
        await this.firebaseAdminService.sendNotificationToToken(
          user.deviceToken,
          '🧪 Test Notification',
          'This is a test notification from ETF Flow Tracker',
          { type: 'test' },
        );
      }

      this.logger.log(
        `✅ Тестовые уведомления отправлены: ${users.length} пользователей`,
      );
      return true;
    } catch (error) {
      this.logger.error('Ошибка отправки тестовых уведомлений:', error);
      return false;
    }
  }

  /**
   * Отправка тестового уведомления на устройство
   */
  async sendTestNotification(
    deviceToken: string,
    message: string,
    title?: string,
  ): Promise<boolean> {
    try {
      this.logger.log(
        `📱 Отправка тестового уведомления на устройство ${deviceToken.substring(0, 10)}...`,
      );

      const notification = {
        title: title || '🧪 Тестовое уведомление',
        body: message,
        data: {
          type: 'test',
          timestamp: new Date().toISOString(),
        },
      };

      const success = await this.firebaseAdminService.sendNotification(
        deviceToken,
        notification,
      );

      if (success) {
        this.logger.log(
          `✅ Тестовое уведомление отправлено на устройство ${deviceToken.substring(0, 10)}...`,
        );
      } else {
        this.logger.error(
          `❌ Ошибка отправки тестового уведомления на устройство ${deviceToken.substring(0, 10)}...`,
        );
      }

      return success;
    } catch (error) {
      this.logger.error('❌ Ошибка отправки тестового уведомления:', error);
      return false;
    }
  }

  /**
   * Проверяет, есть ли ожидающие Telegram аккаунты для данного deviceId
   */
  private checkPendingTelegramAccounts(deviceId: string): void {
    try {
      // Здесь можно добавить логику для поиска ожидающих Telegram аккаунтов
      // Например, можно создать отдельную таблицу для ожидающих привязок
      // или использовать другой механизм для отслеживания ожидающих аккаунтов

      this.logger.log(
        `🔍 Проверка ожидающих Telegram аккаунтов для deviceId: ${deviceId}`,
      );

      // Пока что просто логируем, что проверка выполнена
      // В будущем здесь можно добавить более сложную логику
    } catch (error) {
      this.logger.error(
        `❌ Ошибка проверки ожидающих Telegram аккаунтов для deviceId ${deviceId}:`,
        error,
      );
    }
  }

  /**
   * Получение настроек устройства
   */
  async getDeviceSettings(token: string): Promise<any> {
    try {
      this.logger.log(
        `🔍 Получение настроек для токена: ${token.substring(0, 20)}...`,
      );

      const user = await this.prismaService.user.findUnique({
        where: { deviceToken: token },
      });

      if (!user) {
        this.logger.log('❌ Пользователь не найден');
        return null;
      }

      const settings = (user.settings as UserSettings) || {};
      const notifications = settings.notifications || {};

      const deviceSettings = {
        enableETFUpdates: notifications.enableETFUpdates ?? true,
        enableSignificantFlow: notifications.enableSignificantFlow ?? true,
        enableTestNotifications: notifications.enableTestNotifications ?? false,
        enableFlowAmount: notifications.enableFlowAmount ?? false,
        minFlowThreshold: notifications.minFlowThreshold ?? 0.1,
        significantChangePercent:
          notifications.significantChangePercent ?? 20.0,
        flowAmountThreshold: notifications.flowAmountThreshold ?? 10.0,
        quietHoursStart: notifications.quietHoursStart,
        quietHoursEnd: notifications.quietHoursEnd,
        notificationCount: 0, // Можно добавить счетчик уведомлений
        lastNotificationSent: null, // Можно добавить время последнего уведомления
      };

      this.logger.log('✅ Настройки устройства получены:', deviceSettings);
      return deviceSettings;
    } catch (error) {
      this.logger.error('❌ Ошибка получения настроек устройства:', error);
      return null;
    }
  }

  /**
   * Обновление настроек устройства
   */
  async updateDeviceSettings(
    token: string,
    newSettings: any,
  ): Promise<boolean> {
    try {
      this.logger.log(
        `💾 Обновление настроек для токена: ${token.substring(0, 20)}...`,
      );

      const user = await this.prismaService.user.findUnique({
        where: { deviceToken: token },
      });

      if (!user) {
        this.logger.log('❌ Пользователь не найден');
        return false;
      }

      const currentSettings = (user.settings as UserSettings) || {};
      const currentNotifications = currentSettings.notifications || {};

      // Обновляем только переданные настройки
      const updatedNotifications = {
        ...currentNotifications,
        enableETFUpdates:
          newSettings.enableETFUpdates ?? currentNotifications.enableETFUpdates,
        enableSignificantFlow:
          newSettings.enableSignificantFlow ??
          currentNotifications.enableSignificantFlow,
        enableTestNotifications:
          newSettings.enableTestNotifications ??
          currentNotifications.enableTestNotifications,
        enableFlowAmount:
          newSettings.enableFlowAmount ?? currentNotifications.enableFlowAmount,
        minFlowThreshold:
          newSettings.minFlowThreshold ?? currentNotifications.minFlowThreshold,
        significantChangePercent:
          newSettings.significantChangePercent ??
          currentNotifications.significantChangePercent,
        flowAmountThreshold:
          newSettings.flowAmountThreshold ??
          currentNotifications.flowAmountThreshold,
        quietHoursStart:
          newSettings.quietHoursStart ?? currentNotifications.quietHoursStart,
        quietHoursEnd:
          newSettings.quietHoursEnd ?? currentNotifications.quietHoursEnd,
      };

      const updatedSettings: UserSettings = {
        ...currentSettings,
        notifications: updatedNotifications,
      };

      await this.prismaService.user.update({
        where: { deviceToken: token },
        data: {
          settings: updatedSettings,
          lastUsed: new Date(),
        },
      });

      this.logger.log(
        '✅ Настройки устройства обновлены:',
        updatedNotifications,
      );
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка обновления настроек устройства:', error);
      return false;
    }
  }
}
