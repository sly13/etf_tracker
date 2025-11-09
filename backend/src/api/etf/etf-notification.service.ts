import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { FirebaseAdminService } from '../notifications/firebase-admin.service';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';

export interface ETFNotificationSettings {
  minAmount: number; // Минимальная сумма для уведомления (в миллионах)
  enabledCompanies: string[]; // Компании для отслеживания
  enabledAssets: ('bitcoin' | 'ethereum')[]; // Типы активов
  notificationTypes: ('instant' | 'daily')[]; // Типы уведомлений
  enabled: boolean; // Включены ли уведомления
}

@Injectable()
export class ETFNotificationService {
  private readonly logger = new Logger(ETFNotificationService.name);

  constructor(
    private prisma: PrismaService,
    private firebaseAdminService: FirebaseAdminService,
    private telegramBotService: TelegramBotService,
  ) {}

  /**
   * Получает настройки уведомлений пользователя
   */
  async getUserNotificationSettings(
    userId: string,
  ): Promise<ETFNotificationSettings> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { settings: true },
      });

      if (!user?.settings) {
        return this.getDefaultSettings();
      }

      const settings = user.settings as any;
      return {
        minAmount: settings.etfNotifications?.minAmount || 1,
        enabledCompanies: settings.etfNotifications?.enabledCompanies || [
          'blackrock',
          'fidelity',
        ],
        enabledAssets: settings.etfNotifications?.enabledAssets || [
          'bitcoin',
          'ethereum',
        ],
        notificationTypes: settings.etfNotifications?.notificationTypes || [
          'instant',
        ],
        enabled: settings.etfNotifications?.enabled !== false,
      };
    } catch (error) {
      this.logger.error('Ошибка при получении настроек уведомлений:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Обновляет настройки уведомлений пользователя
   */
  async updateUserNotificationSettings(
    userId: string,
    settings: Partial<ETFNotificationSettings>,
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { settings: true },
      });

      const currentSettings = (user?.settings as any) || {};
      const etfSettings = currentSettings.etfNotifications || {};

      const updatedSettings = {
        ...currentSettings,
        etfNotifications: {
          ...etfSettings,
          ...settings,
        },
      };

      await this.prisma.user.update({
        where: { id: userId },
        data: { settings: updatedSettings },
      });

      this.logger.log(
        `Настройки уведомлений обновлены для пользователя ${userId}`,
      );
    } catch (error) {
      this.logger.error('Ошибка при обновлении настроек уведомлений:', error);
      throw error;
    }
  }

  /**
   * Получает пользователей, которым нужно отправить уведомления о новых записях ETF
   * 
   * ВАЖНО: Проверка подписки отключена - уведомления приходят всем пользователям
   * Чтобы включить проверку подписки, раскомментируйте код ниже
   */
  async getUsersForETFNotifications(appName: string): Promise<any[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          application: { name: appName },
          isActive: true,
          // deviceToken проверяется в JavaScript фильтре ниже (так как поле не nullable в схеме)
          settings: {
            path: ['etfNotifications', 'enabled'],
            equals: true,
          },
          // ПРОВЕРКА ПОДПИСКИ ЗАКОММЕНТИРОВАНА - уведомления приходят всем
          // subscriptions: {
          //   some: {
          //     isActive: true,
          //     isPremium: true,
          //     OR: [
          //       { expirationDate: null },
          //       { expirationDate: { gt: new Date() } },
          //     ],
          //   },
          // },
        },
        select: {
          id: true,
          deviceToken: true,
          telegramChatId: true,
          settings: true,
        },
      });

      return users.filter((user) => {
        // Фильтруем пользователей с deviceToken (на случай, если в БД есть null значения)
        if (!user.deviceToken) {
          return false;
        }
        
        // Дополнительная проверка настроек (на случай, если path фильтр не сработал)
        const settings = user.settings as any;
        return settings?.etfNotifications?.enabled !== false;
        
        // ПРОВЕРКА ПОДПИСКИ ЗАКОММЕНТИРОВАНА - уведомления приходят всем
        // Для включения проверки подписки раскомментируйте:
        // const hasActivePremium = await this.checkUserPremiumSubscription(user.id);
        // return settings?.etfNotifications?.enabled !== false && hasActivePremium;
      });
    } catch (error) {
      this.logger.error(
        'Ошибка при получении пользователей для ETF уведомлений:',
        error,
      );
      return [];
    }
  }

  /**
   * Отправляет уведомления о новых записях ETF
   */
  async sendETFNotificationsForNewRecords(appName: string): Promise<void> {
    try {
      this.logger.log('🔔 Начинаю отправку уведомлений о новых записях ETF...');

      // Получаем новые записи без отправленных уведомлений
      let newRecords;
      try {
        newRecords = await this.prisma.eTFNewRecord.findMany({
          where: {
            deliveries: {
              none: {}, // Записи без доставок уведомлений
            },
          },
          orderBy: {
            detectedAt: 'desc',
          },
          take: 20, // Ограничиваем количество для обработки
        });
      } catch (error: any) {
        // Проверяем, является ли ошибка отсутствием таблицы (P2021)
        if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
          this.logger.warn(
            '⚠️ Таблица etf_new_records не существует. Пропускаем отправку уведомлений. Примените миграцию: npx prisma migrate deploy',
          );
          return;
        }
        throw error; // Пробрасываем другие ошибки
      }

      if (newRecords.length === 0) {
        this.logger.log('📭 Новых записей для уведомлений не найдено');
        return;
      }

      this.logger.log(
        `📊 Найдено ${newRecords.length} новых записей для уведомлений`,
      );

      // Получаем пользователей для уведомлений
      const users = await this.getUsersForETFNotifications(appName);

      if (users.length === 0) {
        this.logger.log('👥 Пользователей для уведомлений не найдено');
        return;
      }

      this.logger.log(
        `👥 Найдено ${users.length} пользователей для уведомлений`,
      );

      let totalSent = 0;
      let totalFailed = 0;

      // Обрабатываем каждую новую запись
      for (const record of newRecords) {
        this.logger.log(
          `📝 Обрабатываю запись: ${record.company} - ${record.amount}M ${record.assetType}`,
        );

        // Отправляем уведомления каждому пользователю
        // ВАЖНО: Проверка подписки отключена - уведомления приходят всем пользователям
        for (const user of users) {
          try {
            const userSettings = await this.getUserNotificationSettings(
              user.id,
            );

            // Проверяем, подходит ли запись под настройки пользователя
            if (!this.shouldNotifyUser(record, userSettings)) {
              continue;
            }

            // ПРОВЕРКА ПОДПИСКИ ЗАКОММЕНТИРОВАНА - уведомления приходят всем
            // Для включения проверки подписки раскомментируйте:
            // const subscription = await this.subscriptionService.getUserSubscriptionStatus(user.id);
            // if (!subscription?.isCurrentlyActive || !subscription?.isPremium) {
            //   continue; // Пропускаем пользователей без активной премиум подписки
            // }

            // Создаем запись о доставке
            let delivery;
            try {
              delivery = await this.prisma.eTFNotificationDelivery.create({
                data: {
                  userId: user.id,
                  recordId: record.id,
                  sent: false,
                  channel: 'push',
                },
              });
            } catch (error: any) {
              // Проверяем, является ли ошибка отсутствием таблицы (P2021)
              if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
                this.logger.warn(
                  '⚠️ Таблица etf_notification_deliveries не существует. Продолжаем без записи доставки.',
                );
                // Продолжаем отправку уведомления, но без записи доставки
                delivery = null;
              } else {
                throw error;
              }
            }

            // Отправляем push уведомление
            const title = this.formatNotificationTitle(record);
            const body = this.formatNotificationBody(record);

            await this.firebaseAdminService.sendNotificationToToken(
              user.deviceToken,
              title,
              body,
              {
                type: 'etf_new_record',
                recordId: record.id,
                assetType: record.assetType,
                company: record.company,
                amount: record.amount.toString(),
                date: record.date.toISOString(),
              },
            );

            // Отмечаем как отправленное (если запись доставки была создана)
            if (delivery) {
              try {
                await this.prisma.eTFNotificationDelivery.update({
                  where: { id: delivery.id },
                  data: {
                    sent: true,
                    sentAt: new Date(),
                  },
                });
              } catch (error: any) {
                // Игнорируем ошибки обновления, если таблица не существует
                if (error?.code !== 'P2021' && !error?.message?.includes('does not exist')) {
                  this.logger.error('Ошибка обновления статуса доставки:', error);
                }
              }
            }

            totalSent++;
            this.logger.log(
              `✅ Уведомление отправлено пользователю ${user.id}`,
            );

            // Отправляем Telegram уведомление, если есть chatId
            if (user.telegramChatId) {
              try {
                await this.telegramBotService.sendTestMessage(
                  user.telegramChatId,
                  `${title}\n\n${body}`,
                );

                // Создаем запись о Telegram доставке
                try {
                  await this.prisma.eTFNotificationDelivery.create({
                    data: {
                      userId: user.id,
                      recordId: record.id,
                      sent: true,
                      sentAt: new Date(),
                      channel: 'telegram',
                    },
                  });
                } catch (error: any) {
                  // Игнорируем ошибки создания записи, если таблица не существует
                  if (error?.code !== 'P2021' && !error?.message?.includes('does not exist')) {
                    this.logger.error('Ошибка создания записи Telegram доставки:', error);
                  }
                }

                this.logger.log(
                  `📱 Telegram уведомление отправлено пользователю ${user.id}`,
                );
              } catch (telegramError) {
                this.logger.error(
                  `Ошибка отправки Telegram уведомления:`,
                  telegramError,
                );
              }
            }
          } catch (error) {
            totalFailed++;
            this.logger.error(
              `Ошибка отправки уведомления пользователю ${user.id}:`,
              error,
            );

            // Отмечаем ошибку в доставке
            try {
              await this.prisma.eTFNotificationDelivery.updateMany({
                where: {
                  userId: user.id,
                  recordId: record.id,
                  sent: false,
                },
                data: {
                  error: error.message,
                },
              });
            } catch (updateError: any) {
              // Игнорируем ошибки, если таблица не существует
              if (updateError?.code !== 'P2021' && !updateError?.message?.includes('does not exist')) {
                this.logger.error(
                  'Ошибка обновления статуса доставки:',
                  updateError,
                );
              }
            }
          }
        }
      }

      this.logger.log(
        `🎉 Отправка уведомлений завершена. Отправлено: ${totalSent}, Ошибок: ${totalFailed}`,
      );
    } catch (error) {
      this.logger.error(
        'Ошибка при отправке уведомлений о новых записях ETF:',
        error,
      );
    }
  }

  /**
   * Проверяет, нужно ли уведомить пользователя о записи
   */
  private shouldNotifyUser(
    record: any,
    settings: ETFNotificationSettings,
  ): boolean {
    // Проверяем, включены ли уведомления
    if (!settings.enabled) {
      return false;
    }

    // Проверяем минимальную сумму
    if (record.amount < settings.minAmount) {
      return false;
    }

    // Проверяем тип актива
    if (!settings.enabledAssets.includes(record.assetType)) {
      return false;
    }

    // Проверяем компанию
    if (!settings.enabledCompanies.includes(record.company)) {
      return false;
    }

    return true;
  }

  /**
   * Форматирует заголовок уведомления
   */
  private formatNotificationTitle(record: any): string {
    const companyName = this.getCompanyDisplayName(record.company);
    const assetName = record.assetType === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
    const amount = Math.abs(record.amount).toFixed(1);

    // Определяем, является ли изменение притоком или оттоком
    const isInflow = record.amount > 0;
    const sign = isInflow ? '+' : '-';
    const action = isInflow ? 'bought' : 'sold';

    return `📊 ${companyName} ${action} ${assetName} ETF for ${sign}${amount}M`;
  }

  /**
   * Форматирует текст уведомления
   */
  private formatNotificationBody(record: any): string {
    const assetName = record.assetType === 'bitcoin' ? 'Bitcoin' : 'Ethereum';

    return `${assetName} ETF`;
  }

  /**
   * Получает отображаемое имя компании
   */
  private getCompanyDisplayName(company: string): string {
    const companyNames: { [key: string]: string } = {
      blackrock: 'BlackRock',
      fidelity: 'Fidelity',
      bitwise: 'Bitwise',
      twentyOneShares: '21Shares',
      vanEck: 'VanEck',
      invesco: 'Invesco',
      franklin: 'Franklin Templeton',
      grayscale: 'Grayscale',
      grayscaleEth: 'Grayscale',
      grayscaleBtc: 'Grayscale',
      valkyrie: 'Valkyrie',
      wisdomTree: 'WisdomTree',
    };

    return companyNames[company] || company;
  }

  /**
   * Получает дефолтные настройки
   */
  private getDefaultSettings(): ETFNotificationSettings {
    return {
      minAmount: 1,
      enabledCompanies: ['blackrock', 'fidelity'],
      enabledAssets: ['bitcoin', 'ethereum'],
      notificationTypes: ['instant'],
      enabled: true,
    };
  }

  /**
   * Получает статистику уведомлений пользователя
   */
  async getUserNotificationStats(userId: string): Promise<{
    totalSent: number;
    totalFailed: number;
    lastNotification: Date | null;
  }> {
    try {
      const sentCount = await this.prisma.eTFNotificationDelivery.count({
        where: { userId, sent: true },
      });

      const failedCount = await this.prisma.eTFNotificationDelivery.count({
        where: { userId, sent: false },
      });

      const lastNotification =
        await this.prisma.eTFNotificationDelivery.findFirst({
          where: { userId, sent: true },
          orderBy: { sentAt: 'desc' },
          select: { sentAt: true },
        });

      return {
        totalSent: sentCount,
        totalFailed: failedCount,
        lastNotification: lastNotification?.sentAt || null,
      };
    } catch (error: any) {
      // Проверяем, является ли ошибка отсутствием таблицы (P2021)
      if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
        this.logger.warn(
          '⚠️ Таблица etf_notification_deliveries не существует. Возвращаем пустую статистику.',
        );
        return {
          totalSent: 0,
          totalFailed: 0,
          lastNotification: null,
        };
      }
      this.logger.error('Ошибка при получении статистики уведомлений:', error);
      return {
        totalSent: 0,
        totalFailed: 0,
        lastNotification: null,
      };
    }
  }
}
