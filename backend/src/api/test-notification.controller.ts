import { Controller, Post, Body, Logger, Optional } from '@nestjs/common';
import { NotificationService } from './notifications/notification.service';
// import { TelegramBotService } from './telegram-bot/telegram-bot.service';
import { PrismaService } from '../shared/prisma/prisma.service';

@Controller('notifications')
export class TestNotificationController {
  private readonly logger = new Logger(TestNotificationController.name);

  constructor(
    private readonly notificationService: NotificationService,
    // @Optional() private readonly telegramBotService?: TelegramBotService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('send-test-telegram')
  async sendTestTelegramNotification(
    @Body() body: { userId: string; message: string },
  ) {
    try {
      this.logger.log(
        `📱 Отправка тестового Telegram уведомления пользователю ${body.userId}`,
      );

      // Находим пользователя
      const user = await this.prismaService.user.findUnique({
        where: { id: body.userId },
      });

      if (!user) {
        this.logger.error(`❌ Пользователь с ID ${body.userId} не найден`);
        return { success: false, error: 'Пользователь не найден' };
      }

      if (!user.telegramChatId) {
        this.logger.error(
          `❌ У пользователя ${body.userId} не настроен Telegram`,
        );
        return {
          success: false,
          error: 'Telegram не настроен для пользователя',
        };
      }

      // Отправляем тестовое сообщение через TelegramBotService
      // const success = await this.telegramBotService.sendTestMessage(
      //   user.telegramChatId,
      //   body.message || 'Тестовое уведомление из админской панели',
      // );
      const success = false; // Telegram бот отключен

      if (success) {
        this.logger.log(
          `✅ Тестовое Telegram уведомление отправлено пользователю ${body.userId}`,
        );
        return { success: true, message: 'Уведомление отправлено' };
      } else {
        this.logger.error(
          `❌ Ошибка отправки Telegram уведомления пользователю ${body.userId}`,
        );
        return { success: false, error: 'Ошибка отправки уведомления' };
      }
    } catch (error) {
      this.logger.error(
        '❌ Ошибка отправки тестового Telegram уведомления:',
        error,
      );
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }

  @Post('send-test-phone')
  async sendTestPhoneNotification(
    @Body() body: { userId: string; message: string },
  ) {
    try {
      this.logger.log(
        `📱 Отправка тестового уведомления на телефон пользователю ${body.userId}`,
      );

      // Находим пользователя
      const user = await this.prismaService.user.findUnique({
        where: { id: body.userId },
      });

      if (!user) {
        this.logger.error(`❌ Пользователь с ID ${body.userId} не найден`);
        return { success: false, error: 'Пользователь не найден' };
      }

      if (!user.deviceToken) {
        this.logger.error(
          `❌ У пользователя ${body.userId} не настроен device token`,
        );
        return {
          success: false,
          error: 'Device token не настроен для пользователя',
        };
      }

      // Отправляем тестовое уведомление через NotificationService
      const success = await this.notificationService.sendTestNotification(
        user.deviceToken,
        body.message || 'Тестовое уведомление на телефон из админской панели',
      );

      if (success) {
        this.logger.log(
          `✅ Тестовое уведомление на телефон отправлено пользователю ${body.userId}`,
        );
        return { success: true, message: 'Уведомление отправлено' };
      } else {
        this.logger.error(
          `❌ Ошибка отправки уведомления на телефон пользователю ${body.userId}`,
        );
        return { success: false, error: 'Ошибка отправки уведомления' };
      }
    } catch (error) {
      this.logger.error(
        '❌ Ошибка отправки тестового уведомления на телефон:',
        error,
      );
      return { success: false, error: 'Внутренняя ошибка сервера' };
    }
  }
}
