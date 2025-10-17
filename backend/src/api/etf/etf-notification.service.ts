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
   */
  async getUsersForETFNotifications(appName: string): Promise<any[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          application: { name: appName },
          isActive: true,
          deviceToken: { not: null as any },
          settings: {
            path: ['etfNotifications', 'enabled'],
            equals: true,
          },
        },
        select: {
          id: true,
          deviceToken: true,
          telegramChatId: true,
          settings: true,
        },
      });

      return users.filter((user) => {
        const settings = user.settings as any;
        return settings?.etfNotifications?.enabled !== false;
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
      const newRecords = await this.prisma.eTFNewRecord.findMany({
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
        for (const user of users) {
          try {
            const userSettings = await this.getUserNotificationSettings(
              user.id,
            );

            // Проверяем, подходит ли запись под настройки пользователя
            if (!this.shouldNotifyUser(record, userSettings)) {
              continue;
            }

            // Создаем запись о доставке
            const delivery = await this.prisma.eTFNotificationDelivery.create({
              data: {
                userId: user.id,
                recordId: record.id,
                sent: false,
                channel: 'push',
              },
            });

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

            // Отмечаем как отправленное
            await this.prisma.eTFNotificationDelivery.update({
              where: { id: delivery.id },
              data: {
                sent: true,
                sentAt: new Date(),
              },
            });

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
                await this.prisma.eTFNotificationDelivery.create({
                  data: {
                    userId: user.id,
                    recordId: record.id,
                    sent: true,
                    sentAt: new Date(),
                    channel: 'telegram',
                  },
                });

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
            } catch (updateError) {
              this.logger.error(
                'Ошибка обновления статуса доставки:',
                updateError,
              );
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
    } catch (error) {
      this.logger.error('Ошибка при получении статистики уведомлений:', error);
      return {
        totalSent: 0,
        totalFailed: 0,
        lastNotification: null,
      };
    }
  }
}
