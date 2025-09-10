import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

export interface UserSettings {
  telegram?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    isBot?: boolean;
    linkedAt?: string;
  };
  notifications?: {
    enableETFUpdates?: boolean;
    enableSignificantFlow?: boolean;
    enableTestNotifications?: boolean;
    enableTelegramNotifications?: boolean;
    minFlowThreshold?: number;
    significantChangePercent?: number;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  preferences?: {
    language?: string;
    timezone?: string;
    deviceType?: string;
    appVersion?: string;
    osVersion?: string;
    deviceName?: string;
  };
  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  [key: string]: any;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Получение всех пользователей
   */
  async getAllUsers() {
    try {
      const users = await this.prismaService.user.findMany({
        include: {
          application: true,
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Берем только последнюю подписку
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const usersWithSettings = users.map((user) => {
        const settings = (user.settings as UserSettings) || {};
        const profile = settings.profile || {};
        const telegram = settings.telegram || {};
        const notifications = settings.notifications || {};
        const preferences = settings.preferences || {};

        // Проверяем статус подписки
        const latestSubscription = user.subscriptions?.[0];
        const hasActiveSubscription =
          latestSubscription &&
          latestSubscription.isActive &&
          (!latestSubscription.expirationDate ||
            latestSubscription.expirationDate > new Date());

        return {
          id: user.id,
          applicationId: user.applicationId,
          application: user.application,
          deviceId: user.deviceId,
          deviceToken: user.deviceToken,
          telegramChatId: user.telegramChatId,
          isActive: user.isActive,
          lastUsed: user.lastUsed,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Информация о подписке
          hasSubscription: !!latestSubscription,
          hasActiveSubscription: hasActiveSubscription,
          subscriptionStatus: latestSubscription
            ? hasActiveSubscription
              ? 'Активна'
              : 'Неактивна'
            : 'Нет подписки',
          subscriptionExpirationDate: latestSubscription?.expirationDate,
          // Данные из JSON settings
          firstName: profile.firstName || telegram.firstName,
          lastName: profile.lastName || telegram.lastName,
          email: profile.email,
          phone: profile.phone,
          deviceType: preferences.deviceType,
          appVersion: preferences.appVersion,
          osVersion: preferences.osVersion,
          language: preferences.language,
          timezone: preferences.timezone,
          deviceName: preferences.deviceName,
          // Настройки уведомлений
          enableETFUpdates: notifications.enableETFUpdates,
          enableSignificantFlow: notifications.enableSignificantFlow,
          enableTestNotifications: notifications.enableTestNotifications,
          enableTelegramNotifications:
            notifications.enableTelegramNotifications,
          minFlowThreshold: notifications.minFlowThreshold,
          significantChangePercent: notifications.significantChangePercent,
          quietHoursStart: notifications.quietHoursStart,
          quietHoursEnd: notifications.quietHoursEnd,
          // Telegram данные
          telegramLinkedAt: telegram.linkedAt,
        };
      });

      return {
        success: true,
        users: usersWithSettings,
        total: usersWithSettings.length,
      };
    } catch (error) {
      this.logger.error('❌ Ошибка получения пользователей:', error);
      throw new Error('Внутренняя ошибка сервера при получении пользователей');
    }
  }

  /**
   * Получение пользователя по ID
   */
  async getUserById(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
        include: { application: true },
      });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const settings = (user.settings as UserSettings) || {};
      const profile = settings.profile || {};
      const telegram = settings.telegram || {};
      const notifications = settings.notifications || {};
      const preferences = settings.preferences || {};

      return {
        success: true,
        user: {
          id: user.id,
          applicationId: user.applicationId,
          application: user.application,
          deviceId: user.deviceId,
          deviceToken: user.deviceToken,
          telegramChatId: user.telegramChatId,
          isActive: user.isActive,
          lastUsed: user.lastUsed,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Данные из JSON settings
          firstName: profile.firstName || telegram.firstName,
          lastName: profile.lastName || telegram.lastName,
          email: profile.email,
          phone: profile.phone,
          deviceType: preferences.deviceType,
          appVersion: preferences.appVersion,
          osVersion: preferences.osVersion,
          language: preferences.language,
          timezone: preferences.timezone,
          deviceName: preferences.deviceName,
          // Настройки уведомлений
          enableETFUpdates: notifications.enableETFUpdates,
          enableSignificantFlow: notifications.enableSignificantFlow,
          enableTestNotifications: notifications.enableTestNotifications,
          enableTelegramNotifications:
            notifications.enableTelegramNotifications,
          minFlowThreshold: notifications.minFlowThreshold,
          significantChangePercent: notifications.significantChangePercent,
          quietHoursStart: notifications.quietHoursStart,
          quietHoursEnd: notifications.quietHoursEnd,
          // Telegram данные
          telegramLinkedAt: telegram.linkedAt,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('❌ Ошибка получения пользователя:', error);
      throw new Error('Внутренняя ошибка сервера при получении пользователя');
    }
  }

  /**
   * Получение пользователя по deviceId
   */
  async getUserByDeviceId(deviceId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { deviceId },
        include: { application: true },
      });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const settings = (user.settings as UserSettings) || {};
      const profile = settings.profile || {};
      const telegram = settings.telegram || {};
      const notifications = settings.notifications || {};
      const preferences = settings.preferences || {};

      return {
        success: true,
        user: {
          id: user.id,
          applicationId: user.applicationId,
          application: user.application,
          deviceId: user.deviceId,
          deviceToken: user.deviceToken,
          telegramChatId: user.telegramChatId,
          isActive: user.isActive,
          lastUsed: user.lastUsed,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Данные из JSON settings
          firstName: profile.firstName || telegram.firstName,
          lastName: profile.lastName || telegram.lastName,
          email: profile.email,
          phone: profile.phone,
          deviceType: preferences.deviceType,
          appVersion: preferences.appVersion,
          osVersion: preferences.osVersion,
          language: preferences.language,
          timezone: preferences.timezone,
          deviceName: preferences.deviceName,
          // Настройки уведомлений
          enableETFUpdates: notifications.enableETFUpdates,
          enableSignificantFlow: notifications.enableSignificantFlow,
          enableTestNotifications: notifications.enableTestNotifications,
          enableTelegramNotifications:
            notifications.enableTelegramNotifications,
          minFlowThreshold: notifications.minFlowThreshold,
          significantChangePercent: notifications.significantChangePercent,
          quietHoursStart: notifications.quietHoursStart,
          quietHoursEnd: notifications.quietHoursEnd,
          // Telegram данные
          telegramLinkedAt: telegram.linkedAt,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('❌ Ошибка получения пользователя по deviceId:', error);
      throw new Error('Внутренняя ошибка сервера при получении пользователя');
    }
  }

  /**
   * Обновление настроек пользователя
   */
  async updateUserSettings(userId: string, settings: Partial<UserSettings>) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      const currentSettings = (user.settings as UserSettings) || {};
      const updatedSettings = {
        ...currentSettings,
        ...settings,
      };

      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          settings: updatedSettings,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`✅ Настройки пользователя ${userId} обновлены`);

      return {
        success: true,
        message: 'Настройки пользователя успешно обновлены',
        settings: updatedSettings,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('❌ Ошибка обновления настроек пользователя:', error);
      throw new Error('Внутренняя ошибка сервера при обновлении настроек');
    }
  }

  /**
   * Удаление пользователя
   */
  async deleteUser(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }

      await this.prismaService.user.delete({
        where: { id },
      });

      this.logger.log(`✅ Пользователь ${id} удален`);

      return {
        success: true,
        message: 'Пользователь успешно удален',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('❌ Ошибка удаления пользователя:', error);
      throw new Error('Внутренняя ошибка сервера при удалении пользователя');
    }
  }

  /**
   * Получение статистики пользователей
   */
  async getUserStats() {
    try {
      const totalUsers = await this.prismaService.user.count();
      const activeUsers = await this.prismaService.user.count({
        where: { isActive: true },
      });
      const telegramLinkedUsers = await this.prismaService.user.count({
        where: { telegramChatId: { not: null } },
      });

      // Статистика по приложениям
      const appStats = await this.prismaService.application.findMany({
        include: {
          users: {
            select: { id: true },
          },
        },
      });

      const applicationStats = appStats.map((app) => ({
        id: app.id,
        name: app.name,
        displayName: app.displayName,
        userCount: app.users.length,
        isActive: app.isActive,
      }));

      return {
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          telegramLinkedUsers,
          telegramLinkedPercent:
            totalUsers > 0 ? (telegramLinkedUsers / totalUsers) * 100 : 0,
          applicationStats,
        },
      };
    } catch (error) {
      this.logger.error('❌ Ошибка получения статистики пользователей:', error);
      throw new Error('Внутренняя ошибка сервера при получении статистики');
    }
  }
}
