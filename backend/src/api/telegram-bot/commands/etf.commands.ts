import { Injectable, Logger } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { ETFService } from '../services/etf.service';

@Injectable()
export class ETFCommands {
  private readonly logger = new Logger(ETFCommands.name);

  constructor(private etfService: ETFService) {}

  setupCommands(bot: TelegramBot) {
    // /ethereum command - Get Ethereum ETF data
    bot.onText(/\/ethereum/, (msg) => {
      void this.handleEthereumCommand(bot, msg);
    });

    // /bitcoin command - Get Bitcoin ETF data
    bot.onText(/\/bitcoin/, (msg) => {
      void this.handleBitcoinCommand(bot, msg);
    });

    // /summary command - Get both Bitcoin and Ethereum ETF data
    bot.onText(/\/summary/, (msg) => {
      void this.handleSummaryCommand(bot, msg);
    });
  }

  private async handleEthereumCommand(bot: TelegramBot, msg: any) {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';

    try {
      const message = await this.etfService.getEthereumData();

      await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });

      this.logger.log(
        `📊 User ${userName} (${chatId}) requested Ethereum ETF data`,
      );
    } catch (error) {
      this.logger.error('❌ Error processing /ethereum command:', error);
      await bot.sendMessage(
        chatId,
        '❌ Error getting Ethereum ETF data. Please try again later.',
      );
    }
  }

  private async handleBitcoinCommand(bot: TelegramBot, msg: any) {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';

    try {
      const message = await this.etfService.getBitcoinData();

      await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });

      this.logger.log(
        `📊 User ${userName} (${chatId}) requested Bitcoin ETF data`,
      );
    } catch (error) {
      this.logger.error('❌ Error processing /bitcoin command:', error);
      await bot.sendMessage(
        chatId,
        '❌ Error getting Bitcoin ETF data. Please try again later.',
      );
    }
  }

  private async handleSummaryCommand(bot: TelegramBot, msg: any) {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';

    try {
      const message = await this.etfService.getSummaryData();

      await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });

      this.logger.log(`📊 User ${userName} (${chatId}) requested ETF summary`);
    } catch (error) {
      this.logger.error('❌ Error processing /summary command:', error);
      await bot.sendMessage(
        chatId,
        '❌ Error getting ETF summary. Please try again later.',
      );
    }
  }
}
