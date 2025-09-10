import { Injectable, Logger } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { UserService } from '../services/user.service';

@Injectable()
export class BasicCommands {
  private readonly logger = new Logger(BasicCommands.name);

  constructor(private userService: UserService) {}

  setupCommands(bot: TelegramBot) {
    // /start command
    bot.onText(/\/start/, (msg) => {
      void this.handleStartCommand(bot, msg);
    });

    // /stop command
    bot.onText(/\/stop/, (msg) => {
      void this.handleStopCommand(bot, msg);
    });

    // /status command
    bot.onText(/\/status/, (msg) => {
      void this.handleStatusCommand(bot, msg);
    });

    // /help command
    bot.onText(/\/help/, (msg) => {
      void this.handleHelpCommand(bot, msg);
    });

    // /app command
    bot.onText(/\/app/, (msg) => {
      void this.handleAppCommand(bot, msg);
    });

    // /link command
    bot.onText(/\/link/, (msg) => {
      void this.handleLinkCommand(bot, msg);
    });

    // /link DEVICE_ID command
    bot.onText(/\/link (.+)/, (msg, match) => {
      void this.handleLinkWithDeviceIdCommand(bot, msg, match);
    });

    // Handle regular messages that might be Device IDs
    bot.on('message', (msg) => {
      void this.handleRegularMessage(bot, msg);
    });
  }

