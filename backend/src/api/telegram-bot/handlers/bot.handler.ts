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

    // Setup bot commands menu
    this.setupBotCommandsMenu(bot);

    // Setup error handlers
    bot.on('error', (error) => {
      this.logger.error('❌ Ошибка Telegram бота:', error);
    });

    bot.on('polling_error', (error) => {
      this.logger.error('❌ Ошибка polling:', error);
    });

    this.logger.log('✅ Bot handlers setup completed');
  }

  private async setupBotCommandsMenu(bot: any) {
    try {
      const commands = [
        { command: 'start', description: 'Subscribe to ETF notifications' },
        { command: 'help', description: 'Show detailed help and commands' },
        { command: 'status', description: 'Check your subscription status' },
        { command: 'bitcoin', description: 'Get Bitcoin ETF flow data' },
        { command: 'ethereum', description: 'Get Ethereum ETF flow data' },
        {
          command: 'summary',
          description: 'Get both Bitcoin & Ethereum summary',
        },
        { command: 'link', description: 'Link Telegram to mobile app' },
        { command: 'app', description: 'Get app installation instructions' },
        { command: 'stop', description: 'Unsubscribe from notifications' },
      ];

      await bot.setMyCommands(commands);
      this.logger.log('✅ Bot commands menu setup completed');
    } catch (error) {
      this.logger.error('❌ Error setting up bot commands menu:', error);
    }
  }
}
