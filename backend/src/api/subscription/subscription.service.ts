import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Обновление статуса подписки пользователя
   */
  async updateUserSubscription(
    userId: string,
    subscriptionData: {
      revenueCatUserId?: string;
      originalTransactionId?: string;
      productId?: string;
      isActive?: boolean;
      isPremium?: boolean;
      autoRenew?: boolean;
      purchaseDate?: Date;
      expirationDate?: Date;
      originalPurchaseDate?: Date;
      environment?: string;
      platform?: string;
      price?: number;
      currency?: string;
    },
    deviceId?: string,
  ): Promise<any> {
    this.logger.log('💳 === ОБНОВЛЕНИЕ ПОДПИСКИ ПОЛЬЗОВАТЕЛЯ ===');
    this.logger.log(`👤 User ID: ${userId}`);
    this.logger.log(`👤 User ID type: ${typeof userId}`);
    this.logger.log(
      '📦 Subscription Data:',
      JSON.stringify(subscriptionData, null, 2),
    );

    // Проверяем, что userId не undefined
    if (!userId) {
      this.logger.error('❌ User ID is undefined or empty');
      throw new Error('User ID is required');
    }

    try {
      // Ищем пользователя по deviceId
      let user;

      if (deviceId) {
        this.logger.log(`🔍 Ищем пользователя по deviceId: ${deviceId}`);
        this.logger.log(`🔍 DeviceId type: ${typeof deviceId}`);
        this.logger.log(`🔍 DeviceId length: ${deviceId.length}`);

        // Извлекаем уникальную часть deviceId (убираем префикс ios_/android_)
        const cleanDeviceId = deviceId.replace(/^(ios_|android_|web_)/, '');
        this.logger.log(`🔍 Clean deviceId: ${cleanDeviceId}`);

        // Ищем по deviceId
        user = await this.prismaService.user.findFirst({
          where: { deviceId: cleanDeviceId },
        });

        if (user) {
          this.logger.log(`✅ Найден пользователь по deviceId: ${user.id}`);
          this.logger.log(
            `🔍 deviceId: ${user.deviceId}, deviceToken: ${user.deviceToken}`,
          );
        } else {
          this.logger.log(
            `❌ Пользователь не найден по deviceId: ${cleanDeviceId}`,
          );
        }
      }

      // Если не найден по deviceId, ищем по RevenueCat userId как deviceId
      if (!user) {
        this.logger.log(
          `🔍 Пользователь не найден по deviceId, ищем по RevenueCat userId как deviceId: ${userId}`,
        );
        user = await this.prismaService.user.findFirst({
          where: { deviceId: userId },
        });
      }

      // Если все еще не найден, попробуем найти по части deviceId (для случаев когда deviceId содержит timestamp)
      if (!user && deviceId) {
        this.logger.log(
          `🔍 Пользователь не найден, пробуем найти по части deviceId без timestamp`,
        );

        // Убираем timestamp из deviceId (последние 13 цифр)
        const cleanDeviceIdForSearch = deviceId.replace(
          /^(ios_|android_|web_)/,
          '',
        );
        const deviceIdWithoutTimestamp = cleanDeviceIdForSearch.replace(
          /_\d{13}$/,
          '',
        );
        this.logger.log(
          `🔍 DeviceId без timestamp: ${deviceIdWithoutTimestamp}`,
        );

        user = await this.prismaService.user.findFirst({
          where: {
            deviceId: {
              startsWith: deviceIdWithoutTimestamp,
            },
          },
        });
      }

      if (user) {
        this.logger.log(`✅ Пользователь найден: ${user.id}`);
        this.logger.log(
          `🔍 deviceId: ${user.deviceId}, deviceToken: ${user.deviceToken}`,
        );
      } else {
        this.logger.log(
          `🔍 Пользователь не найден ни по deviceToken, ни по deviceId`,
        );
      }

      if (!user) {
        this.logger.warn(`⚠️ Пользователь не найден! DeviceId: ${deviceId}`);
        this.logger.warn(
          `⚠️ Пользователь должен быть зарегистрирован через NotificationService.registerDevice()`,
        );
        this.logger.warn(
          `⚠️ Проверьте, что приложение зарегистрировало устройство перед покупкой`,
        );

        // Попробуем создать пользователя автоматически, если deviceId предоставлен
        if (deviceId) {
          this.logger.log(
            `🔧 Попытка автоматического создания пользователя для deviceId: ${deviceId}`,
          );

          try {
            const cleanDeviceId = deviceId.replace(/^(ios_|android_|web_)/, '');

            // Создаем пользователя с минимальными данными
            user = await this.prismaService.user.create({
              data: {
                deviceId: cleanDeviceId,
                deviceToken: `temp_token_${Date.now()}`, // Временный токен
                os: deviceId.startsWith('ios_')
                  ? 'ios'
                  : deviceId.startsWith('android_')
                    ? 'android'
                    : 'unknown',
                isActive: true,
                lastUsed: new Date(),
                settings: {
                  notifications: {
                    enableETFUpdates: true,
                    enableSignificantFlow: true,
                    enableTestNotifications: false,
                    enableTelegramNotifications: false,
                    enableFlowAmount: false,
                    minFlowThreshold: 0.1,
                    significantChangePercent: 20.0,
                    flowAmountThreshold: 10.0,
                  },
                  preferences: {
                    language: 'ru',
                    timezone: 'UTC',
                    deviceType: deviceId.startsWith('ios_')
                      ? 'ios'
                      : deviceId.startsWith('android_')
                        ? 'android'
                        : 'unknown',
                  },
                  profile: {},
                },
                application: {
                  connectOrCreate: {
                    where: { name: 'etf.flow' },
                    create: {
                      name: 'etf.flow',
                      displayName: 'ETF Flow Tracker',
                      description: 'Приложение для отслеживания потоков ETF',
                    },
                  },
                },
              },
            });

            this.logger.log(`✅ Пользователь автоматически создан: ${user.id}`);
          } catch (createError) {
            this.logger.error(
              `❌ Ошибка создания пользователя: ${createError}`,
            );
            throw new Error(
              `Пользователь с deviceId ${deviceId} не найден и не может быть создан. Устройство должно быть зарегистрировано перед покупкой.`,
            );
          }
        } else {
          throw new Error(
            `Пользователь с deviceId ${deviceId} не найден. Устройство должно быть зарегистрировано перед покупкой.`,
          );
        }
      }

      // Ищем существующую подписку по ID найденного пользователя
      const existingSubscription = await (
        this.prismaService as any
      ).subscription.findFirst({
        where: {
          userId: user.id, // Используем ID найденного пользователя, а не RevenueCat userId
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (existingSubscription) {
        // Обновляем существующую подписку
        const updatedSubscription = await (
          this.prismaService as any
        ).subscription.update({
          where: { id: existingSubscription.id },
          data: {
            ...subscriptionData,
            updatedAt: new Date(),
          },
        });

        this.logger.log(
          '✅ Подписка обновлена:',
          JSON.stringify(updatedSubscription, null, 2),
        );
        return updatedSubscription;
      } else {
        // Создаем новую подписку
        this.logger.log(`🔍 Creating new subscription for user.id: ${user.id}`);
        this.logger.log(`🔍 user.id type: ${typeof user.id}`);

        const createData = {
          userId: user.id, // Используем ID найденного пользователя
          ...subscriptionData,
        };

        this.logger.log(`🔍 Create data:`, JSON.stringify(createData, null, 2));

        const newSubscription = await (
          this.prismaService as any
        ).subscription.create({
          data: createData,
        });

        this.logger.log(
          '✅ Новая подписка создана:',
          JSON.stringify(newSubscription, null, 2),
        );
        return newSubscription;
      }
    } catch (error) {
      this.logger.error('❌ Ошибка обновления подписки:', error);
      throw error;
    }
  }

  /**
   * Получение статуса подписки пользователя
   */
  async getUserSubscriptionStatus(userId: string): Promise<any> {
    this.logger.log('🔍 === ПОЛУЧЕНИЕ СТАТУСА ПОДПИСКИ ===');
    this.logger.log(`👤 User ID: ${userId}`);

    try {
      const subscription = await (
        this.prismaService as any
      ).subscription.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              deviceId: true,
              telegramChatId: true,
              os: true,
            },
          },
        },
      });

      if (subscription) {
        this.logger.log(
          '✅ Подписка найдена:',
          JSON.stringify(subscription, null, 2),
        );

        // Проверяем, активна ли подписка
        const isCurrentlyActive =
          subscription.isActive &&
          (!subscription.expirationDate ||
            subscription.expirationDate > new Date());

        this.logger.log(`🔍 Подписка активна: ${isCurrentlyActive}`);
        this.logger.log(`📅 Дата истечения: ${subscription.expirationDate}`);
        this.logger.log(`🔄 Автопродление: ${subscription.autoRenew}`);

        return {
          ...subscription,
          isCurrentlyActive,
        };
      } else {
        this.logger.log('❌ Подписка не найдена');
        return null;
      }
    } catch (error) {
      this.logger.error('❌ Ошибка получения статуса подписки:', error);
      throw error;
    }
  }

  /**
   * Поиск пользователя по deviceId
   */
  async findUserByDeviceId(deviceId: string): Promise<any> {
    this.logger.log(`🔍 Поиск пользователя по deviceId: ${deviceId}`);

    try {
      // Ищем пользователя по deviceId
      const user = await this.prismaService.user.findFirst({
        where: { deviceId: deviceId },
      });

      if (user) {
        this.logger.log(`✅ Пользователь найден: ${user.id}`);
        return user;
      } else {
        this.logger.log(`❌ Пользователь не найден по deviceId: ${deviceId}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`❌ Ошибка поиска пользователя: ${error}`);
      return null;
    }
  }

  /**
   * Создание пользователя для устройства
   */
  async createUserForDevice(deviceId: string): Promise<any> {
    this.logger.log(`🔧 Создание пользователя для deviceId: ${deviceId}`);

    try {
      const cleanDeviceId = deviceId.replace(/^(ios_|android_|web_)/, '');

      const user = await this.prismaService.user.create({
        data: {
          deviceId: cleanDeviceId,
          deviceToken: `temp_token_${Date.now()}`,
          os: deviceId.startsWith('ios_')
            ? 'ios'
            : deviceId.startsWith('android_')
              ? 'android'
              : 'unknown',
          isActive: true,
          lastUsed: new Date(),
          settings: {
            notifications: {
              enableETFUpdates: true,
              enableSignificantFlow: true,
              enableTestNotifications: false,
              enableTelegramNotifications: false,
              enableFlowAmount: false,
              minFlowThreshold: 0.1,
              significantChangePercent: 20.0,
              flowAmountThreshold: 10.0,
            },
            preferences: {
              language: 'ru',
              timezone: 'UTC',
              deviceType: deviceId.startsWith('ios_')
                ? 'ios'
                : deviceId.startsWith('android_')
                  ? 'android'
                  : 'unknown',
            },
            profile: {},
          },
          application: {
            connectOrCreate: {
              where: { name: 'etf.flow' },
              create: {
                name: 'etf.flow',
                displayName: 'ETF Flow Tracker',
                description: 'Приложение для отслеживания потоков ETF',
              },
            },
          },
        },
      });

      this.logger.log(`✅ Пользователь создан: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`❌ Ошибка создания пользователя: ${error}`);
      throw error;
    }
  }

  /**
   * Логирование данных от RevenueCat (для отладки)
   */
  logRevenueCatData(data: any): void {
    this.logger.log('💳 === REVENUECAT DATA RECEIVED ===');
    this.logger.log('📅 Timestamp:', new Date().toISOString());
    this.logger.log('📦 Full Data:', JSON.stringify(data, null, 2));
    this.logger.log('💳 ================================');

    // Анализируем структуру данных
    if (data) {
      this.logger.log('🔍 === DATA ANALYSIS ===');
      Object.keys(data).forEach((key) => {
        this.logger.log(`📝 ${key}:`, JSON.stringify(data[key], null, 2));
      });
      this.logger.log('🔍 ====================');
    }
  }
}
