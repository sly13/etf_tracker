import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { NotificationService } from '../../api/notifications/notification.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

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
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // ==================== АДМИНСКИЕ МЕТОДЫ ====================

  /**
   * Создание нового приложения
   */
  async createApplication(createApplicationDto: CreateApplicationDto) {
    try {
      // Проверяем, не существует ли уже приложение с таким именем
      const existingApp = await this.prismaService.application.findUnique({
        where: { name: createApplicationDto.name },
      });

      if (existingApp) {
        throw new ConflictException(
          `Приложение с именем "${createApplicationDto.name}" уже существует`,
        );
      }

      // Создаем новое приложение
      const application = await this.prismaService.application.create({
        data: {
          name: createApplicationDto.name,
          displayName: createApplicationDto.displayName,
          description: createApplicationDto.description,
          isActive: createApplicationDto.isActive ?? true,
        },
      });

      this.logger.log(`✅ Создано новое приложение: ${application.name}`);

      return {
        success: true,
        message: 'Приложение успешно создано',
        application: {
          id: application.id,
          name: application.name,
          displayName: application.displayName,
          description: application.description,
          isActive: application.isActive,
          createdAt: application.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('❌ Ошибка создания приложения:', error);
      throw new Error('Внутренняя ошибка сервера при создании приложения');
    }
  }

  /**
   * Обновление приложения
   */
  async updateApplication(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
  ) {
    try {
      // Проверяем, существует ли приложение
      const existingApp = await this.prismaService.application.findUnique({
        where: { id },
      });

      if (!existingApp) {
        throw new NotFoundException('Приложение не найдено');
      }

      // Обновляем приложение
      const application = await this.prismaService.application.update({
        where: { id },
        data: {
          displayName: updateApplicationDto.displayName,
          description: updateApplicationDto.description,
          isActive: updateApplicationDto.isActive,
        },
      });

      this.logger.log(`✅ Обновлено приложение: ${application.name}`);

      return {
        success: true,
        message: 'Приложение успешно обновлено',
        application: {
          id: application.id,
          name: application.name,
          displayName: application.displayName,
          description: application.description,
          isActive: application.isActive,
          updatedAt: application.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('❌ Ошибка обновления приложения:', error);
      throw new Error('Внутренняя ошибка сервера при обновлении приложения');
    }
  }

  /**
   * Получение всех приложений
   */
  async getAllApplications() {
    try {
      const applications = await this.prismaService.application.findMany({
        include: {
          users: {
            select: {
              id: true,
              deviceId: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const applicationsWithStats = applications.map((application) => ({
        id: application.id,
        name: application.name,
        displayName: application.displayName,
        description: application.description,
        isActive: application.isActive,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        userCount: application.users.length,
        users: application.users,
      }));

      return {
        success: true,
        applications: applicationsWithStats,
        total: applicationsWithStats.length,
      };
    } catch (error) {
      this.logger.error('❌ Ошибка получения приложений:', error);
      throw new Error('Внутренняя ошибка сервера при получении приложений');
    }
  }

  /**
   * Получение приложения по ID
   */
  async getApplicationById(id: string) {
    try {
      const application = await this.prismaService.application.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              deviceId: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
      });

      if (!application) {
        throw new NotFoundException('Приложение не найдено');
      }

      return {
        success: true,
        application: {
          id: application.id,
          name: application.name,
          displayName: application.displayName,
          description: application.description,
          isActive: application.isActive,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt,
          userCount: application.users.length,
          users: application.users,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('❌ Ошибка получения приложения:', error);
      throw new Error('Внутренняя ошибка сервера при получении приложения');
    }
  }

  /**
   * Получение приложения по имени
   */
  async getApplicationByName(name: string) {
    try {
      const application = await this.prismaService.application.findUnique({
        where: { name },
        include: {
          users: {
            select: {
              id: true,
              deviceId: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
      });

      if (!application) {
        throw new NotFoundException('Приложение не найдено');
      }

      return {
        success: true,
        application: {
          id: application.id,
          name: application.name,
          displayName: application.displayName,
          description: application.description,
          isActive: application.isActive,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt,
          userCount: application.users.length,
          users: application.users,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('❌ Ошибка получения приложения по имени:', error);
      throw new Error('Внутренняя ошибка сервера при получении приложения');
    }
  }

  /**
   * Удаление приложения
   */
  async deleteApplication(id: string) {
    try {
      // Проверяем, существует ли приложение
      const existingApp = await this.prismaService.application.findUnique({
        where: { id },
        include: { users: true },
      });

      if (!existingApp) {
        throw new NotFoundException('Приложение не найдено');
      }

      // Проверяем, есть ли пользователи
      if (existingApp.users.length > 0) {
        throw new ConflictException(
          'Нельзя удалить приложение, у которого есть пользователи',
        );
      }

      // Удаляем приложение
      await this.prismaService.application.delete({
        where: { id },
      });

      this.logger.log(`✅ Удалено приложение: ${existingApp.name}`);

      return {
        success: true,
        message: 'Приложение успешно удалено',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error('❌ Ошибка удаления приложения:', error);
      throw new Error('Внутренняя ошибка сервера при удалении приложения');
    }
  }

  // ==================== МЕТОДЫ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ ====================

  /**
   * Получение пользователей приложения
   */
  async getApplicationUsers(appName: string) {
    try {
      const application = await this.prismaService.application.findUnique({
        where: { name: appName },
        include: {
          users: {
            include: {
              subscriptions: {
                orderBy: { createdAt: 'desc' },
                take: 1, // Берем только последнюю подписку
              },
            },
          },
        },
      });

      if (!application) {
        throw new NotFoundException('Приложение не найдено');
      }

      const usersWithSettings = application.users.map((user) => {
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
          deviceId: user.deviceId,
          deviceToken: user.deviceToken,
          telegramChatId: user.telegramChatId,
          isActive: user.isActive,
          lastUsed: user.lastUsed,
          createdAt: user.createdAt,
          // Информация о подписке
          hasSubscription: !!latestSubscription,
          hasActiveSubscription: hasActiveSubscription,
          subscriptionStatus: latestSubscription
            ? hasActiveSubscription
              ? 'Активна'
              : 'Неактивна'
            : 'Нет подписки',
          subscriptionExpirationDate: latestSubscription?.expirationDate,
          // Полная информация о подписке для детального просмотра
          subscriptions: user.subscriptions,
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
        application: {
          id: application.id,
          name: application.name,
          displayName: application.displayName,
        },
        users: usersWithSettings,
        total: usersWithSettings.length,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('❌ Ошибка получения пользователей приложения:', error);
      throw new Error('Внутренняя ошибка сервера при получении пользователей');
    }
  }

  /**
   * Обновление настроек пользователя
   */
  async updateUserSettings(
    appName: string,
    userId: string,
    settings: Partial<UserSettings>,
  ) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          id: userId,
          application: { name: appName },
        },
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

      this.logger.log(
        `✅ Настройки пользователя ${userId} обновлены в приложении ${appName}`,
      );

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
   * Отправка тестового уведомления
   */
  async sendTestNotification(appName: string, userId?: string) {
    try {
      const success =
        await this.notificationService.sendTestNotificationToAll();

      return {
        success,
        message: success
          ? 'Тестовое уведомление отправлено'
          : 'Ошибка отправки тестового уведомления',
      };
    } catch (error) {
      this.logger.error('❌ Ошибка отправки тестового уведомления:', error);
      throw new Error('Внутренняя ошибка сервера при отправке уведомления');
    }
  }

  /**
   * Получение статистики приложения
   */
  async getApplicationStats(appName: string) {
    try {
      const stats = {
        totalUsers: 0,
        activeUsers: 0,
        telegramUsers: 0,
      };

      return {
        success: true,
        stats,
      };
    } catch (error) {
      this.logger.error('❌ Ошибка получения статистики приложения:', error);
      throw new Error('Внутренняя ошибка сервера при получении статистики');
    }
  }
}
