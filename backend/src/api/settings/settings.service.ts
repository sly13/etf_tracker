import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

export interface TelegramUserData {
  firstName?: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isBot?: boolean;
  linkedAt?: string;
}

export interface UserSettings {
  telegram?: TelegramUserData;
  notifications?: Record<string, any>;
  preferences?: Record<string, any>;
  [key: string]: any;
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Обновление данных Telegram пользователя
   */
  async updateTelegramData(
    userId: string,
    appName: string,
    telegramData: TelegramUserData,
  ): Promise<boolean> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { application: true },
      });

      if (!user) {
        this.logger.warn(`Пользователь ${userId} не найден`);
        return false;
      }

      if (user.application.name !== appName) {
        this.logger.warn(
          `Пользователь ${userId} не принадлежит приложению ${appName}`,
        );
        return false;
      }

      // Получаем текущие настройки
      const currentSettings = (user.settings as UserSettings) || {};

      // Обновляем данные Telegram
      const updatedSettings = {
        ...currentSettings,
        telegram: {
          ...currentSettings.telegram,
          ...telegramData,
          linkedAt: new Date().toISOString(),
        },
      };

      // Сохраняем
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          settings: updatedSettings,
          telegramChatId: telegramData.username || user.telegramChatId,
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `Данные Telegram обновлены для пользователя ${userId} в приложении ${appName}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Ошибка обновления данных Telegram для пользователя ${userId} в приложении ${appName}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Получение данных Telegram пользователя
   */
  async getTelegramData(
    userId: string,
    appName: string,
  ): Promise<TelegramUserData | null> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { application: true },
      });

      if (!user) {
        this.logger.warn(`Пользователь ${userId} не найден`);
        return null;
      }

      if (user.application.name !== appName) {
        this.logger.warn(
          `Пользователь ${userId} не принадлежит приложению ${appName}`,
        );
        return null;
      }

      const settings = (user.settings as UserSettings) || {};
      return settings.telegram || null;
    } catch (error) {
      this.logger.error(
        `Ошибка получения данных Telegram для пользователя ${userId} в приложении ${appName}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Получение настройки пользователя для конкретного приложения
   */
  async getUserSetting(
    userId: string,
    appName: string,
    settingKey: string,
  ): Promise<any> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { application: true },
      });

      if (!user) {
        this.logger.warn(`Пользователь ${userId} не найден`);
        return null;
      }

      if (user.application.name !== appName) {
        this.logger.warn(
          `Пользователь ${userId} не принадлежит приложению ${appName}`,
        );
        return null;
      }

      const settings = (user.settings as UserSettings) || {};

      // Поддержка вложенных ключей (например: "notifications.enableETFUpdates")
      const keys = settingKey.split('.');
      let value = settings;

      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }

      return value;
    } catch (error) {
      this.logger.error(
        `Ошибка получения настройки ${settingKey} для пользователя ${userId} в приложении ${appName}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Обновление настройки пользователя для конкретного приложения
   */
  async updateUserSetting(
    userId: string,
    appName: string,
    settingKey: string,
    settingValue: any,
  ): Promise<boolean> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { application: true },
      });

      if (!user) {
        this.logger.warn(`Пользователь ${userId} не найден`);
        return false;
      }

      if (user.application.name !== appName) {
        this.logger.warn(
          `Пользователь ${userId} не принадлежит приложению ${appName}`,
        );
        return false;
      }

      // Получаем текущие настройки
      const currentSettings = (user.settings as UserSettings) || {};

      // Поддержка вложенных ключей (например: "notifications.enableETFUpdates")
      const keys = settingKey.split('.');
      const lastKey = keys.pop()!;

      let target = currentSettings;
      for (const key of keys) {
        if (!target[key]) {
          target[key] = {};
        }
        target = target[key];
      }

      target[lastKey] = settingValue;

      // Сохраняем
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          settings: currentSettings,
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `Настройка ${settingKey} обновлена для пользователя ${userId} в приложении ${appName}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Ошибка обновления настройки ${settingKey} для пользователя ${userId} в приложении ${appName}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Получение всех настроек пользователя для конкретного приложения
   */
  async getAllUserSettings(
    userId: string,
    appName: string,
  ): Promise<UserSettings> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { application: true },
      });

      if (!user) {
        this.logger.warn(`Пользователь ${userId} не найден`);
        return {};
      }

      if (user.application.name !== appName) {
        this.logger.warn(
          `Пользователь ${userId} не принадлежит приложению ${appName}`,
        );
        return {};
      }

      return (user.settings as UserSettings) || {};
    } catch (error) {
      this.logger.error(
        `Ошибка получения всех настроек для пользователя ${userId} в приложении ${appName}:`,
        error,
      );
      return {};
    }
  }

  /**
   * Обновление всех настроек пользователя для конкретного приложения
   */
  async updateAllUserSettings(
    userId: string,
    appName: string,
    settings: UserSettings,
  ): Promise<boolean> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { application: true },
      });

      if (!user) {
        this.logger.warn(`Пользователь ${userId} не найден`);
        return false;
      }

      if (user.application.name !== appName) {
        this.logger.warn(
          `Пользователь ${userId} не принадлежит приложению ${appName}`,
        );
        return false;
      }

      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          settings: settings,
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `Все настройки обновлены для пользователя ${userId} в приложении ${appName}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Ошибка обновления всех настроек для пользователя ${userId} в приложении ${appName}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Получение пользователей с определенной настройкой
   */
  async getUsersWithSetting(
    appName: string,
    settingKey: string,
    settingValue: any,
  ): Promise<string[]> {
    try {
      const users = await this.prismaService.user.findMany({
        where: {
          application: { name: appName },
          settings: {
            path: [settingKey],
            equals: settingValue,
          },
        },
        select: { id: true },
      });

      return users.map((user) => user.id);
    } catch (error) {
      this.logger.error(
        `Ошибка поиска пользователей с настройкой ${settingKey}=${settingValue} для приложения ${appName}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Получение пользователя по deviceToken
   */
  async getUserByDeviceToken(deviceToken: string): Promise<any> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { deviceToken },
        include: { application: true },
      });

      return user;
    } catch (error) {
      this.logger.error(
        `Ошибка получения пользователя по deviceToken ${deviceToken}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Получение пользователя по deviceId
   */
  async getUserByDeviceId(deviceId: string): Promise<any> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { deviceId },
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
}
