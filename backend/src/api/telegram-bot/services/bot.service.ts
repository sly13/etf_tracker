import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { UniversalETFFlowService } from '../../etf/universal-etf-flow.service';
import TelegramBot from 'node-telegram-bot-api';
import { ETFNotificationData } from '../types/bot.types';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);
  private bot: TelegramBot;
  private isInitialized = false;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private etfFlowService: UniversalETFFlowService,
  ) {
    this.logger.log('🚀 BotService constructor called');
  }

  initializeBot() {
    this.logger.log('🔧 Initializing Telegram bot...');
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!token) {
      this.logger.warn(
        '⚠️ TELEGRAM_BOT_TOKEN не найден в переменных окружения',
      );
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.isInitialized = true;
      this.logger.log('✅ Telegram бот успешно инициализирован');
    } catch (error) {
      this.logger.error('❌ Ошибка инициализации Telegram бота:', error);
    }
  }

  getBot(): TelegramBot | null {
    return this.isInitialized ? this.bot : null;
  }

  isBotInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Отправка тестового сообщения пользователю
   */
  async sendTestMessage(chatId: string, message: string): Promise<boolean> {
    if (!this.isInitialized) {
      this.logger.warn(
        '⚠️ Бот не инициализирован, пропускаем отправку тестового сообщения',
      );
      return false;
    }

    try {
      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });

      this.logger.log(`✅ Тестовое сообщение отправлено в чат ${chatId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Ошибка отправки тестового сообщения в чат ${chatId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Отправка уведомления всем подписанным пользователям
   */
  async sendETFUpdateNotification(data: ETFNotificationData): Promise<boolean> {
    if (!this.isInitialized) {
      this.logger.warn('⚠️ Бот не инициализирован, пропускаем отправку');
      return false;
    }

    try {
      const subscribedUsers = await this.prismaService.user.findMany({
        where: {
          telegramChatId: { not: null },
          isActive: true,
        },
        include: { application: true },
      });

      if (subscribedUsers.length === 0) {
        this.logger.log('📭 Нет подписанных пользователей для уведомлений');
        return true;
      }

      const message = this.formatETFNotificationMessage(data);
      let successCount = 0;
      let failureCount = 0;

      for (const user of subscribedUsers) {
        try {
          await this.bot.sendMessage(user.telegramChatId!, message, {
            parse_mode: 'HTML',
          });
          successCount++;
          this.logger.log(
            `✅ Уведомление отправлено пользователю ${user.telegramChatId}`,
          );
        } catch (error) {
          failureCount++;
          this.logger.error(
            `❌ Ошибка отправки уведомления пользователю ${user.telegramChatId}:`,
            error,
          );

          // Если пользователь заблокировал бота, отключаем уведомления
          if (
            error instanceof Error &&
            (error.message.includes('bot was blocked') ||
              error.message.includes('chat not found'))
          ) {
            // Отключаем уведомления через settings
            const currentSettings = (user.settings as any) || {};
            await this.prismaService.user.update({
              where: { id: user.id },
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
              `🔕 Отключены уведомления для пользователя ${user.telegramChatId} (заблокировал бота)`,
            );
          }
        }
      }

      // Логируем статистику отправки
      await this.logNotificationStats(
        'ETF_UPDATE',
        'ETF Flow Update',
        `Bitcoin: ${data.bitcoinTotal}, Ethereum: ${data.ethereumTotal}`,
        subscribedUsers.length,
        successCount,
        failureCount,
      );

      this.logger.log(
        `📊 Статистика отправки: ${successCount} успешно, ${failureCount} ошибок`,
      );

      return successCount > 0;
    } catch (error) {
      this.logger.error('❌ Ошибка отправки уведомлений:', error);
      return false;
    }
  }

  private formatETFNotificationMessage(data: ETFNotificationData): string {
    const bitcoinEmoji = data.bitcoinFlow >= 0 ? '📈' : '📉';
    const ethereumEmoji = data.ethereumFlow >= 0 ? '📈' : '📉';

    return `
🚀 <b>ETF Flow Update</b>

📅 <b>Date:</b> ${data.date}

🟠 <b>Bitcoin ETF:</b>
${bitcoinEmoji} Flow: <b>${data.bitcoinFlow.toLocaleString()} BTC</b>
💰 Total: <b>${data.bitcoinTotal.toLocaleString()} BTC</b>

🔵 <b>Ethereum ETF:</b>
${ethereumEmoji} Flow: <b>${data.ethereumFlow.toLocaleString()} ETH</b>
💰 Total: <b>${data.ethereumTotal.toLocaleString()} ETH</b>

<i>Data source: Farside.co.uk</i>
    `.trim();
  }

  private async logNotificationStats(
    type: string,
    title: string,
    body: string,
    sentToTokens: number,
    successCount: number,
    failureCount: number,
  ) {
    try {
      await this.prismaService.notificationLog.create({
        data: {
          type,
          title,
          body,
          sentToTokens,
          successCount,
          failureCount,
        },
      });
    } catch (error) {
      this.logger.error('❌ Ошибка логирования статистики уведомлений:', error);
    }
  }
}
