import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('sync-purchase')
  async syncPurchase(@Body() body: any): Promise<any> {
    this.logger.log('💳 === СИНХРОНИЗАЦИЯ ПОКУПКИ ===');
    this.logger.log('📅 Timestamp:', new Date().toISOString());
    this.logger.log('📦 Purchase Data:', JSON.stringify(body, null, 2));
    this.logger.log('💳 ======================================');

    try {
      // Извлекаем данные из запроса
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

      const result = await this.subscriptionService.updateUserSubscription(
        finalUserId,
        subscriptionData,
        deviceId,
      );

      this.logger.log('✅ Purchase synced successfully');
      return { success: true, subscription: result };
    } catch (error) {
      this.logger.error('❌ Error syncing purchase:', error);
      return { success: false, error: error.message };
    }
  }
}
