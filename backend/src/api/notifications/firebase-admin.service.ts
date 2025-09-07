import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: admin.app.App | null = null;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Проверяем, не инициализирован ли уже Firebase
      if (admin.apps.length === 0) {
        // Путь к сервисному ключу из переменной окружения или по умолчанию
        let serviceAccountPath =
          process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
          path.join(process.cwd(), 'etf-flow-firebase.json');

        // Проверяем существование файла
        if (!fs.existsSync(serviceAccountPath)) {
          this.logger.warn(
            `⚠️ Файл Firebase не найден по пути: ${serviceAccountPath}`,
          );
          // Пробуем альтернативный путь
          const altPath = path.join(process.cwd(), 'etf-flow-firebase.json');
          if (fs.existsSync(altPath)) {
            this.logger.log(`✅ Используем альтернативный путь: ${altPath}`);
            serviceAccountPath = altPath;
          } else {
            throw new Error(
              `Firebase конфигурация не найдена. Проверьте файл etf-flow-firebase.json`,
            );
          }
        }

        this.logger.log(`🔍 Ищем файл Firebase по пути: ${serviceAccountPath}`);

        // Инициализируем Firebase Admin SDK
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
          projectId: 'etf-flow',
        });

        this.logger.log('✅ Firebase Admin SDK инициализирован');
      } else {
        this.app = admin.app();
        this.logger.log('✅ Firebase Admin SDK уже инициализирован');
      }
    } catch (error) {
      this.logger.error('❌ Ошибка инициализации Firebase Admin SDK:', error);
    }
  }

  /**
   * Отправка уведомления на конкретный токен
   */
  async sendNotificationToToken(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.app) {
      this.logger.error('❌ Firebase Admin SDK не инициализирован');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title,
          body,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_launcher',
            color: '#000000',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              badge: 1,
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`✅ Уведомление отправлено: ${response}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка отправки уведомления:', error);
      return false;
    }
  }

  /**
   * Отправка уведомления на топик
   */
  async sendNotificationToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.app) {
      this.logger.error('❌ Firebase Admin SDK не инициализирован');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_launcher',
            color: '#000000',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              badge: 1,
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(
        `✅ Уведомление отправлено на топик ${topic}: ${response}`,
      );
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка отправки уведомления на топик:', error);
      return false;
    }
  }

  /**
   * Отправка уведомления нескольким токенам
   */
  async sendNotificationToMultipleTokens(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.app) {
      this.logger.error('❌ Firebase Admin SDK не инициализирован');
      return { successCount: 0, failureCount: tokens.length };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_launcher',
            color: '#000000',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              badge: 1,
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().sendMulticast(message);

      this.logger.log(
        `✅ Уведомления отправлены: ${response.successCount} успешно, ${response.failureCount} неудачно`,
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error('❌ Ошибка отправки уведомлений:', error);
      return { successCount: 0, failureCount: tokens.length };
    }
  }

  /**
   * Отправка уведомления (универсальный метод)
   */
  async sendNotification(
    token: string,
    notification: {
      title: string;
      body: string;
      data?: Record<string, string>;
    },
  ): Promise<boolean> {
    return this.sendNotificationToToken(
      token,
      notification.title,
      notification.body,
      notification.data,
    );
  }

  /**
   * Проверка валидности токена
   */
  async validateToken(token: string): Promise<boolean> {
    if (!this.app) {
      return false;
    }

    // Для тестовых токенов в режиме разработки
    if (process.env.NODE_ENV === 'development' && token.startsWith('test_')) {
      this.logger.log(`🧪 Тестовый токен принят: ${token}`);
      return true;
    }

    try {
      // Попробуем отправить тестовое сообщение
      const message: admin.messaging.Message = {
        token,
        data: { test: 'true' },
      };

      await admin.messaging().send(message);
      return true;
    } catch (error) {
      this.logger.warn(`⚠️ Токен невалиден: ${token}`, error.message);
      return false;
    }
  }
}
