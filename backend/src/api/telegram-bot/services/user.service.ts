import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { BotUser } from '../types/bot.types';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prismaService: PrismaService) {}

  async findUserByTelegramChatId(chatId: string): Promise<BotUser | null> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { telegramChatId: chatId },
        include: { application: true },
      });

      return user ? this.mapUserToBotUser(user) : null;
    } catch (error) {
      this.logger.error(
        '❌ Ошибка поиска пользователя по Telegram Chat ID:',
        error,
      );
      return null;
    }
  }

  async findUserByDeviceId(deviceId: string): Promise<BotUser | null> {
    try {
      this.logger.log(`🔍 Поиск пользователя по Device ID: ${deviceId}`);
      
      const user = await this.prismaService.user.findUnique({
        where: { deviceId },
        include: { application: true },
      });

      if (user) {
        this.logger.log(`✅ Пользователь найден: ${user.id}`);
        return this.mapUserToBotUser(user);
      } else {
        this.logger.log(`❌ Пользователь с Device ID ${deviceId} не найден`);
        return null;
      }
    } catch (error) {
      this.logger.error('❌ Ошибка поиска пользователя по Device ID:', error);
      return null;
    }
  }

  async linkTelegramToUser(
    userId: string,
    telegramChatId: string,
    telegramData: {
      firstName?: string;
      lastName?: string;
      languageCode?: string;
    },
  ): Promise<boolean> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return false;
      }

      const currentSettings = (user.settings as any) || {};
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          telegramChatId,
          lastUsed: new Date(),
          settings: {
            ...currentSettings,
            notifications: {
              ...currentSettings.notifications,
              enableTelegramNotifications: true,
            },
            profile: {
              ...currentSettings.profile,
              firstName: telegramData.firstName,
              lastName: telegramData.lastName,
            },
          },
        },
      });

      this.logger.log(`✅ Telegram аккаунт привязан к пользователю ${userId}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка привязки Telegram аккаунта:', error);
      return false;
    }
  }

  async disableTelegramNotifications(userId: string): Promise<boolean> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return false;
      }

      const currentSettings = (user.settings as any) || {};
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          settings: {
            ...currentSettings,
            notifications: {
              ...currentSettings.notifications,
              enableTelegramNotifications: false,
            },
          },
        },
      });

      this.logger.log(
        `🔕 Отключены Telegram уведомления для пользователя ${userId}`,
      );
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка отключения Telegram уведомлений:', error);
      return false;
    }
  }

  async enableTelegramNotifications(userId: string): Promise<boolean> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return false;
      }

      const currentSettings = (user.settings as any) || {};
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          settings: {
            ...currentSettings,
            notifications: {
              ...currentSettings.notifications,
              enableTelegramNotifications: true,
            },
          },
        },
      });

      this.logger.log(
        `🔔 Включены Telegram уведомления для пользователя ${userId}`,
      );
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка включения Telegram уведомлений:', error);
      return false;
    }
  }

  private mapUserToBotUser(user: any): BotUser {
    const settings = (user.settings as any) || {};
    return {
      id: user.id,
      telegramChatId: user.telegramChatId,
      deviceId: user.deviceId,
      firstName: settings.profile?.firstName,
      lastName: settings.profile?.lastName,
      isActive: user.isActive,
      enableTelegramNotifications:
        settings.notifications?.enableTelegramNotifications || false,
      application: user.application
        ? {
            name: user.application.name,
            displayName: user.application.displayName,
          }
        : undefined,
    };
  }
}
