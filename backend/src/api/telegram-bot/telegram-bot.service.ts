import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BotService } from './services/bot.service';
import { BotHandler } from './handlers/bot.handler';
import { ETFNotificationData } from './types/bot.types';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    private botService: BotService,
    private botHandler: BotHandler,
  ) {}

  onModuleInit() {
    this.logger.log('🚀 Initializing Telegram Bot Service...');

    if (this.botService.isBotInitialized()) {
      this.botHandler.setupHandlers();
      this.logger.log('✅ Telegram Bot Service initialized successfully');
    } else {
      this.logger.warn(
        '⚠️ Telegram Bot Service initialization skipped - bot not configured',
      );
    }
  }

  /**
   * Проверка инициализации бота
   */
  isBotInitialized(): boolean {
    return this.botService.isBotInitialized();
  }

  /**
   * Отправка тестового сообщения пользователю
   */
  async sendTestMessage(chatId: string, message: string): Promise<boolean> {
    return this.botService.sendTestMessage(chatId, message);
  }

  /**
   * Отправка уведомления всем подписанным пользователям
   */
  async sendETFUpdateNotification(data: ETFNotificationData): Promise<boolean> {
    return this.botService.sendETFUpdateNotification(data);
  }
}
