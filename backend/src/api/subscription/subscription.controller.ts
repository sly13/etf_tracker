import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('status')
  async getSubscriptionStatus(@Body() body: any): Promise<any> {
    this.logger.log('📊 === ПОЛУЧЕНИЕ СТАТУСА ПОДПИСКИ ===');
    this.logger.log('📦 Request Data:', JSON.stringify(body, null, 2));

    const { deviceId, userId } = body;

    if (!deviceId && !userId) {
      return {
        success: false,
        error: 'DeviceId or UserId is required',
      };
    }

    try {
      let user;

      if (deviceId) {
        // Ищем пользователя по deviceId
        const cleanDeviceId = deviceId.replace(/^(ios_|android_|web_)/, '');
        user = await this.subscriptionService.findUserByDeviceId(cleanDeviceId);
      } else if (userId) {
        // Ищем пользователя по userId
        user = await this.subscriptionService.findUserByDeviceId(userId);
      }

      if (!user) {
        this.logger.log('❌ Пользователь не найден');
        return {
          success: false,
          error: 'User not found',
          subscription: null,
        };
      }

      // Получаем статус подписки
      const subscriptionStatus =
        await this.subscriptionService.getUserSubscriptionStatus(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          deviceId: user.deviceId,
          os: user.os,
        },
        subscription: subscriptionStatus,
      };
    } catch (error) {
      this.logger.error('❌ Ошибка получения статуса подписки:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('check-or-create-user')
  async checkOrCreateUser(@Body() body: any): Promise<any> {
    this.logger.log('👤 === ПРОВЕРКА/СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ ===');
    this.logger.log('📦 Request Data:', JSON.stringify(body, null, 2));

    const { deviceId } = body;

    if (!deviceId) {
      return {
        success: false,
        error: 'DeviceId is required',
      };
    }

    try {
      // Проверяем, существует ли пользователь
      const cleanDeviceId = deviceId.replace(/^(ios_|android_|web_)/, '');

      let user =
        await this.subscriptionService.findUserByDeviceId(cleanDeviceId);

      if (!user) {
        this.logger.log(
          `🔧 Пользователь не найден, создаем нового для deviceId: ${cleanDeviceId}`,
        );

        // Создаем пользователя
        user = await this.subscriptionService.createUserForDevice(deviceId);

        return {
          success: true,
          user: user,
          created: true,
          message: 'Пользователь создан успешно',
        };
      } else {
        this.logger.log(`✅ Пользователь найден: ${user.id}`);

        return {
          success: true,
          user: user,
          created: false,
          message: 'Пользователь уже существует',
        };
      }
    } catch (error) {
      this.logger.error('❌ Ошибка проверки/создания пользователя:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('sync-purchase')
  async syncPurchase(@Body() body: any): Promise<any> {
    this.logger.log('💳 === СИНХРОНИЗАЦИЯ ПОКУПКИ ===');
    this.logger.log('📅 Timestamp:', new Date().toISOString());
    this.logger.log('📦 Purchase Data:', JSON.stringify(body, null, 2));
    this.logger.log('💳 ======================================');

    // Извлекаем данные из запроса (выносим из try блока)
    const {
      userId,
      deviceId,
      customerInfo,
      productId,
      transactionId,
      originalTransactionId,
      purchaseDate,
      expirationDate,
      isActive,
      isPremium,
      autoRenew,
      environment,
      platform,
      price,
      currency,
    } = body;

    // Если userId не указан, используем RevenueCat ID или создаем тестового пользователя
    const finalUserId =
      userId || customerInfo?.originalAppUserId || 'test_user_' + Date.now();

    try {
      this.logger.log(`🔍 Final User ID: ${finalUserId}`);
      this.logger.log(`🔍 Device ID: ${deviceId}`);
      this.logger.log(`🔍 Device ID type: ${typeof deviceId}`);
      this.logger.log(
        `🔍 Device ID length: ${deviceId?.length || 'undefined'}`,
      );
      this.logger.log(`🔍 Final User ID type: ${typeof finalUserId}`);

      // Подготавливаем данные для сохранения
      const subscriptionData = {
        revenueCatUserId: customerInfo?.originalAppUserId,
        originalTransactionId: originalTransactionId || transactionId,
        productId: productId,
        isActive: isActive || false,
        isPremium: isPremium || false,
        autoRenew: autoRenew || false,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        originalPurchaseDate: purchaseDate
          ? new Date(purchaseDate)
          : new Date(),
        environment: environment || 'Production',
        platform: platform || 'ios',
        price: price || null,
        currency: currency || null,
      };

      this.logger.log(
        '📦 Processed Subscription Data:',
        JSON.stringify(subscriptionData, null, 2),
      );

      // Сохраняем данные о подписке
      this.logger.log(`🔍 Calling service with finalUserId: ${finalUserId}`);
      this.logger.log(`🔍 finalUserId type: ${typeof finalUserId}`);
      this.logger.log(`💳 Привязываем покупку к пользователю: ${finalUserId}`);
      this.logger.log(`📦 Продукт: ${productId}, Цена: ${price} ${currency}`);
      this.logger.log(`📱 Device ID: ${deviceId}`);

      // Проверяем, что deviceId предоставлен
      if (!deviceId) {
        this.logger.warn('⚠️ Device ID не предоставлен в запросе');
        this.logger.warn(
          '⚠️ Это может привести к проблемам с поиском пользователя',
        );
      } else {
        // Сначала проверяем/создаем пользователя
        this.logger.log(
          '🔍 Проверяем существование пользователя перед синхронизацией покупки',
        );

        try {
          const cleanDeviceId = deviceId.replace(/^(ios_|android_|web_)/, '');
          let user =
            await this.subscriptionService.findUserByDeviceId(cleanDeviceId);

          if (!user) {
            this.logger.log('🔧 Пользователь не найден, создаем автоматически');
            user = await this.subscriptionService.createUserForDevice(deviceId);
            this.logger.log(`✅ Пользователь создан: ${user.id}`);
          } else {
            this.logger.log(`✅ Пользователь найден: ${user.id}`);
          }
        } catch (userError) {
          this.logger.error(
            '❌ Ошибка при проверке/создании пользователя:',
            userError,
          );
          // Продолжаем выполнение, так как updateUserSubscription тоже может создать пользователя
        }
      }

      const result = await this.subscriptionService.updateUserSubscription(
        finalUserId,
        subscriptionData,
        deviceId,
      );

      this.logger.log('✅ Purchase synced successfully');
      return { success: true, subscription: result };
    } catch (error) {
      this.logger.error('❌ Error syncing purchase:', error);

      // Более детальная обработка ошибок
      if (error.message.includes('не найден')) {
        this.logger.error(
          '💡 Рекомендация: Убедитесь, что устройство зарегистрировано через NotificationService',
        );
        this.logger.error(
          '💡 Проверьте, что приложение вызывает registerDevice() при запуске',
        );
      }

      return {
        success: false,
        error: error.message,
        details: {
          deviceId: deviceId,
          userId: finalUserId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}
