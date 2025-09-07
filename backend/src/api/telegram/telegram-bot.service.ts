/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
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
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);
  private bot: TelegramBot;
  private isInitialized = false;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    this.logger.log('🚀 TelegramBotService constructor called');
    void this.initializeBot();
  }

  private initializeBot() {
    this.logger.log('🔧 Initializing Telegram bot...');
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!token) {
      this.logger.warn(
        '⚠️ TELEGRAM_BOT_TOKEN not found in environment variables',
      );
      return;
    }

    this.logger.log(
      `🔑 Telegram bot token found: ${token.substring(0, 10)}...`,
    );

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.logger.log('✅ Telegram bot instance created');

      // Добавляем обработчики событий для отладки
      this.bot.on('polling_error', (error) => {
        this.logger.error('❌ Polling error:', error);
      });

      this.bot.on('error', (error) => {
        this.logger.error('❌ Bot error:', error);
      });

      this.setupBotHandlers();
      this.isInitialized = true;
      this.logger.log('🎯 ETF Flow Tracker готов к работе!');

      // Проверяем, что polling действительно запущен
      this.logger.log('🔄 Polling status:', this.bot.isPolling());
    } catch (error) {
      this.logger.error('❌ Error initializing Telegram bot:', error);
    }
  }

  private setupBotHandlers() {
    this.logger.log('🔧 Настройка обработчиков Telegram бота...');

    // Добавляем общий обработчик всех сообщений для отладки
    this.bot.on('message', (msg) => {
      this.logger.log(
        `📨 Получено сообщение от ${msg.from?.first_name} (${msg.chat.id}): ${msg.text || '[не текстовое сообщение]'}`,
      );
      this.logger.log(`📨 Полное сообщение: ${JSON.stringify(msg, null, 2)}`);
    });

    // /start command with parameters
    this.bot.onText(/\/start(.*)/, (msg, match) => {
      this.logger.log(
        `🚀 Обработка команды /start от ${msg.from?.first_name} (${msg.chat.id})`,
      );
      this.logger.log(`🚀 Параметры команды: match=${JSON.stringify(match)}`);
      void (async () => {
        const chatId = msg.chat.id;
        const userName = msg.from?.first_name || 'User';
        const startParam = match?.[1]?.trim(); // Parameter after /start
        let appName = 'etf.flow'; // Default app

        try {
          // If there's a parameter, parse it
          if (startParam) {
            let deviceId = startParam;

            // Check if parameter contains app name (format: "etf_flow_deviceId_os")
            if (startParam.includes('_')) {
              const parts = startParam.split('_');
              if (parts.length >= 3 && startParam.startsWith('etf_flow_')) {
                appName = 'etf.flow'; // Фиксированное название приложения
                const os = parts[parts.length - 1]; // Последняя часть - это OS
                // Убираем "etf_flow_" из начала и "_os" из конца
                deviceId = startParam.substring(9, startParam.lastIndexOf('_'));

                this.logger.log(
                  `🔍 Парсинг: appName=${appName}, deviceId=${deviceId}, os=${os}`,
                );
              } else {
                // Fallback для старого формата
                appName = parts[0];
                deviceId = parts.slice(1).join('_');
              }
            }

            // Очищаем deviceId от префикса OS (как в notification.service.ts)
            let cleanDeviceId = deviceId;
            if (deviceId.startsWith('ios_')) {
              cleanDeviceId = deviceId.substring(4); // Убираем 'ios_'
            } else if (deviceId.startsWith('android_')) {
              cleanDeviceId = deviceId.substring(8); // Убираем 'android_'
            }

            this.logger.log(
              `🔍 Поиск пользователя: оригинальный deviceId=${deviceId}, очищенный deviceId=${cleanDeviceId}`,
            );

            // Try to find user by deviceId
            const userByDeviceId = await this.prismaService.user.findUnique({
              where: { deviceId: cleanDeviceId },
              include: { application: true },
            });

            this.logger.log(
              `🔍 Результат поиска пользователя: ${userByDeviceId ? `найден (ID: ${userByDeviceId.id})` : 'не найден'}`,
            );

            if (userByDeviceId) {
              // Проверяем, не привязан ли уже этот Telegram Chat ID к другому пользователю
              const existingTelegramUser =
                await this.prismaService.user.findUnique({
                  where: { telegramChatId: chatId.toString() },
                });

              if (
                existingTelegramUser &&
                existingTelegramUser.id !== userByDeviceId.id
              ) {
                this.logger.warn(
                  `⚠️ Telegram Chat ID ${chatId} уже привязан к другому пользователю (${existingTelegramUser.id})`,
                );
                await this.bot.sendMessage(
                  chatId,
                  '❌ Этот Telegram аккаунт уже привязан к другому устройству. Обратитесь в поддержку.',
                );
                return;
              }

              // Получаем текущие настройки пользователя
              const currentSettings = (userByDeviceId.settings as any) || {};
              const currentProfile = currentSettings.profile || {};

              // Обновляем настройки с данными из Telegram
              const updatedSettings = {
                ...currentSettings,
                profile: {
                  ...currentProfile,
                  firstName:
                    currentProfile.firstName ||
                    msg.from?.first_name ||
                    currentProfile.firstName,
                  lastName:
                    currentProfile.lastName ||
                    msg.from?.last_name ||
                    currentProfile.lastName,
                },
                preferences: {
                  ...currentSettings.preferences,
                  language:
                    currentSettings.preferences?.language ||
                    msg.from?.language_code ||
                    currentSettings.preferences?.language,
                },
                notifications: {
                  ...currentSettings.notifications,
                  enableTelegramNotifications: true,
                },
              };

              // Привязываем Telegram аккаунт к существующему пользователю
              await this.prismaService.user.update({
                where: { id: userByDeviceId.id },
                data: {
                  telegramChatId: chatId.toString(),
                  lastUsed: new Date(),
                  settings: updatedSettings,
                },
              });

              const welcomeMessage = `
🤖 <b>Welcome to ${userByDeviceId.application.displayName}!</b>

👋 Hello, ${userName}!

🔔 <b>Telegram notifications activated!</b>

📱 Application: ${userByDeviceId.application.displayName}
👤 User: ${currentProfile.firstName || 'Not specified'} ${currentProfile.lastName || ''}
🆔 Device ID: ${userByDeviceId.deviceId}
🖥️ OS: ${userByDeviceId.os || 'Unknown'}

📊 You will receive notifications about:
• Bitcoin ETF flows
• Ethereum ETF flows
• Significant flow changes

<i>Use /help to see available commands</i>
            `.trim();

              await this.bot.sendMessage(chatId, welcomeMessage, {
                parse_mode: 'HTML',
              });

              this.logger.log(
                `✅ User ${userName} (${chatId}) automatically linked to deviceId: ${startParam}`,
              );
              return;
            }
          }

          // Проверяем, есть ли уже пользователь с таким Telegram Chat ID
          const existingUser = await this.prismaService.user.findUnique({
            where: { telegramChatId: chatId.toString() },
            include: { application: true },
          });

          if (existingUser) {
            // Получаем текущие настройки пользователя
            const currentSettings = (existingUser.settings as any) || {};

            // Обновляем настройки с активацией Telegram уведомлений
            const updatedSettings = {
              ...currentSettings,
              notifications: {
                ...currentSettings.notifications,
                enableTelegramNotifications: true,
              },
            };

            // Пользователь уже существует, активируем Telegram уведомления
            await this.prismaService.user.update({
              where: { id: existingUser.id },
              data: {
                telegramChatId: chatId.toString(),
                lastUsed: new Date(),
                settings: updatedSettings,
              },
            });

            const welcomeMessage = `
🤖 <b>Welcome back!</b>

👋 Hello, ${userName}!

🔔 <b>Telegram notifications activated!</b>

📊 You will receive notifications about:
• Bitcoin ETF flows
• Ethereum ETF flows
• Significant flow changes

<i>Use /help to see available commands</i>
          `.trim();

            await this.bot.sendMessage(chatId, welcomeMessage, {
              parse_mode: 'HTML',
            });

            this.logger.log(
              `✅ User ${userName} (${chatId}) activated Telegram notifications`,
            );
          } else {
            // Создаем нового пользователя в базе данных для Telegram-only использования
            const defaultApp = await this.prismaService.application.findFirst({
              where: { name: appName },
            });

            if (!defaultApp) {
              this.logger.error(`❌ Application "${appName}" not found`);
              await this.bot.sendMessage(
                chatId,
                `❌ Application "${appName}" not found. Please contact support.`,
              );
              return;
            }

            // Создаем пользователя с базовой информацией
            const newUserSettings = {
              notifications: {
                enableETFUpdates: true,
                enableSignificantFlow: true,
                enableTestNotifications: false,
                enableTelegramNotifications: true,
                minFlowThreshold: 0.1,
                significantChangePercent: 20.0,
              },
              preferences: {
                language: msg.from?.language_code || 'en',
                deviceType: 'telegram',
              },
              profile: {
                firstName: msg.from?.first_name || 'Telegram',
                lastName: msg.from?.last_name || 'User',
              },
            };

            const newUser = await this.prismaService.user.create({
              data: {
                applicationId: defaultApp.id,
                deviceId: `telegram_device_${chatId}`, // Уникальный deviceId для Telegram
                deviceToken: `telegram_token_${chatId}`, // Заглушка для FCM токена
                telegramChatId: chatId.toString(),
                os: 'telegram',
                settings: newUserSettings,
                isActive: true,
                lastUsed: new Date(),
              },
            });

            const welcomeMessage = `
🤖 <b>Welcome to ${defaultApp.displayName}!</b>

👋 Hello, ${userName}!

🔔 <b>Telegram notifications activated!</b>

📊 You will receive notifications about:
• Bitcoin ETF flows
• Ethereum ETF flows
• Significant flow changes

📱 <b>To sync with mobile app:</b>
1. Open the ${defaultApp.displayName} application
2. Go to settings
3. Find the "Telegram notifications" section
4. Use Device ID: <code>${newUser.deviceId}</code>

<i>Use /help to see available commands</i>
          `.trim();

            await this.bot.sendMessage(chatId, welcomeMessage, {
              parse_mode: 'HTML',
            });

            this.logger.log(
              `✅ New Telegram user ${userName} (${chatId}) created and registered in ${defaultApp.displayName} with deviceId: ${newUser.deviceId}`,
            );
          }
        } catch (error) {
          this.logger.error('❌ Error processing /start command:', error);
        }
      })();
    });

    // /stop command
    this.bot.onText(/\/stop/, async (msg) => {
      const chatId = msg.chat.id;
      const userName = msg.from?.first_name || 'User';

      try {
        const user = await this.prismaService.user.findUnique({
          where: { telegramChatId: chatId.toString() },
        });

        if (user) {
          // Получаем текущие настройки пользователя
          const currentSettings = (user.settings as any) || {};

          // Обновляем настройки с отключением Telegram уведомлений
          const updatedSettings = {
            ...currentSettings,
            notifications: {
              ...currentSettings.notifications,
              enableTelegramNotifications: false,
            },
          };

          await this.prismaService.user.update({
            where: { id: user.id },
            data: {
              settings: updatedSettings,
            },
          });

          const stopMessage = `
🔕 <b>Telegram notifications disabled</b>

👋 Goodbye, ${userName}!

You will no longer receive Telegram notifications about ETF flows.

<i>Use /start to reactivate</i>
          `.trim();

          await this.bot.sendMessage(chatId, stopMessage, {
            parse_mode: 'HTML',
          });

          this.logger.log(
            `❌ User ${userName} (${chatId}) disabled Telegram notifications`,
          );
        } else {
          await this.bot.sendMessage(
            chatId,
            '❌ You are not registered in the system.',
          );
        }
      } catch (error) {
        this.logger.error('❌ Error processing /stop command:', error);
      }
    });

    // /status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;

      try {
        const user = await this.prismaService.user.findUnique({
          where: { telegramChatId: chatId.toString() },
          include: { application: true },
        });

        if (user) {
          // Получаем настройки пользователя
          const settings = (user.settings as any) || {};
          const profile = settings.profile || {};
          const notifications = settings.notifications || {};

          const statusMessage = `
📊 <b>Account Status</b>

👤 User: ${profile.firstName || 'Not specified'} ${profile.lastName || ''}
📱 Application: ${user.application.displayName}
🖥️ OS: ${user.os || 'Unknown'}
🆔 Device ID: ${user.deviceId || 'Not specified'}
🔔 Telegram notifications: ${notifications.enableTelegramNotifications ? '✅ Enabled' : '❌ Disabled'}
📊 ETF notifications: ${notifications.enableETFUpdates ? '✅ Enabled' : '❌ Disabled'}
📈 Significant changes: ${notifications.enableSignificantFlow ? '✅ Enabled' : '❌ Disabled'}

📅 Registration date: ${new Date(user.createdAt).toLocaleDateString('en-US')}
🔗 Telegram linked: ${user.telegramChatId ? '✅ Linked' : '❌ Not linked'}
🕐 Last used: ${new Date(user.lastUsed).toLocaleString('en-US')}

<i>Use /start to activate or /stop to disable</i>
          `.trim();

          await this.bot.sendMessage(chatId, statusMessage, {
            parse_mode: 'HTML',
          });
        } else {
          await this.bot.sendMessage(
            chatId,
            '❌ You are not registered in the system. Use /start to register.',
          );
        }
      } catch (error) {
        this.logger.error('❌ Error processing /status command:', error);
      }
    });

    // /help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;

      const helpMessage = `
📋 <b>Available commands:</b>

/start - Subscribe to ETF notifications
/stop - Unsubscribe from notifications
/status - Check subscription status
/help - Show this help

📊 <b>About the bot:</b>
I send notifications about new ETF flow data:
• Bitcoin ETF flows
• Ethereum ETF flows
• Significant changes (>20%)

🔔 Notifications are sent automatically when new data appears.
      `.trim();

      await this.bot.sendMessage(chatId, helpMessage, {
        parse_mode: 'HTML',
      });
    });

    // Обработка ошибок
    this.bot.on('error', (error) => {
      this.logger.error('❌ Ошибка Telegram бота:', error);
    });

    this.bot.on('polling_error', (error) => {
      this.logger.error('❌ Ошибка polling:', error);
    });

    this.logger.log('✅ Обработчики Telegram бота настроены');
  }

  /**
   * Отправка уведомления всем подписанным пользователям
   */
  async sendETFUpdateNotification(data: ETFNotificationData): Promise<boolean> {
    if (!this.isInitialized) {
      this.logger.warn('⚠️ Telegram бот не инициализирован');
      return false;
    }

    try {
      // Получаем всех пользователей с включенными Telegram уведомлениями
      const activeUsers = await this.prismaService.user.findMany({
        where: {
          isActive: true,
          telegramChatId: { not: null },
          settings: {
            path: ['notifications', 'enableTelegramNotifications'],
            equals: true,
          },
        },
      });

      if (activeUsers.length === 0) {
        this.logger.log(
          '📱 Нет активных пользователей с Telegram уведомлениями',
        );
        return true;
      }

      const message = this.formatETFMessage(data);
      let successCount = 0;
      let errorCount = 0;

      // Отправляем уведомление каждому пользователю
      for (const user of activeUsers) {
        try {
          await this.bot.sendMessage(parseInt(user.telegramChatId!), message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          });
          successCount++;
        } catch (error) {
          errorCount++;
          this.logger.warn(
            `⚠️ Не удалось отправить сообщение пользователю ${user.telegramChatId}:`,
            error.message,
          );

          // Если пользователь заблокировал бота, отключаем Telegram уведомления
          if (error.response?.body?.error_code === 403) {
            // Получаем текущие настройки пользователя
            const currentSettings = (user.settings as any) || {};

            // Обновляем настройки с отключением Telegram уведомлений
            const updatedSettings = {
              ...currentSettings,
              notifications: {
                ...currentSettings.notifications,
                enableTelegramNotifications: false,
              },
            };

            await this.prismaService.user.update({
              where: { id: user.id },
              data: {
                settings: updatedSettings,
              },
            });
            this.logger.log(
              `🚫 Пользователь ${user.telegramChatId} заблокировал бота, Telegram уведомления отключены`,
            );
          }
        }
      }

      this.logger.log(
        `✅ Telegram уведомление отправлено: ${successCount} успешно, ${errorCount} ошибок`,
      );
      return successCount > 0;
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
    if (!this.isInitialized) {
      this.logger.warn('⚠️ Telegram бот не инициализирован');
      return false;
    }

    try {
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

      const activeUsers = await this.prismaService.user.findMany({
        where: { isActive: true },
      });

      let successCount = 0;
      for (const user of activeUsers) {
        if (!user.telegramChatId) continue;

        try {
          await this.bot.sendMessage(parseInt(user.telegramChatId), message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          });
          successCount++;
        } catch (error) {
          if (error.response?.body?.error_code === 403) {
            await this.prismaService.user.update({
              where: { telegramChatId: user.telegramChatId },
              data: { isActive: false },
            });
          }
        }
      }

      this.logger.log(
        `✅ Telegram уведомление о значительном изменении ${type} отправлено: ${successCount} пользователей`,
      );
      return successCount > 0;
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
    if (!this.isInitialized) {
      this.logger.warn('⚠️ Telegram бот не инициализирован');
      return false;
    }

    try {
      const message = `
🧪 <b>Тестовое уведомление</b>

ETF Tracker работает корректно!

<i>${new Date().toLocaleString('ru-RU')}</i>
      `.trim();

      const activeUsers = await this.prismaService.user.findMany({
        where: { isActive: true },
      });

      let successCount = 0;
      for (const user of activeUsers) {
        if (!user.telegramChatId) continue;

        try {
          await this.bot.sendMessage(parseInt(user.telegramChatId), message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          });
          successCount++;
        } catch (error) {
          if (error.response?.body?.error_code === 403) {
            await this.prismaService.user.update({
              where: { telegramChatId: user.telegramChatId },
              data: { isActive: false },
            });
          }
        }
      }

      this.logger.log(
        `✅ Telegram тестовое уведомление отправлено: ${successCount} пользователей`,
      );
      return successCount > 0;
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
   * Получение статистики пользователей
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    try {
      const [total, active] = await Promise.all([
        this.prismaService.user.count(),
        this.prismaService.user.count({
          where: { isActive: true },
        }),
      ]);

      return {
        total,
        active,
        inactive: total - active,
      };
    } catch (error) {
      this.logger.error('❌ Ошибка получения статистики пользователей:', error);
      return { total: 0, active: 0, inactive: 0 };
    }
  }

  /**
   * Проверка инициализации бота
   */
  isBotInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Получение информации о боте
   */
  async getBotInfo(): Promise<any> {
    if (!this.isInitialized || !this.bot) {
      return null;
    }

    try {
      const botInfo = await this.bot.getMe();
      return botInfo;
    } catch (error) {
      this.logger.error('❌ Ошибка получения информации о боте:', error);
      return null;
    }
  }

  /**
   * Отправка тестового сообщения пользователю
   */
  async sendTestMessage(chatId: string, message: string): Promise<boolean> {
    if (!this.isInitialized || !this.bot) {
      this.logger.warn('⚠️ Telegram бот не инициализирован');
      return false;
    }

    try {
      await this.bot.sendMessage(chatId, `🧪 ${message}`);
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
}
