import { Injectable, Logger } from '@nestjs/common';
import { BotService } from '../services/bot.service';
import { BasicCommands } from '../commands/basic.commands';
import { ETFCommands } from '../commands/etf.commands';

@Injectable()
export class BotHandler {
  private readonly logger = new Logger(BotHandler.name);

  constructor(
    private botService: BotService,
    private basicCommands: BasicCommands,
    private etfCommands: ETFCommands,
  ) {}

  setupHandlers() {
    const bot = this.botService.getBot();
    if (!bot) {
      this.logger.warn('⚠️ Bot not initialized, skipping handler setup');
      return;
    }

    this.logger.log('🔧 Setting up bot handlers...');

    // Setup command handlers
    this.basicCommands.setupCommands(bot);
    this.etfCommands.setupCommands(bot);

    // Setup error handlers
    bot.on('error', (error) => {
      this.logger.error('❌ Ошибка Telegram бота:', error);
    });

    bot.on('polling_error', (error) => {
      this.logger.error('❌ Ошибка polling:', error);
    });

    this.logger.log('✅ Bot handlers setup completed');
  }
}
