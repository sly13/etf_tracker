import { Controller, Get, Put, Body, Param, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Получение настройки пользователя для конкретного приложения
   */
  @Get('app/:appName/user/:userId/:settingKey')
  async getUserSetting(
    @Param('appName') appName: string,
    @Param('userId') userId: string,
    @Param('settingKey') settingKey: string,
  ) {
    const value = await this.settingsService.getUserSetting(
      userId,
      appName,
      settingKey,
    );

    return {
      success: value !== null,
      appName,
      userId,
      settingKey,
      value,
      message:
        value !== null
          ? `Настройка ${settingKey} получена для приложения ${appName}`
          : `Настройка ${settingKey} не найдена для приложения ${appName}`,
    };
  }

  /**
   * Получение всех настроек пользователя для конкретного приложения
   */
  @Get('app/:appName/user/:userId')
  async getAllUserSettings(
    @Param('appName') appName: string,
    @Param('userId') userId: string,
  ) {
    const settings = await this.settingsService.getAllUserSettings(
      userId,
      appName,
    );

    return {
      success: true,
      appName,
      userId,
      settings,
      message: `Все настройки пользователя получены для приложения ${appName}`,
    };
  }

  /**
   * Обновление настройки пользователя для конкретного приложения
   */
  @Put('app/:appName/user/:userId/:settingKey')
  async updateUserSetting(
    @Param('appName') appName: string,
    @Param('userId') userId: string,
    @Param('settingKey') settingKey: string,
    @Body() body: { value: any },
  ) {
    const success = await this.settingsService.updateUserSetting(
      userId,
      appName,
      settingKey,
      body.value,
    );

    return {
      success,
      appName,
      userId,
      settingKey,
      value: body.value,
      message: success
        ? `Настройка ${settingKey} обновлена для приложения ${appName}`
        : `Ошибка обновления настройки ${settingKey} для приложения ${appName}`,
    };
  }

  /**
   * Обновление всех настроек пользователя для конкретного приложения
   */
  @Put('app/:appName/user/:userId')
  async updateAllUserSettings(
    @Param('appName') appName: string,
    @Param('userId') userId: string,
    @Body() settings: Record<string, any>,
  ) {
    const success = await this.settingsService.updateAllUserSettings(
      userId,
      appName,
      settings,
    );

    return {
      success,
      appName,
      userId,
      settings,
      message: success
        ? `Все настройки пользователя обновлены для приложения ${appName}`
        : `Ошибка обновления всех настроек для приложения ${appName}`,
    };
  }

  /**
   * Получение пользователей с определенной настройкой
   */
  @Get('users-with-setting')
  async getUsersWithSetting(
    @Query('appName') appName: string,
    @Query('settingKey') settingKey: string,
    @Query('settingValue') settingValue: string,
  ) {
    // Парсим значение в зависимости от типа
    let parsedValue: any = settingValue;
    try {
      parsedValue = JSON.parse(settingValue);
    } catch {
      // Если не JSON, оставляем как строку
    }

    const userIds = await this.settingsService.getUsersWithSetting(
      appName,
      settingKey,
      parsedValue,
    );

    return {
      success: true,
      appName,
      settingKey,
      settingValue: parsedValue,
      userIds,
      count: userIds.length,
      message: `Найдено ${userIds.length} пользователей с настройкой ${settingKey}=${settingValue}`,
    };
  }

  /**
   * Получение пользователя по deviceToken
   */
  @Get('user-by-token/:deviceToken')
  async getUserByDeviceToken(@Param('deviceToken') deviceToken: string) {
    const user = await this.settingsService.getUserByDeviceToken(deviceToken);

    return {
      success: user !== null,
      user,
      message: user ? 'Пользователь найден' : 'Пользователь не найден',
    };
  }

  /**
   * Обновление данных Telegram пользователя
   */
  @Put('app/:appName/user/:userId/telegram')
  async updateTelegramData(
    @Param('appName') appName: string,
    @Param('userId') userId: string,
    @Body() telegramData: {
      firstName?: string;
      lastName?: string;
      username?: string;
      languageCode?: string;
      isBot?: boolean;
    },
  ) {
    const success = await this.settingsService.updateTelegramData(
      userId,
      appName,
      telegramData,
    );

    return {
      success,
      appName,
      userId,
      telegramData,
      message: success
        ? `Данные Telegram обновлены для приложения ${appName}`
        : `Ошибка обновления данных Telegram для приложения ${appName}`,
    };
  }

  /**
   * Получение данных Telegram пользователя
   */
  @Get('app/:appName/user/:userId/telegram')
  async getTelegramData(
    @Param('appName') appName: string,
    @Param('userId') userId: string,
  ) {
    const telegramData = await this.settingsService.getTelegramData(
      userId,
      appName,
    );

    return {
      success: telegramData !== null,
      appName,
      userId,
      telegramData,
      message: telegramData
        ? `Данные Telegram получены для приложения ${appName}`
        : `Данные Telegram не найдены для приложения ${appName}`,
    };
  }
}
