import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('apple')
  async signInWithApple(
    @Body()
    appleData: {
      identityToken: string;
      authorizationCode: string;
      userIdentifier: string;
      givenName?: string;
      familyName?: string;
      email?: string;
    },
  ) {
    try {
      const result = await this.authService.signInWithApple(appleData);
      return {
        success: true,
        user: result.user,
        token: result.token,
      };
    } catch (error) {
      throw new UnauthorizedException('Ошибка аутентификации');
    }
  }

  @Get('validate')
  async validateToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Токен не предоставлен');
    }

    const token = authHeader.substring(7);
    try {
      const user = await this.authService.validateToken(token);
      return {
        success: true,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Недействительный токен');
    }
  }

  @Put('profile')
  async updateProfile(
    @Headers('authorization') authHeader: string,
    @Body()
    data: {
      userId: string;
      name?: string;
      preferences?: {
        notifications?: boolean;
        theme?: string;
        favoriteETFs?: string[];
      };
    },
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Токен не предоставлен');
    }

    const token = authHeader.substring(7);
    try {
      // Валидируем токен и проверяем, что пользователь обновляет свой профиль
      const user = await this.authService.validateToken(token);
      if (user.id !== data.userId) {
        throw new UnauthorizedException(
          'Нет прав для обновления этого профиля',
        );
      }

      const updatedUser = await this.authService.updateProfile(data.userId, {
        name: data.name,
        preferences: data.preferences,
      });

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      throw new UnauthorizedException('Ошибка обновления профиля');
    }
  }

  @Put('subscription')
  async updateSubscription(
    @Headers('authorization') authHeader: string,
    @Body()
    data: {
      userId: string;
      subscription: {
        plan: string;
        expiresAt?: string;
        autoRenew?: boolean;
      };
    },
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Токен не предоставлен');
    }

    const token = authHeader.substring(7);
    try {
      // Валидируем токен и проверяем, что пользователь обновляет свою подписку
      const user = await this.authService.validateToken(token);
      if (user.id !== data.userId) {
        throw new UnauthorizedException(
          'Нет прав для обновления этой подписки',
        );
      }

      const updatedUser = await this.authService.updateSubscription(
        data.userId,
        {
          plan: data.subscription.plan,
          expiresAt: data.subscription.expiresAt
            ? new Date(data.subscription.expiresAt)
            : undefined,
          autoRenew: data.subscription.autoRenew,
        },
      );

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      throw new UnauthorizedException('Ошибка обновления подписки');
    }
  }

  @Post('device')
  async registerDevice(
    @Headers('authorization') authHeader: string,
    @Body()
    data: {
      userId: string;
      deviceToken: string;
      platform: string;
    },
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Токен не предоставлен');
    }

    const token = authHeader.substring(7);
    try {
      // Валидируем токен и проверяем, что пользователь регистрирует свое устройство
      const user = await this.authService.validateToken(token);
      if (user.id !== data.userId) {
        throw new UnauthorizedException('Нет прав для регистрации устройства');
      }

      const result = await this.authService.registerDevice(
        data.userId,
        data.deviceToken,
        data.platform,
      );

      return {
        ...result,
        success: true,
      };
    } catch (error) {
      throw new UnauthorizedException('Ошибка регистрации устройства');
    }
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    // В реальном приложении здесь можно добавить токен в черный список
    // Для демонстрации просто возвращаем успех
    return {
      success: true,
      message: 'Успешный выход из системы',
    };
  }
}
