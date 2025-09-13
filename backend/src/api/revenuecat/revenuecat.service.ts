import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RevenueCatService {
  private readonly logger = new Logger(RevenueCatService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.revenuecat.com/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey =
      this.configService.get<string>('REVENUECAT_IOS_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('⚠️ RevenueCat API ключ не настроен');
    }
  }

  /**
   * Получение информации о пользователе из RevenueCat
   */
  async getUserInfo(appUserId: string): Promise<any> {
    try {
      this.logger.log(
        `🔍 Получение информации о пользователе из RevenueCat: ${appUserId}`,
      );

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/subscribers/${appUserId}`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log('✅ Данные пользователя получены из RevenueCat');
      return response.data;
    } catch (error) {
      this.logger.error(
        `❌ Ошибка получения данных пользователя из RevenueCat: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Получение активных подписок пользователя
   */
  async getActiveSubscriptions(appUserId: string): Promise<any[]> {
    try {
      const userInfo = await this.getUserInfo(appUserId);

      if (!userInfo.subscriber) {
        this.logger.log('❌ Пользователь не найден в RevenueCat');
        return [];
      }

      const activeSubscriptions = [];
      const entitlements = userInfo.subscriber.entitlements || {};

      // Проверяем все entitlements
      for (const [key, entitlement] of Object.entries(entitlements)) {
        const ent = entitlement as any;
        if (ent.expires_date && new Date(ent.expires_date) > new Date()) {
          activeSubscriptions.push({
            productId: ent.product_identifier,
            entitlementId: key,
            isActive: true,
            isPremium: key === 'premium',
            autoRenew: ent.will_renew,
            purchaseDate: ent.purchase_date,
            expirationDate: ent.expires_date,
            originalPurchaseDate: ent.original_purchase_date,
            environment: userInfo.subscriber.original_app_user_id?.includes(
              '$RCAnonymousID',
            )
              ? 'Sandbox'
              : 'Production',
            platform: 'ios', // или определять по другим признакам
          });
        }
      }

      this.logger.log(
        `✅ Найдено активных подписок: ${activeSubscriptions.length}`,
      );
      return activeSubscriptions;
    } catch (error) {
      this.logger.error(
        `❌ Ошибка получения активных подписок: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Проверка статуса премиум подписки
   */
  async isPremiumUser(appUserId: string): Promise<boolean> {
    try {
      const activeSubscriptions = await this.getActiveSubscriptions(appUserId);

      // Проверяем, есть ли активная премиум подписка
      const hasPremium = activeSubscriptions.some(
        (sub) => sub.isPremium && sub.isActive,
      );

      this.logger.log(`🔍 Пользователь ${appUserId} премиум: ${hasPremium}`);
      return hasPremium;
    } catch (error) {
      this.logger.error(`❌ Ошибка проверки премиум статуса: ${error.message}`);
      return false;
    }
  }

  /**
   * Синхронизация данных пользователя с RevenueCat
   */
  async syncUserWithRevenueCat(
    deviceId: string,
    appUserId?: string,
  ): Promise<any> {
    try {
      this.logger.log(`🔄 Синхронизация пользователя ${deviceId} с RevenueCat`);

      // Если appUserId не передан, используем deviceId
      const userId = appUserId || deviceId;

      const activeSubscriptions = await this.getActiveSubscriptions(userId);
      const isPremium = await this.isPremiumUser(userId);

      this.logger.log(`📊 Результат синхронизации:`);
      this.logger.log(`   - Активных подписок: ${activeSubscriptions.length}`);
      this.logger.log(`   - Премиум статус: ${isPremium}`);

      return {
        appUserId: userId,
        activeSubscriptions,
        isPremium,
        lastSyncDate: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `❌ Ошибка синхронизации с RevenueCat: ${error.message}`,
      );
      throw error;
    }
  }
}
