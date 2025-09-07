import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';

export interface ETFNotificationData {
  bitcoinFlow: number;
  ethereumFlow: number;
  bitcoinTotal: number;
  ethereumTotal: number;
  date: string;
  bitcoinData?: any;
  ethereumData?: any;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;
  private chatId: string;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!token) {
      this.logger.warn(
        '⚠️ TELEGRAM_BOT_TOKEN не найден в переменных окружения',
      );
      return;
    }

    if (!chatId) {
      this.logger.warn('⚠️ TELEGRAM_CHAT_ID не найден в переменных окружения');
      return;
    }

    this.bot = new TelegramBot(token, { polling: false });
    this.chatId = chatId;
    this.logger.log('✅ Telegram бот инициализирован');
  }

  /**
   * Отправка уведомления о новых данных ETF
   */
  async sendETFUpdateNotification(data: ETFNotificationData): Promise<boolean> {
    try {
      if (!this.bot || !this.chatId) {
        this.logger.warn('⚠️ Telegram бот не инициализирован');
        return false;
      }

      const message = this.formatETFMessage(data);

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });

      this.logger.log('✅ Telegram уведомление о ETF отправлено');
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка отправки Telegram уведомления:', error);
      return false;
    }
  }

  /**
   * Отправка уведомления о значительных изменениях
   */
  async sendSignificantFlowNotification(
    type: 'bitcoin' | 'ethereum',
    flow: number,
    previousFlow: number,
  ): Promise<boolean> {
    try {
      if (!this.bot || !this.chatId) {
        this.logger.warn('⚠️ Telegram бот не инициализирован');
        return false;
      }

      const change = flow - previousFlow;
      const changePercent =
        previousFlow !== 0 ? (change / Math.abs(previousFlow)) * 100 : 0;

      const isPositive = change > 0;
      const emoji = isPositive ? '📈' : '📉';
      const cryptoName = type === 'bitcoin' ? 'Bitcoin' : 'Ethereum';

      const message = `
${emoji} <b>${cryptoName} ETF - Значительное изменение</b>

${isPositive ? 'Приток' : 'Отток'}: <b>${Math.abs(change).toFixed(2)}M$</b>
Изменение: <b>${changePercent.toFixed(1)}%</b>
Текущий поток: <b>${flow.toFixed(2)}M$</b>
Предыдущий поток: <b>${previousFlow.toFixed(2)}M$</b>

<i>${new Date().toLocaleString('ru-RU')}</i>
      `.trim();

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });

      this.logger.log(
        `✅ Telegram уведомление о значительном изменении ${type} отправлено`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        '❌ Ошибка отправки Telegram уведомления о значительном изменении:',
        error,
      );
      return false;
    }
  }

  /**
   * Отправка тестового уведомления
   */
  async sendTestNotification(): Promise<boolean> {
    try {
      if (!this.bot || !this.chatId) {
        this.logger.warn('⚠️ Telegram бот не инициализирован');
        return false;
      }

      const message = `
🧪 <b>Тестовое уведомление</b>

ETF Tracker работает корректно!

<i>${new Date().toLocaleString('ru-RU')}</i>
      `.trim();

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });

      this.logger.log('✅ Telegram тестовое уведомление отправлено');
      return true;
    } catch (error) {
      this.logger.error(
        '❌ Ошибка отправки Telegram тестового уведомления:',
        error,
      );
      return false;
    }
  }

  /**
   * Форматирование сообщения о данных ETF
   */
  private formatETFMessage(data: ETFNotificationData): string {
    const bitcoinFlowText =
      data.bitcoinFlow >= 0
        ? `+${data.bitcoinFlow.toFixed(2)}M$`
        : `${data.bitcoinFlow.toFixed(2)}M$`;

    const ethereumFlowText =
      data.ethereumFlow >= 0
        ? `+${data.ethereumFlow.toFixed(2)}M$`
        : `${data.ethereumFlow.toFixed(2)}M$`;

    const bitcoinEmoji = data.bitcoinFlow >= 0 ? '📈' : '📉';
    const ethereumEmoji = data.ethereumFlow >= 0 ? '📈' : '📉';

    let message = `
📊 <b>Обновление ETF потоков</b>

${bitcoinEmoji} <b>Bitcoin ETF:</b> ${bitcoinFlowText}
${ethereumEmoji} <b>Ethereum ETF:</b> ${ethereumFlowText}

<b>Общие итоги:</b>
💰 Bitcoin: ${data.bitcoinTotal.toFixed(2)}M$
💰 Ethereum: ${data.ethereumTotal.toFixed(2)}M$

<i>${new Date().toLocaleString('ru-RU')}</i>
    `.trim();

    // Добавляем детальную информацию если есть данные
    if (data.bitcoinData || data.ethereumData) {
      message += '\n\n<b>Детали по фондам:</b>\n';

      if (data.bitcoinData) {
        message += '\n<b>Bitcoin ETF:</b>\n';
        const btcFunds = this.formatFundDetails(data.bitcoinData);
        message += btcFunds;
      }

      if (data.ethereumData) {
        message += '\n<b>Ethereum ETF:</b>\n';
        const ethFunds = this.formatFundDetails(data.ethereumData);
        message += ethFunds;
      }
    }

    return message;
  }

  /**
   * Форматирование деталей по фондам
   */
  private formatFundDetails(fundData: any): string {
    const funds: string[] = [];

    if (fundData.blackrock && fundData.blackrock !== 0) {
      funds.push(`BlackRock: ${fundData.blackrock.toFixed(2)}M$`);
    }
    if (fundData.fidelity && fundData.fidelity !== 0) {
      funds.push(`Fidelity: ${fundData.fidelity.toFixed(2)}M$`);
    }
    if (fundData.bitwise && fundData.bitwise !== 0) {
      funds.push(`Bitwise: ${fundData.bitwise.toFixed(2)}M$`);
    }
    if (fundData.twentyOneShares && fundData.twentyOneShares !== 0) {
      funds.push(`21Shares: ${fundData.twentyOneShares.toFixed(2)}M$`);
    }
    if (fundData.vanEck && fundData.vanEck !== 0) {
      funds.push(`VanEck: ${fundData.vanEck.toFixed(2)}M$`);
    }
    if (fundData.invesco && fundData.invesco !== 0) {
      funds.push(`Invesco: ${fundData.invesco.toFixed(2)}M$`);
    }
    if (fundData.franklin && fundData.franklin !== 0) {
      funds.push(`Franklin: ${fundData.franklin.toFixed(2)}M$`);
    }
    if (fundData.grayscale && fundData.grayscale !== 0) {
      funds.push(`Grayscale: ${fundData.grayscale.toFixed(2)}M$`);
    }
    if (fundData.valkyrie && fundData.valkyrie !== 0) {
      funds.push(`Valkyrie: ${fundData.valkyrie.toFixed(2)}M$`);
    }
    if (fundData.wisdomTree && fundData.wisdomTree !== 0) {
      funds.push(`WisdomTree: ${fundData.wisdomTree.toFixed(2)}M$`);
    }
    if (fundData.grayscaleEth && fundData.grayscaleEth !== 0) {
      funds.push(`Grayscale ETH: ${fundData.grayscaleEth.toFixed(2)}M$`);
    }
    if (fundData.grayscaleBtc && fundData.grayscaleBtc !== 0) {
      funds.push(`Grayscale BTC: ${fundData.grayscaleBtc.toFixed(2)}M$`);
    }

    return funds.length > 0 ? funds.join('\n') : 'Нет данных';
  }

  /**
   * Проверка инициализации бота
   */
  isInitialized(): boolean {
    return !!(this.bot && this.chatId);
  }
}