  private async handleStartCommand(bot: TelegramBot, msg: any) {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';

    try {
      const user = await this.userService.findUserByTelegramChatId(
        chatId.toString(),
      );

      if (user) {
        const welcomeMessage = `
🤖 <b>Welcome back to ETF Tracker!</b>

👋 Hello, ${userName}!

🔔 <b>Telegram notifications are active!</b>

📋 <b>Available commands:</b>
/help - Show all commands
/status - Check your status
/link - Link Telegram to mobile app
/bitcoin - Get Bitcoin ETF data
/ethereum - Get Ethereum ETF data
/summary - Get ETF summary

<i>You'll receive notifications automatically when new ETF data appears!</i>
        `.trim();

        await bot.sendMessage(chatId, welcomeMessage, {
          parse_mode: 'HTML',
        });
      } else {
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
/help - Show all commands
/link - Link Telegram to mobile app
/bitcoin - Get Bitcoin ETF data
/ethereum - Get Ethereum ETF data
/summary - Get ETF summary

<i>After linking, you will receive notifications automatically!</i>
        `.trim();

        await bot.sendMessage(chatId, linkMessage, {
          parse_mode: 'HTML',
        });
      }

      this.logger.log(`📝 User ${userName} (${chatId}) used /start command`);
    } catch (error) {
      this.logger.error('❌ Error processing /start command:', error);
    }
  }

  private async handleStopCommand(bot: TelegramBot, msg: any) {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';

    try {
      const user = await this.userService.findUserByTelegramChatId(
        chatId.toString(),
      );

      if (user) {
        const success = await this.userService.disableTelegramNotifications(
          user.id,
        );

        if (success) {
          const stopMessage = `
🔕 <b>Telegram notifications disabled</b>

👋 Goodbye, ${userName}!

You will no longer receive Telegram notifications about ETF flows.

<i>Use /start to reactivate</i>
          `.trim();

          await bot.sendMessage(chatId, stopMessage, {
            parse_mode: 'HTML',
          });

          this.logger.log(
            `❌ User ${userName} (${chatId}) disabled Telegram notifications`,
          );
        } else {
          await bot.sendMessage(
            chatId,
            '❌ Error disabling notifications. Please try again.',
          );
        }
      } else {
        await bot.sendMessage(
          chatId,
          '❌ You are not registered. Please use /start first.',
        );
      }
    } catch (error) {
      this.logger.error('❌ Error processing /stop command:', error);
    }
  }

  private async handleStatusCommand(bot: TelegramBot, msg: any) {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';

    try {
      const user = await this.userService.findUserByTelegramChatId(
        chatId.toString(),
      );

      if (user) {
        const statusMessage = `
📊 <b>Your Status</b>

👤 <b>User:</b> ${userName}
🆔 <b>Telegram ID:</b> <code>${chatId}</code>
📱 <b>Device ID:</b> <code>${user.deviceId || 'Not connected'}</code>
🔔 <b>Notifications:</b> ${user.enableTelegramNotifications ? '✅ Enabled' : '❌ Disabled'}
📱 <b>App:</b> ${user.deviceId ? '✅ Connected' : '❌ Not connected'}
🏢 <b>Application:</b> ${user.application?.displayName || 'Not specified'}

${
  user.deviceId
    ? '✅ <b>Full functionality enabled!</b>\n📱 You have access to all features.'
    : '⚠️ <b>Limited functionality</b>\n📱 Install the mobile app for full features.'
}
        `.trim();

        await bot.sendMessage(chatId, statusMessage, {
          parse_mode: 'HTML',
        });
      } else {
        await bot.sendMessage(
          chatId,
          '❌ You are not registered. Please use /start for registration.',
        );
      }
    } catch (error) {
      this.logger.error('❌ Error processing /status command:', error);
    }
  }

  private async handleHelpCommand(bot: TelegramBot, msg: any) {
    const chatId = msg.chat.id;

    try {
      const user = await this.userService.findUserByTelegramChatId(
        chatId.toString(),
      );

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
/link - Link Telegram to mobile app

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

      await bot.sendMessage(chatId, helpMessage, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      this.logger.error('❌ Error processing /help command:', error);
    }
  }

  private async handleAppCommand(bot: TelegramBot, msg: any) {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';

    try {
      const user = await this.userService.findUserByTelegramChatId(
        chatId.toString(),
      );

      if (!user) {
        await bot.sendMessage(
          chatId,
          '❌ You are not registered. Please use /start first.',
        );
        return;
      }

      const appMessage = `
📱 <b>ETF Tracker - Installation Guide</b>

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

      await bot.sendMessage(chatId, appMessage, {
        parse_mode: 'HTML',
      });

      this.logger.log(
        `📱 User ${userName} (${chatId}) requested app installation instructions`,
      );
    } catch (error) {
      this.logger.error('❌ Error processing /app command:', error);
      await bot.sendMessage(
        chatId,
        '❌ Error getting app information. Please try again later.',
      );
    }
  }

  private async handleLinkCommand(bot: TelegramBot, msg: any) {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';

    try {
      // Проверяем, не привязан ли уже пользователь
      const existingUser = await this.userService.findUserByTelegramChatId(
        chatId.toString(),
      );

      if (existingUser) {
        const alreadyLinkedMessage = `
🔗 <b>Telegram уже привязан!</b>

Ваш аккаунт уже связан с приложением:
• Device ID: <code>${existingUser.deviceId}</code>
• Приложение: ${existingUser.application?.name || 'Неизвестно'}
• Статус: ${existingUser.isActive ? 'Активен' : 'Неактивен'}

<i>Используйте /status для проверки статуса</i>
        `.trim();

        await bot.sendMessage(chatId, alreadyLinkedMessage, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `🔗 User ${userName} (${chatId}) already linked to device ${existingUser.deviceId}`,
        );
        return;
      }

      // Отправляем инструкции по привязке
      const linkMessage = `
🔗 <b>Привязка Telegram к приложению</b>

Для привязки вашего Telegram аккаунта к приложению ETF Tracker:

1️⃣ <b>Откройте приложение ETF Tracker</b>
2️⃣ <b>Перейдите в Настройки</b>
3️⃣ <b>Найдите секцию "Device ID"</b>
4️⃣ <b>Скопируйте ваш Device ID</b>
5️⃣ <b>Отправьте команду:</b> <code>/link YOUR_DEVICE_ID</code>

<b>Пример:</b>
<code>/link android_1234567890_1234567890</code>

<i>После привязки вы будете получать уведомления о важных изменениях в ETF!</i>
      `.trim();

      await bot.sendMessage(chatId, linkMessage, {
        parse_mode: 'HTML',
      });

      this.logger.log(
        `🔗 User ${userName} (${chatId}) requested link instructions`,
      );
    } catch (error) {
      this.logger.error('❌ Error processing /link command:', error);
      await bot.sendMessage(
        chatId,
        '❌ Error processing link request. Please try again later.',
      );
    }
  }

  private async handleLinkWithDeviceIdCommand(
    bot: TelegramBot,
    msg: any,
    match: RegExpExecArray | null,
  ) {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';

    if (!match || !match[1]) {
      await bot.sendMessage(
        chatId,
        '❌ Неверный формат команды. Используйте: /link YOUR_DEVICE_ID',
      );
      return;
    }

    const deviceId = match[1].trim();

    try {
      // Проверяем, не привязан ли уже пользователь
      const existingUser = await this.userService.findUserByTelegramChatId(
        chatId.toString(),
      );

      if (existingUser) {
        const alreadyLinkedMessage = `
🔗 <b>Telegram уже привязан!</b>

Ваш аккаунт уже связан с приложением:
• Device ID: <code>${existingUser.deviceId}</code>
• Приложение: ${existingUser.application?.name || 'Неизвестно'}
• Статус: ${existingUser.isActive ? 'Активен' : 'Неактивен'}

<i>Используйте /status для проверки статуса</i>
        `.trim();

        await bot.sendMessage(chatId, alreadyLinkedMessage, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `🔗 User ${userName} (${chatId}) already linked to device ${existingUser.deviceId}`,
        );
        return;
      }

      // Ищем пользователя по Device ID
      const userByDeviceId =
        await this.userService.findUserByDeviceId(deviceId);

      if (!userByDeviceId) {
        const notFoundMessage = `
❌ <b>Пользователь не найден!</b>

Device ID <code>${deviceId}</code> не найден в системе.

<b>Возможные причины:</b>
• Неверный Device ID
• Приложение еще не зарегистрировано
• Device ID скопирован неправильно

<b>Что делать:</b>
1️⃣ Убедитесь, что приложение ETF Tracker запущено
2️⃣ Скопируйте Device ID заново из настроек
3️⃣ Попробуйте команду еще раз

<i>Используйте /link без параметров для получения инструкций</i>
        `.trim();

        await bot.sendMessage(chatId, notFoundMessage, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `❌ User ${userName} (${chatId}) tried to link with non-existent device ID: ${deviceId}`,
        );
        return;
      }

      // Проверяем, не привязан ли уже этот Device ID к другому Telegram
      if (userByDeviceId.telegramChatId) {
        const alreadyLinkedToOtherMessage = `
❌ <b>Device ID уже привязан!</b>

Device ID <code>${deviceId}</code> уже привязан к другому Telegram аккаунту.

<b>Что делать:</b>
• Если это ваш аккаунт - используйте /status для проверки
• Если это не ваш аккаунт - обратитесь в поддержку

<i>Используйте /link без параметров для получения инструкций</i>
        `.trim();

        await bot.sendMessage(chatId, alreadyLinkedToOtherMessage, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `❌ User ${userName} (${chatId}) tried to link device ${deviceId} that's already linked to ${userByDeviceId.telegramChatId}`,
        );
        return;
      }

      // Привязываем Telegram к пользователю
      const linkSuccess = await this.userService.linkTelegramToUser(
        userByDeviceId.id,
        chatId.toString(),
        {
          firstName: msg.from?.first_name,
          lastName: msg.from?.last_name,
          languageCode: msg.from?.language_code,
        },
      );

      if (linkSuccess) {
        const successMessage = `
✅ <b>Telegram успешно привязан!</b>

Ваш аккаунт теперь связан с приложением:
• Device ID: <code>${deviceId}</code>
• Приложение: ${userByDeviceId.application?.name || 'Неизвестно'}
• Telegram: @${msg.from?.username || userName}

<b>Теперь вы будете получать:</b>
• Уведомления о важных изменениях в ETF
• Еженедельные сводки
• Специальные предложения

<i>Используйте /status для проверки статуса</i>
        `.trim();

        await bot.sendMessage(chatId, successMessage, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `✅ User ${userName} (${chatId}) successfully linked to device ${deviceId}`,
        );
      } else {
        const errorMessage = `
❌ <b>Ошибка привязки!</b>

Не удалось привязать Telegram к Device ID.

<b>Что делать:</b>
• Попробуйте команду еще раз
• Убедитесь, что Device ID правильный
• Обратитесь в поддержку, если проблема повторяется

<i>Используйте /link без параметров для получения инструкций</i>
        `.trim();

        await bot.sendMessage(chatId, errorMessage, {
          parse_mode: 'HTML',
        });

        this.logger.error(
          `❌ Failed to link user ${userName} (${chatId}) to device ${deviceId}`,
        );
      }
    } catch (error) {
      this.logger.error('❌ Error processing /link DEVICE_ID command:', error);
      await bot.sendMessage(
        chatId,
        '❌ Error processing link request. Please try again later.',
      );
    }
  }

  private async handleRegularMessage(bot: TelegramBot, msg: any) {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';
    const messageText = msg.text;

    // Пропускаем команды (они обрабатываются отдельно)
    if (messageText?.startsWith('/')) {
      return;
    }

    // Пропускаем пустые сообщения
    if (!messageText || messageText.trim().length === 0) {
      return;
    }

    try {
      // Проверяем, не привязан ли уже пользователь
      const existingUser = await this.userService.findUserByTelegramChatId(
        chatId.toString(),
      );

      if (existingUser) {
        // Пользователь уже привязан, не обрабатываем сообщение
        return;
      }

      // Проверяем, похож ли текст на Device ID
      // Паттерн для UUID_timestamp или platform_id_timestamp
      const deviceIdPattern = /^[A-F0-9-]+_\d+$/i;

      // Также проверяем более общий паттерн для Device ID
      const generalDeviceIdPattern = /^[A-F0-9-]+_\d+$/i;
      if (deviceIdPattern.test(messageText.trim())) {
        // Это похоже на Device ID, пытаемся привязать
        this.logger.log(
          `🔍 User ${userName} (${chatId}) sent potential Device ID: ${messageText.trim()}`,
        );
        await this.handleLinkWithDeviceIdCommand(bot, msg, {
          1: messageText.trim(),
        } as unknown as RegExpExecArray);
      } else {
        // Не похоже на Device ID, отправляем инструкции
        const helpMessage = `
🤖 <b>Привет, ${userName}!</b>

Я получил ваше сообщение, но не понял, что вы хотите сделать.

<b>Доступные команды:</b>
• /start - Начать работу с ботом
• /link - Инструкции по привязке Telegram
• /status - Проверить статус привязки
• /help - Показать все команды

<b>Для привязки к приложению:</b>
1️⃣ Откройте приложение ETF Tracker
2️⃣ Перейдите в Настройки → Device ID
3️⃣ Скопируйте Device ID
4️⃣ Отправьте команду: <code>/link ВАШ_DEVICE_ID</code>

<i>Или просто вставьте Device ID в следующем сообщении</i>
        `.trim();

        await bot.sendMessage(chatId, helpMessage, {
          parse_mode: 'HTML',
        });

        this.logger.log(
          `💬 User ${userName} (${chatId}) sent unrecognized message: ${messageText}`,
        );
      }
    } catch (error) {
      this.logger.error('❌ Error processing regular message:', error);
    }
  }
}
