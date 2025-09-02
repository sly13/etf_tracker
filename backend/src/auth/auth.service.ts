import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signInWithApple(appleData: {
    identityToken: string;
    authorizationCode: string;
    userIdentifier: string;
    givenName?: string;
    familyName?: string;
    email?: string;
  }) {
    try {
      // В реальном приложении здесь должна быть валидация токена Apple
      // Для демонстрации просто создаем или обновляем пользователя

      let user = await this.prisma.user.findUnique({
        where: { appleId: appleData.userIdentifier },
        include: {
          subscription: true,
          preferences: true,
        },
      });

      if (!user) {
        // Создаем нового пользователя
        user = await this.prisma.user.create({
          data: {
            appleId: appleData.userIdentifier,
            name:
              appleData.givenName && appleData.familyName
                ? `${appleData.givenName} ${appleData.familyName}`
                : appleData.givenName || appleData.familyName,
            email: appleData.email,
            lastLoginAt: new Date(),
            subscription: {
              create: {
                plan: 'free',
                autoRenew: false,
              },
            },
            preferences: {
              create: {
                notifications: true,
                theme: 'system',
                favoriteETFs: [],
              },
            },
          },
          include: {
            subscription: true,
            preferences: true,
          },
        });
      } else {
        // Обновляем время последнего входа
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
          include: {
            subscription: true,
            preferences: true,
          },
        });
      }

      // Генерируем JWT токен
      const token = this.generateToken(user.id);

      return {
        user: this.formatUserResponse(user),
        token,
      };
    } catch (error) {
      throw new UnauthorizedException('Ошибка аутентификации через Apple');
    }
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          subscription: true,
          preferences: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      return this.formatUserResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Недействительный токен');
    }
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      preferences?: {
        notifications?: boolean;
        theme?: string;
        favoriteETFs?: string[];
      };
    },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.preferences && {
          preferences: {
            update: {
              notifications: data.preferences.notifications,
              theme: data.preferences.theme,
              favoriteETFs: data.preferences.favoriteETFs,
            },
          },
        }),
      },
      include: {
        subscription: true,
        preferences: true,
      },
    });

    return this.formatUserResponse(user);
  }

  async updateSubscription(
    userId: string,
    data: {
      plan: string;
      expiresAt?: Date;
      autoRenew?: boolean;
    },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          upsert: {
            create: {
              plan: data.plan,
              expiresAt: data.expiresAt,
              autoRenew: data.autoRenew || false,
            },
            update: {
              plan: data.plan,
              expiresAt: data.expiresAt,
              autoRenew: data.autoRenew,
            },
          },
        },
      },
      include: {
        subscription: true,
        preferences: true,
      },
    });

    return this.formatUserResponse(user);
  }

  async registerDevice(userId: string, deviceToken: string, platform: string) {
    // В реальном приложении здесь можно сохранить токен устройства
    // для отправки push-уведомлений
    return { success: true };
  }

  private generateToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }

  private formatUserResponse(user: any) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      appleId: user.appleId,
      subscription: user.subscription
        ? {
            plan: user.subscription.plan,
            expiresAt: user.subscription.expiresAt,
            autoRenew: user.subscription.autoRenew,
          }
        : null,
      preferences: user.preferences
        ? {
            notifications: user.preferences.notifications,
            theme: user.preferences.theme,
            favoriteETFs: user.preferences.favoriteETFs,
          }
        : null,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
