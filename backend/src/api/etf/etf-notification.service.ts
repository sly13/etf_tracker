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
      
      // Поддерживаем оба формата настроек
      // Новый формат: settings.etfNotifications.enabled
      // Старый формат: settings.notifications.enableETFUpdates
      const etfNotifications = settings.etfNotifications || {};
      const notifications = settings.notifications || {};
      
      // Уведомления включены, если включены в любом из форматов
      const isEnabled = 
        etfNotifications.enabled === true || 
        notifications.enableETFUpdates === true ||
        (etfNotifications.enabled !== false && notifications.enableETFUpdates !== false);
      
      return {
        minAmount: etfNotifications.minAmount || 1,
        enabledCompanies: etfNotifications.enabledCompanies || [
          'blackrock',
          'fidelity',
        ],
        enabledAssets: etfNotifications.enabledAssets || [
          'bitcoin',
          'ethereum',
        ],
        notificationTypes: etfNotifications.notificationTypes || [
          'instant',
        ],
        enabled: isEnabled,
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
      this.logger.log(`🔍 Ищу пользователей для ETF уведомлений (appName: ${appName})`);
      
      // Сначала получаем всех активных пользователей приложения
      const allUsers = await this.prisma.user.findMany({
        where: {
          application: { name: appName },
          isActive: true,
        },
        select: {
          id: true,
          deviceToken: true,
          telegramChatId: true,
          settings: true,
        },
      });

      this.logger.log(`   Найдено ${allUsers.length} активных пользователей приложения`);

      // Фильтруем пользователей с настройками
      // Поддерживаем оба формата: settings.notifications.enableETFUpdates и settings.etfNotifications.enabled
      const usersWithSettings = allUsers.filter((user) => {
        const settings = user.settings as any;
        
        // Проверяем новый формат (etfNotifications.enabled)
        const newFormatEnabled = settings?.etfNotifications?.enabled === true;
        
        // Проверяем старый формат (notifications.enableETFUpdates)
        const oldFormatEnabled = settings?.notifications?.enableETFUpdates === true;
        
        // Уведомления включены, если включены в любом из форматов
        const hasEnabled = newFormatEnabled || oldFormatEnabled;
        
        if (!hasEnabled) {
          this.logger.log(
            `   Пользователь ${user.id}: уведомления отключены`,
          );
          this.logger.log(
            `      settings.etfNotifications.enabled = ${settings?.etfNotifications?.enabled}`,
          );
          this.logger.log(
            `      settings.notifications.enableETFUpdates = ${settings?.notifications?.enableETFUpdates}`,
          );
        }
        
        return hasEnabled;
      });

      this.logger.log(`   Пользователей с включенными уведомлениями: ${usersWithSettings.length}`);

      // Фильтруем пользователей с deviceToken
      const usersWithToken = usersWithSettings.filter((user) => {
        if (!user.deviceToken) {
          this.logger.log(`   Пользователь ${user.id}: нет deviceToken`);
          return false;
        }
        return true;
      });

      this.logger.log(`   Пользователей с deviceToken: ${usersWithToken.length}`);

      return usersWithToken;
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

      // Группируем записи по времени обнаружения (detectedAt) с точностью до минуты
      // Если несколько записей пришли в одну минуту, суммируем их потоки
      const aggregatedFlows = new Map<string, {
        bitcoin: number;
        ethereum: number;
        solana: number;
        date: Date;
        detectedAt: Date;
        recordIds: string[];
        records: any[]; // Сохраняем полные записи для проверки компаний
      }>();

      for (const record of newRecords) {
        // Используем время обнаружения с точностью до минуты как ключ
        // Округляем до минуты: обрезаем секунды и миллисекунды
        const detectedAt = new Date(record.detectedAt);
        detectedAt.setSeconds(0, 0);
        const timeKey = detectedAt.toISOString();
        
        if (!aggregatedFlows.has(timeKey)) {
          aggregatedFlows.set(timeKey, {
            bitcoin: 0,
            ethereum: 0,
            solana: 0,
            date: record.date,
            detectedAt: detectedAt,
            recordIds: [],
            records: [],
          });
        }

        const aggregated = aggregatedFlows.get(timeKey)!;
        aggregated.recordIds.push(record.id);
        aggregated.records.push(record);

        // Суммируем потоки по типу актива
        // amount может быть положительным (приток) или отрицательным (отток)
        if (record.assetType === 'bitcoin') {
          aggregated.bitcoin += record.amount || 0;
        } else if (record.assetType === 'ethereum') {
          aggregated.ethereum += record.amount || 0;
        } else if (record.assetType === 'solana') {
          aggregated.solana += record.amount || 0;
        }
      }

      this.logger.log(
        `📊 Агрегировано ${aggregatedFlows.size} групп записей для уведомлений`,
      );

      // Получаем пользователей для уведомлений
      const users = await this.getUsersForETFNotifications(appName);

      if (users.length === 0) {
        this.logger.warn('👥 Пользователей для уведомлений не найдено');
        this.logger.warn('   Проверьте настройки пользователей: settings.etfNotifications.enabled должно быть true');
        return;
      }

      this.logger.log(
        `👥 Найдено ${users.length} пользователей для уведомлений`,
      );
      
      // Логируем информацию о пользователях для отладки
      users.forEach((user, index) => {
        this.logger.log(
          `   Пользователь ${index + 1}: id=${user.id}, токен=${user.deviceToken?.substring(0, 30)}...`,
        );
      });

      let totalSent = 0;
      let totalFailed = 0;

      // Обрабатываем каждую агрегированную группу
      for (const [timeKey, aggregated] of aggregatedFlows.entries()) {
        // Пропускаем если нет значительных потоков (приток/отток)
        if (
          Math.abs(aggregated.bitcoin) < 0.1 &&
          Math.abs(aggregated.ethereum) < 0.1 &&
          Math.abs(aggregated.solana) < 0.1
        ) {
          this.logger.log(
            `⏭️ Пропускаем группу ${timeKey} - потоки слишком малы`,
          );
          continue;
        }

        this.logger.log(
          `📝 Обрабатываю агрегированную группу (обнаружено в ${aggregated.detectedAt.toISOString()}): Bitcoin: ${aggregated.bitcoin.toFixed(2)}M, Ethereum: ${aggregated.ethereum.toFixed(2)}M, Solana: ${aggregated.solana.toFixed(2)}M (${aggregated.recordIds.length} записей)`,
        );

        // Форматируем потоки с знаками + или -
        const formatFlowWithSign = (value: number): string => {
          const abs = Math.abs(value);
          const sign = value >= 0 ? '+' : '-';
          if (abs >= 1000) {
            const billions = abs / 1000;
            return `${sign}${billions.toFixed(2)}B`;
          }
          return `${sign}${abs.toFixed(2)}M`;
        };

        // Проверяем, все ли записи от одной компании
        const uniqueCompanies = new Set(aggregated.records.map(r => r.company));
        const isSingleCompany = uniqueCompanies.size === 1;

        let notificationBody: string;

        if (isSingleCompany) {
          // Если все записи от одной компании, используем формат: "CompanyName +amountM AssetType ETF"
          const company = aggregated.records[0].company;
          const companyName = this.getCompanyDisplayName(company);
          
          // Определяем, какой актив и сумма
          const assetFlows: { assetType: string; amount: number; assetName: string }[] = [];
          
          if (Math.abs(aggregated.bitcoin) >= 0.1) {
            assetFlows.push({
              assetType: 'bitcoin',
              amount: aggregated.bitcoin,
              assetName: 'Bitcoin',
            });
          }
          if (Math.abs(aggregated.ethereum) >= 0.1) {
            assetFlows.push({
              assetType: 'ethereum',
              amount: aggregated.ethereum,
              assetName: 'Ethereum',
            });
          }
          if (Math.abs(aggregated.solana) >= 0.1) {
            assetFlows.push({
              assetType: 'solana',
              amount: aggregated.solana,
              assetName: 'Solana',
            });
          }

          if (assetFlows.length === 0) {
            continue;
          }

          // Если один актив - формат: "CompanyName +amountM AssetType ETF"
          // Если несколько активов - объединяем: "CompanyName +amountM AssetType1 ETF, +amountM AssetType2 ETF"
          if (assetFlows.length === 1) {
            const flow = assetFlows[0];
            notificationBody = `${companyName} ${formatFlowWithSign(flow.amount)} ${flow.assetName} ETF`;
          } else {
            // Несколько активов от одной компании
            const flowParts = assetFlows.map(
              flow => `${formatFlowWithSign(flow.amount)} ${flow.assetName} ETF`,
            );
            notificationBody = `${companyName} ${flowParts.join(', ')}`;
          }
        } else {
          // Если несколько компаний, используем формат с суммированием по активам
          const parts: string[] = [];
          if (Math.abs(aggregated.bitcoin) >= 0.1) {
            parts.push(`Bitcoin: ${formatFlowWithSign(aggregated.bitcoin)}`);
          }
          if (Math.abs(aggregated.ethereum) >= 0.1) {
            parts.push(`Ethereum: ${formatFlowWithSign(aggregated.ethereum)}`);
          }
          if (Math.abs(aggregated.solana) >= 0.1) {
            parts.push(`Solana: ${formatFlowWithSign(aggregated.solana)}`);
          }

          if (parts.length === 0) {
            continue;
          }

          notificationBody = parts.join(', ');
        }

        // Отправляем уведомления каждому пользователю
        for (const user of users) {
          try {
            // Проверяем, не отправляли ли мы уже уведомление для этой группы этому пользователю
            // Используем первую запись из группы для проверки
            const firstRecordId = aggregated.recordIds[0];
            let existingDelivery = null;
            try {
              existingDelivery = await this.prisma.eTFNotificationDelivery.findUnique({
                where: {
                  userId_recordId: {
                    userId: user.id,
                    recordId: firstRecordId,
                  },
                },
              });
            } catch (error: any) {
              // Игнорируем ошибки, если таблица не существует
              if (error?.code !== 'P2021' && !error?.message?.includes('does not exist')) {
                this.logger.error('Ошибка проверки существующей доставки:', error);
              }
            }

            // Если доставка уже существует и отправлена, пропускаем
            if (existingDelivery?.sent) {
              this.logger.log(
                `⏭️ Уведомление для пользователя ${user.id} и группы ${timeKey} уже отправлено, пропускаем`,
              );
              continue;
            }

            this.logger.log(
              `📤 Отправляю уведомление пользователю ${user.id}, токен: ${user.deviceToken?.substring(0, 20)}...`,
            );
            this.logger.log(`   Текст: ${notificationBody}`);

            const sendResult = await this.firebaseAdminService.sendNotificationToToken(
              user.deviceToken,
              '📊 ETF Flow Update',
              notificationBody,
              {
                type: 'etf_update',
                bitcoinFlow: aggregated.bitcoin.toString(),
                ethereumFlow: aggregated.ethereum.toString(),
                solanaFlow: aggregated.solana.toString(),
                date: aggregated.date.toISOString(),
                detectedAt: aggregated.detectedAt.toISOString(),
              },
            );

            if (!sendResult) {
              this.logger.error(
                `❌ Не удалось отправить уведомление пользователю ${user.id}`,
              );
              totalFailed++;
              continue;
            }

            // Отмечаем все записи в группе как отправленные
            for (const recordId of aggregated.recordIds) {
              try {
                await this.prisma.eTFNotificationDelivery.upsert({
                  where: {
                    userId_recordId: {
                      userId: user.id,
                      recordId: recordId,
                    },
                  },
                  create: {
                    userId: user.id,
                    recordId: recordId,
                    sent: true,
                    sentAt: new Date(),
                    channel: 'push',
                  },
                  update: {
                    sent: true,
                    sentAt: new Date(),
                  },
                });
              } catch (error: any) {
                // Игнорируем ошибки, если таблица не существует
                if (error?.code !== 'P2021' && !error?.message?.includes('does not exist')) {
                  this.logger.error('Ошибка создания записи доставки:', error);
                }
              }
            }

            totalSent++;
            this.logger.log(
              `✅ Уведомление успешно отправлено пользователю ${user.id}`,
            );

            // Отправляем Telegram уведомление, если есть chatId
            if (user.telegramChatId) {
              try {
                await this.telegramBotService.sendTestMessage(
                  user.telegramChatId,
                  `📊 ETF Flow Update\n\n${notificationBody}`,
                );
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
