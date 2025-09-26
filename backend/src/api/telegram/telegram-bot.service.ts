/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { UniversalETFFlowService } from '../etf/universal-etf-flow.service';
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
    private etfFlowService: UniversalETFFlowService,
  ) {
    this.logger.log('🚀 TelegramBotService constructor called');
    void this.initializeBot();
  }

  private initializeBot() {
    this.logger.log('🔧 Initializing Telegram bot...');
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    this.logger.log(`🔍 Checking TELEGRAM_BOT_TOKEN...`);
    this.logger.log(`🔍 Token exists: ${!!token}`);
    this.logger.log(`🔍 Token length: ${token?.length || 0}`);

    if (!token) {
      this.logger.warn(
        '⚠️ TELEGRAM_BOT_TOKEN not found in environment variables',
      );
      this.logger.warn('⚠️ Bot will not be initialized');
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

      this.bot.on('message', (msg) => {
        this.logger.log(
          `📨 Получено сообщение: ${JSON.stringify(msg, null, 2)}`,
        );
      });

      this.logger.log('🔧 Setting up bot handlers...');

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

    // Setup bot commands menu
    this.setupBotCommandsMenu();

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
      this.logger.log(`🚀 Полный текст сообщения: "${msg.text}"`);
      this.logger.log(`🚀 Параметры команды: match=${JSON.stringify(match)}`);
      this.logger.log(`🚀 Match groups: ${match?.length || 0} групп`);
      if (match) {
        for (let i = 0; i < match.length; i++) {
          this.logger.log(`🚀 Match[${i}]: "${match[i]}"`);
        }
      }

      // Логируем полную ссылку, которая пришла
      this.logger.log(`🔗 === ПОЛНАЯ ССЫЛКА ===`);
      this.logger.log(`🔗 Полное сообщение: ${JSON.stringify(msg, null, 2)}`);
      this.logger.log(`🔗 Текст: "${msg.text}"`);
      this.logger.log(`🔗 Entities: ${JSON.stringify(msg.entities)}`);
      this.logger.log(`🔗 ====================`);
      this.logger.log(`🚀 Entities: ${JSON.stringify(msg.entities)}`);
      this.logger.log(`🚀 Caption: "${msg.caption || 'нет'}"`);
      this.logger.log(`🚀 Contact: ${JSON.stringify(msg.contact)}`);
      this.logger.log(`🚀 Location: ${JSON.stringify(msg.location)}`);

      // Проверяем, есть ли параметры в entities
      if (msg.entities) {
        for (const entity of msg.entities) {
          if (entity.type === 'bot_command') {
            this.logger.log(
              `🚀 Bot command entity: offset=${entity.offset}, length=${entity.length}`,
            );
            const commandText = msg.text?.substring(
              entity.offset,
              entity.offset + entity.length,
            );
            this.logger.log(`🚀 Command text: "${commandText}"`);

            // Проверяем, есть ли параметры после команды
            const afterCommand = msg.text?.substring(
              entity.offset + entity.length,
            );
            this.logger.log(`🚀 After command: "${afterCommand}"`);
            if (afterCommand && afterCommand.trim()) {
              this.logger.log(
                `🚀 Found parameters after command: "${afterCommand.trim()}"`,
              );
            }
          }
        }
      }
      void (async () => {
        const chatId = msg.chat.id;
        const userName = msg.from?.first_name || 'User';
        const startParam = match?.[1]?.trim(); // Parameter after /start
        let appName = 'etf.flow'; // Default app

        this.logger.log(
          `🚀 Начало обработки /start: chatId=${chatId}, userName=${userName}, startParam="${startParam}"`,
        );
        this.logger.log(`🔍 === АНАЛИЗ ПАРАМЕТРОВ /start ===`);
        this.logger.log(`📝 Полный startParam: "${startParam}"`);
        this.logger.log(`📏 Длина startParam: ${startParam?.length || 0}`);

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
                this.logger.log(`🔍 === РЕЗУЛЬТАТ ПАРСИНГА ===`);
                this.logger.log(`📱 AppName: ${appName}`);
                this.logger.log(`📱 DeviceId (до очистки): ${deviceId}`);
                this.logger.log(`🖥️ OS: ${os}`);
              } else {
                // Fallback для старого формата
                appName = parts[0];
                deviceId = parts.slice(1).join('_');
              }
            }

            // deviceId уже чистый (без префикса платформы)
            const cleanDeviceId = deviceId;

            this.logger.log(`🔍 Поиск пользователя: deviceId=${cleanDeviceId}`);

            // Отправляем deviceId в чат для отладки
            await this.bot.sendMessage(
              chatId,
              `🔍 <b>Отладка:</b>\n` +
                `📱 DeviceId: <code>${cleanDeviceId}</code>\n` +
                `🔍 Ищем пользователя в базе данных...`,
              { parse_mode: 'HTML' },
            );

            // Try to find user by deviceId
            const userByDeviceId = await this.prismaService.user.findUnique({
              where: { deviceId: cleanDeviceId },
              include: { application: true },
            });

            this.logger.log(
              `🔍 Результат поиска пользователя: ${userByDeviceId ? `найден (ID: ${userByDeviceId.id})` : 'не найден'}`,
            );

            // Отправляем результат поиска в чат
            if (userByDeviceId) {
              await this.bot.sendMessage(
                chatId,
                `✅ <b>Пользователь найден!</b>\n` +
                  `🆔 ID: <code>${userByDeviceId.id}</code>\n` +
                  `📱 DeviceId: <code>${userByDeviceId.deviceId}</code>\n` +
                  `📱 App: ${userByDeviceId.application.displayName}\n` +
                  `🔗 Привязываем Telegram...`,
                { parse_mode: 'HTML' },
              );
            } else {
              await this.bot.sendMessage(
                chatId,
                `❌ <b>Пользователь не найден!</b>\n` +
                  `🔍 Искали по deviceId: <code>${cleanDeviceId}</code>\n` +
                  `⏳ Ожидаем регистрации в приложении...`,
                { parse_mode: 'HTML' },
              );
            }

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
              this.logger.log(
                `🔗 Привязываем Telegram Chat ID ${chatId} к пользователю ${userByDeviceId.id} (deviceId: ${userByDeviceId.deviceId})`,
              );

              const updateResult = await this.prismaService.user.update({
                where: { id: userByDeviceId.id },
                data: {
                  telegramChatId: chatId.toString(),
                  lastUsed: new Date(),
                  settings: updatedSettings,
                },
              });

              this.logger.log(
                `✅ Пользователь обновлен: ID=${updateResult.id}, telegramChatId=${updateResult.telegramChatId}`,
              );

              // Проверяем, что обновление прошло успешно
              if (updateResult.telegramChatId !== chatId.toString()) {
                this.logger.error(
                  `❌ ОШИБКА: telegramChatId не обновился! Ожидалось: ${chatId}, получено: ${updateResult.telegramChatId}`,
                );
              } else {
                this.logger.log(
                  `✅ telegramChatId успешно обновлен: ${updateResult.telegramChatId}`,
                );
              }

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
            } else {
              // Пользователь не найден по deviceId - возможно, он еще не зарегистрировался в приложении
              // Сохраняем информацию о том, что этот Telegram аккаунт ожидает привязки к deviceId
              this.logger.log(
                `⏳ Пользователь с deviceId ${cleanDeviceId} не найден. Ожидаем регистрации в приложении.`,
              );

              const waitingMessage = `
🤖 <b>Welcome to ETF Flow Tracker!</b>

👋 Hello, ${userName}!

⏳ <b>Waiting for app registration...</b>

📱 Please open the ETF Flow Tracker app on your device and complete the registration process.

🆔 Your Device ID: <code>${cleanDeviceId}</code>

Once you register in the app, your Telegram account will be automatically linked and you'll start receiving notifications.

<i>Use /help to see available commands</i>
              `.trim();

              await this.bot.sendMessage(chatId, waitingMessage, {
                parse_mode: 'HTML',
              });

              this.logger.log(
                `⏳ User ${userName} (${chatId}) waiting for app registration with deviceId: ${cleanDeviceId}`,
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

            // Проверяем, есть ли у пользователя deviceId (подключено ли мобильное приложение)
            let welcomeMessage = '';
            if (
              existingUser.deviceId &&
              !existingUser.deviceId.startsWith('telegram_')
            ) {
              // У пользователя есть подключенное мобильное приложение
              welcomeMessage = `
🤖 <b>Welcome back!</b>

👋 Hello, ${userName}!

🔔 <b>Telegram notifications activated!</b>

📊 You will receive notifications about:
• Bitcoin ETF flows
• Ethereum ETF flows
• Significant flow changes

✅ <b>Mobile app connected!</b>
🆔 Device ID: <code>${existingUser.deviceId}</code>

<i>Use /help to see available commands</i>
              `.trim();
            } else {
              // У пользователя нет подключенного мобильного приложения
              welcomeMessage = `
🤖 <b>Welcome back!</b>

👋 Hello, ${userName}!

🔔 <b>Telegram notifications activated!</b>

📊 You will receive notifications about:
• Bitcoin ETF flows
• Ethereum ETF flows
• Significant flow changes

⚠️ <b>Mobile app not connected</b>
📱 Install the mobile app for full functionality:
• iOS: [App Store Link]
• Android: [Google Play Link]

🆔 Your Telegram Device ID: <code>telegram_${chatId}</code>

💡 <i>Use /app for detailed installation instructions</i>
              `.trim();
            }

            await this.bot.sendMessage(chatId, welcomeMessage, {
              parse_mode: 'HTML',
            });

            this.logger.log(
              `✅ User ${userName} (${chatId}) activated Telegram notifications`,
            );
          } else {
            // Пользователь не найден - предлагаем установить приложение
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

            // Создаем временного пользователя для Telegram-only использования
            this.logger.log(
              `⚠️ СОЗДАНИЕ НОВОГО ПОЛЬЗОВАТЕЛЯ! Это не должно происходить, если пользователь уже существует.`,
            );
            this.logger.log(
              `⚠️ Параметры: chatId=${chatId}, appName=${appName}, startParam=${startParam}`,
            );

            await this.bot.sendMessage(
              chatId,
              `⚠️ <b>СОЗДАНИЕ НОВОГО ПОЛЬЗОВАТЕЛЯ!</b>\n` +
                `🔍 Это не должно происходить, если пользователь уже существует.\n` +
                `📱 App: ${appName}\n` +
                `🔗 ChatId: <code>${chatId}</code>\n` +
                `📝 StartParam: <code>${startParam}</code>`,
              { parse_mode: 'HTML' },
            );

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

            await this.prismaService.user.create({
              data: {
                applicationId: defaultApp.id,
                deviceId: null, // Нет deviceId - пользователь должен установить приложение
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

📱 <b>⚠️ To get full functionality, please install the mobile app:</b>

1️⃣ <b>Download the app:</b>
   • iOS: [App Store Link]
   • Android: [Google Play Link]

2️⃣ <b>After installation:</b>
   • Open the app
   • Go to Settings → Telegram Notifications
   • Use this Device ID: <code>telegram_${chatId}</code>
   • Or scan QR code from app settings

3️⃣ <b>Benefits of mobile app:</b>
   • Real-time push notifications
   • Detailed ETF analytics
   • Portfolio tracking
   • Custom alerts

💡 <i>You can still receive basic notifications via Telegram without the app</i>

<i>Use /help to see available commands</i>
          `.trim();

            await this.bot.sendMessage(chatId, welcomeMessage, {
              parse_mode: 'HTML',
            });

            this.logger.log(
              `✅ New Telegram-only user ${userName} (${chatId}) created in ${defaultApp.displayName} - no deviceId (app installation required)`,
            );
          }
        } catch (error) {
          this.logger.error('❌ Error processing /start command:', error);
        }
      })();
    });

    // /start command without parameters
    this.bot.onText(/^\/start$/, async (msg) => {
      const chatId = msg.chat.id;
      const userName = msg.from?.first_name || 'User';

      this.logger.log(
        `🚀 Обработка команды /start без параметров от ${userName} (${chatId})`,
      );

      try {
        // Проверяем, есть ли уже пользователь с таким Telegram Chat ID
        const existingUser = await this.prismaService.user.findUnique({
          where: { telegramChatId: chatId.toString() },
          include: { application: true },
        });

        if (existingUser) {
          // Пользователь уже зарегистрирован
          const welcomeMessage = `
🤖 <b>Welcome back to ETF Tracker!</b>

👋 Hello, ${userName}!

🔔 <b>Telegram notifications are active!</b>

📋 <b>Available commands:</b>

<b>Basic Commands:</b>
/start - Subscribe to ETF notifications
/stop - Unsubscribe from notifications
/status - Check subscription status
/help - Show detailed help
/app - Get app installation instructions
/link - Link Telegram to mobile app

<b>ETF Data Commands:</b>
/bitcoin - Get Bitcoin ETF flow data
/ethereum - Get Ethereum ETF flow data
/summary - Get both Bitcoin & Ethereum summary

<b>About the bot:</b>
I send notifications about new ETF flow data:
• Bitcoin ETF flows
• Ethereum ETF flows
• Significant changes (>20%)

🔔 Notifications are sent automatically when new data appears.

<i>Use /help for detailed information about each command!</i>
          `.trim();

          await this.bot.sendMessage(chatId, welcomeMessage, {
            parse_mode: 'HTML',
          });

          this.logger.log(
            `✅ Existing user ${userName} (${chatId}) received welcome message`,
          );
        } else {
          // Новый пользователь - показываем инструкции по привязке
          const linkMessage = `
🤖 <b>Welcome to ETF Tracker Bot!</b>

👋 Hello, ${userName}!

📱 To receive notifications, you need to first register in the ETF Flow Tracker application.

🔗 <b>How to link Telegram:</b>
1. Open the ETF Flow Tracker application
2. Go to settings
3. Find the "Device ID" section
4. Copy your Device ID
5. Send command: <code>/link YOUR_DEVICE_ID</code>

📋 <b>Available commands:</b>

<b>Basic Commands:</b>
/start - Subscribe to ETF notifications
/stop - Unsubscribe from notifications
/status - Check subscription status
/help - Show detailed help
/app - Get app installation instructions
/link - Link Telegram to mobile app

<b>ETF Data Commands:</b>
/bitcoin - Get Bitcoin ETF flow data
/ethereum - Get Ethereum ETF flow data
/summary - Get both Bitcoin & Ethereum summary

<b>About the bot:</b>
I send notifications about new ETF flow data:
• Bitcoin ETF flows
• Ethereum ETF flows
• Significant changes (>20%)

🔔 Notifications are sent automatically when new data appears.

<i>After linking, you will receive notifications automatically!</i>
          `.trim();

          await this.bot.sendMessage(chatId, linkMessage, {
            parse_mode: 'HTML',
          });

          this.logger.log(
            `📝 New user ${userName} (${chatId}) received linking instructions`,
          );
        }
      } catch (error) {
        this.logger.error(
          '❌ Error processing /start command without parameters:',
          error,
        );
        await this.bot.sendMessage(
          chatId,
          '❌ Error processing command. Please try again later.',
        );
      }
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

          // Определяем статус мобильного приложения
          let appStatus = '';
          let deviceIdDisplay = '';

          if (user.deviceId) {
            if (user.deviceId.startsWith('telegram_')) {
              appStatus = '⚠️ Telegram-only (Mobile app not connected)';
              deviceIdDisplay = `${user.deviceId} (Telegram ID)`;
            } else {
              appStatus = '✅ Mobile app connected';
              deviceIdDisplay = user.deviceId;
            }
          } else {
            appStatus = '❌ Mobile app not connected';
            deviceIdDisplay = 'Not specified';
          }

          const statusMessage = `
📊 <b>Account Status</b>

👤 User: ${profile.firstName || 'Not specified'} ${profile.lastName || ''}
📱 Application: ${user.application.displayName}
🖥️ OS: ${user.os || 'Unknown'}
🆔 Device ID: ${deviceIdDisplay}
📲 Mobile App: ${appStatus}

🔔 <b>Notifications:</b>
• Telegram: ${notifications.enableTelegramNotifications ? '✅ Enabled' : '❌ Disabled'}
• ETF Updates: ${notifications.enableETFUpdates ? '✅ Enabled' : '❌ Disabled'}
• Significant Changes: ${notifications.enableSignificantFlow ? '✅ Enabled' : '❌ Disabled'}

📅 Registration: ${new Date(user.createdAt).toLocaleDateString('en-US')}
🔗 Telegram: ${user.telegramChatId ? '✅ Linked' : '❌ Not linked'}
🕐 Last Used: ${new Date(user.lastUsed).toLocaleString('en-US')}

${
  !user.deviceId || user.deviceId.startsWith('telegram_')
    ? '💡 <i>Use /app to get mobile app installation instructions</i>'
    : '<i>Use /start to activate or /stop to disable</i>'
}
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

      // Проверяем статус пользователя
      const user = await this.prismaService.user.findUnique({
        where: { telegramChatId: chatId.toString() },
        include: { application: true },
      });

      let deviceStatusMessage = '';
      if (user) {
        if (user.deviceId) {
          deviceStatusMessage = `
✅ <b>Mobile app connected!</b>
🆔 Device ID: <code>${user.deviceId}</code>
📱 You have full functionality enabled.
          `.trim();
        } else {
          deviceStatusMessage = `
⚠️ <b>Mobile app not connected</b>
📱 Install the app for full functionality:
• iOS: [App Store Link]
• Android: [Google Play Link]

🆔 Your Telegram Device ID: <code>telegram_${chatId}</code>
          `.trim();
        }
      }

      const helpMessage = `
📋 <b>Available commands:</b>

/start - Subscribe to ETF notifications
/stop - Unsubscribe from notifications
/status - Check subscription status
/help - Show this help
/app - Get app installation instructions

📊 <b>ETF Data Commands:</b>
/bitcoin - Get Bitcoin ETF flow data
/ethereum - Get Ethereum ETF flow data
/summary - Get both Bitcoin & Ethereum summary

📊 <b>About the bot:</b>
I send notifications about new ETF flow data:
• Bitcoin ETF flows
• Ethereum ETF flows
• Significant changes (>20%)

🔔 Notifications are sent automatically when new data appears.

${deviceStatusMessage}
      `.trim();

      await this.bot.sendMessage(chatId, helpMessage, {
        parse_mode: 'HTML',
      });
    });

    // /app command - Get app installation instructions
    this.bot.onText(/\/app/, async (msg) => {
      const chatId = msg.chat.id;
      const userName = msg.from?.first_name || 'User';

      try {
        const user = await this.prismaService.user.findUnique({
          where: { telegramChatId: chatId.toString() },
          include: { application: true },
        });

        if (!user) {
          await this.bot.sendMessage(
            chatId,
            '❌ You are not registered. Please use /start first.',
          );
          return;
        }

        const appMessage = `
📱 <b>${user.application.displayName} - Installation Guide</b>

👋 Hello, ${userName}!

🔗 <b>Download Links:</b>
• iOS: [App Store Link]
• Android: [Google Play Link]

📋 <b>Installation Steps:</b>

1️⃣ <b>Download & Install:</b>
   • Click the appropriate link above
   • Install the app on your device

2️⃣ <b>Connect to Telegram:</b>
   • Open the app
   • Go to Settings → Telegram Notifications
   • Enter this Device ID: <code>telegram_${chatId}</code>
   • Or scan QR code from app settings

3️⃣ <b>Verify Connection:</b>
   • Use /status command to check connection
   • You should see "Mobile app connected"

🎯 <b>Benefits of Mobile App:</b>
• Real-time push notifications
• Detailed ETF analytics & charts
• Portfolio tracking
• Custom alerts & thresholds
• Offline data access
• Better performance

💡 <b>Note:</b>
You can still receive basic notifications via Telegram without the app, but the mobile app provides much more functionality.

<i>Use /status to check your connection status</i>
        `.trim();

        await this.bot.sendMessage(chatId, appMessage, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `📱 User ${userName} (${chatId}) requested app installation instructions`,
        );
      } catch (error) {
        this.logger.error('❌ Error processing /app command:', error);
        await this.bot.sendMessage(
          chatId,
          '❌ Error getting app information. Please try again later.',
        );
      }
    });

    // /ethereum command - Get Ethereum ETF data
    this.bot.onText(/\/ethereum/, async (msg) => {
      const chatId = msg.chat.id;
      const userName = msg.from?.first_name || 'User';

      try {
        const ethereumData =
          await this.etfFlowService.getETFFlowData('ethereum');

        if (!ethereumData || ethereumData.length === 0) {
          await this.bot.sendMessage(
            chatId,
            '📊 <b>Ethereum ETF Data</b>\n\n❌ No data available at the moment.',
            { parse_mode: 'HTML' },
          );
          return;
        }

        // Get latest data
        const latestData = ethereumData[0] as any;
        const totalFlow = latestData.total || 0;

        // Calculate 7-day average
        const sevenDayData = ethereumData.slice(0, 7);
        const sevenDayAverage =
          sevenDayData.reduce((sum, day) => sum + (day.total || 0), 0) /
          sevenDayData.length;

        const message = `
📊 <b>Ethereum ETF Flow Data</b>

📅 <b>Latest Data (${latestData.date}):</b>
💰 Total Flow: <b>${totalFlow.toLocaleString()} ETH</b>

📈 <b>7-Day Average:</b>
📊 Average Flow: <b>${sevenDayAverage.toLocaleString()} ETH</b>

🏢 <b>Top Performers:</b>
• BlackRock: ${(latestData.blackrock || 0).toLocaleString()} ETH
• Fidelity: ${(latestData.fidelity || 0).toLocaleString()} ETH
• Bitwise: ${(latestData.bitwise || 0).toLocaleString()} ETH
• Grayscale: ${(latestData.grayscale || 0).toLocaleString()} ETH

📊 <b>All Funds:</b>
• BlackRock: ${(latestData.blackrock || 0).toLocaleString()} ETH
• Fidelity: ${(latestData.fidelity || 0).toLocaleString()} ETH
• Bitwise: ${(latestData.bitwise || 0).toLocaleString()} ETH
• 21Shares: ${(latestData.twentyOneShares || 0).toLocaleString()} ETH
• VanEck: ${(latestData.vanEck || 0).toLocaleString()} ETH
• Invesco: ${(latestData.invesco || 0).toLocaleString()} ETH
• Franklin: ${(latestData.franklin || 0).toLocaleString()} ETH
• Grayscale: ${(latestData.grayscale || 0).toLocaleString()} ETH
• Grayscale ETH: ${(latestData.grayscaleCrypto || 0).toLocaleString()} ETH

<i>Data source: Farside.co.uk</i>
        `.trim();

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `📊 User ${userName} (${chatId}) requested Ethereum ETF data`,
        );
      } catch (error) {
        this.logger.error('❌ Error processing /ethereum command:', error);
        await this.bot.sendMessage(
          chatId,
          '❌ Error getting Ethereum ETF data. Please try again later.',
        );
      }
    });

    // /bitcoin command - Get Bitcoin ETF data
    this.bot.onText(/\/bitcoin/, async (msg) => {
      const chatId = msg.chat.id;
      const userName = msg.from?.first_name || 'User';

      try {
        const bitcoinData = await this.etfFlowService.getETFFlowData('bitcoin');

        if (!bitcoinData || bitcoinData.length === 0) {
          await this.bot.sendMessage(
            chatId,
            '📊 <b>Bitcoin ETF Data</b>\n\n❌ No data available at the moment.',
            { parse_mode: 'HTML' },
          );
          return;
        }

        // Get latest data
        const latestData = bitcoinData[0] as any;
        const totalFlow = latestData.total || 0;

        // Calculate 7-day average
        const sevenDayData = bitcoinData.slice(0, 7);
        const sevenDayAverage =
          sevenDayData.reduce((sum, day) => sum + (day.total || 0), 0) /
          sevenDayData.length;

        const message = `
📊 <b>Bitcoin ETF Flow Data</b>

📅 <b>Latest Data (${latestData.date}):</b>
💰 Total Flow: <b>${totalFlow.toLocaleString()} BTC</b>

📈 <b>7-Day Average:</b>
📊 Average Flow: <b>${sevenDayAverage.toLocaleString()} BTC</b>

🏢 <b>Top Performers:</b>
• BlackRock: ${(latestData.blackrock || 0).toLocaleString()} BTC
• Fidelity: ${(latestData.fidelity || 0).toLocaleString()} BTC
• Bitwise: ${(latestData.bitwise || 0).toLocaleString()} BTC
• Grayscale: ${(latestData.grayscale || 0).toLocaleString()} BTC

📊 <b>All Funds:</b>
• BlackRock: ${(latestData.blackrock || 0).toLocaleString()} BTC
• Fidelity: ${(latestData.fidelity || 0).toLocaleString()} BTC
• Bitwise: ${(latestData.bitwise || 0).toLocaleString()} BTC
• 21Shares: ${(latestData.twentyOneShares || 0).toLocaleString()} BTC
• VanEck: ${(latestData.vanEck || 0).toLocaleString()} BTC
• Invesco: ${(latestData.invesco || 0).toLocaleString()} BTC
• Franklin: ${(latestData.franklin || 0).toLocaleString()} BTC
• Valkyrie: ${(latestData.valkyrie || 0).toLocaleString()} BTC
• WisdomTree: ${(latestData.wisdomTree || 0).toLocaleString()} BTC
• Grayscale: ${(latestData.grayscale || 0).toLocaleString()} BTC
• Grayscale BTC: ${(latestData.grayscaleBtc || 0).toLocaleString()} BTC

<i>Data source: Farside.co.uk</i>
        `.trim();

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `📊 User ${userName} (${chatId}) requested Bitcoin ETF data`,
        );
      } catch (error) {
        this.logger.error('❌ Error processing /bitcoin command:', error);
        await this.bot.sendMessage(
          chatId,
          '❌ Error getting Bitcoin ETF data. Please try again later.',
        );
      }
    });

    // /summary command - Get both Bitcoin and Ethereum ETF data
    this.bot.onText(/\/summary/, async (msg) => {
      const chatId = msg.chat.id;
      const userName = msg.from?.first_name || 'User';

      try {
        const [bitcoinData, ethereumData] = await Promise.all([
          this.etfFlowService.getETFFlowData('bitcoin'),
          this.etfFlowService.getETFFlowData('ethereum'),
        ]);

        if (
          (!bitcoinData || bitcoinData.length === 0) &&
          (!ethereumData || ethereumData.length === 0)
        ) {
          await this.bot.sendMessage(
            chatId,
            '📊 <b>ETF Summary</b>\n\n❌ No data available at the moment.',
            { parse_mode: 'HTML' },
          );
          return;
        }

        let message = '📊 <b>ETF Flow Summary</b>\n\n';

        // Bitcoin data
        if (bitcoinData && bitcoinData.length > 0) {
          const latestBtc = bitcoinData[0] as any;
          const btcTotal = latestBtc.total || 0;
          const btcSevenDay = bitcoinData.slice(0, 7);
          const btcAverage =
            btcSevenDay.reduce((sum, day) => sum + (day.total || 0), 0) /
            btcSevenDay.length;

          message += `🟠 <b>Bitcoin ETF (${latestBtc.date}):</b>\n`;
          message += `💰 Total Flow: <b>${btcTotal.toLocaleString()} BTC</b>\n`;
          message += `📈 7-Day Avg: <b>${btcAverage.toLocaleString()} BTC</b>\n\n`;
        }

        // Ethereum data
        if (ethereumData && ethereumData.length > 0) {
          const latestEth = ethereumData[0] as any;
          const ethTotal = latestEth.total || 0;
          const ethSevenDay = ethereumData.slice(0, 7);
          const ethAverage =
            ethSevenDay.reduce((sum, day) => sum + (day.total || 0), 0) /
            ethSevenDay.length;

          message += `🔵 <b>Ethereum ETF (${latestEth.date}):</b>\n`;
          message += `💰 Total Flow: <b>${ethTotal.toLocaleString()} ETH</b>\n`;
          message += `📈 7-Day Avg: <b>${ethAverage.toLocaleString()} ETH</b>\n\n`;
        }

        message +=
          '💡 <i>Use /bitcoin or /ethereum for detailed breakdown</i>\n';
        message += '<i>Data source: Farside.co.uk</i>';

        await this.bot.sendMessage(chatId, message, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `📊 User ${userName} (${chatId}) requested ETF summary`,
        );
      } catch (error) {
        this.logger.error('❌ Error processing /summary command:', error);
        await this.bot.sendMessage(
          chatId,
          '❌ Error getting ETF summary. Please try again later.',
        );
      }
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

  private async setupBotCommandsMenu() {
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

      await this.bot.setMyCommands(commands);
      this.logger.log('✅ Bot commands menu setup completed');
    } catch (error) {
      this.logger.error('❌ Error setting up bot commands menu:', error);
    }
  }
}
