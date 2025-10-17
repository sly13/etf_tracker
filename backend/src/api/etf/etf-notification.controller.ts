import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ETFNotificationService } from './etf-notification.service';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ETFNotificationSettings } from './etf-notification.service';

@Controller('etf/notifications')
@UseGuards(JwtAuthGuard)
export class ETFNotificationController {
  constructor(
    private readonly etfNotificationService: ETFNotificationService,
    private readonly etfFlowService: UniversalETFFlowService,
  ) {}

  /**
   * Получить настройки уведомлений пользователя
   */
  @Get('settings')
  async getUserSettings(@Query('userId') userId: string) {
    return await this.etfNotificationService.getUserNotificationSettings(
      userId,
    );
  }

  /**
   * Обновить настройки уведомлений пользователя
   */
  @Put('settings')
  async updateUserSettings(
    @Query('userId') userId: string,
    @Body() settings: Partial<ETFNotificationSettings>,
  ) {
    await this.etfNotificationService.updateUserNotificationSettings(
      userId,
      settings,
    );
    return { success: true, message: 'Настройки уведомлений обновлены' };
  }

  /**
   * Получить статистику уведомлений пользователя
   */
  @Get('stats')
  async getUserStats(@Query('userId') userId: string) {
    return await this.etfNotificationService.getUserNotificationStats(userId);
  }

  /**
   * Получить новые записи ETF (для админов)
   */
  @Get('new-records')
  async getNewRecords() {
    return await this.etfFlowService.getNewRecordsForNotifications();
  }

  /**
   * Отправить уведомления о новых записях (для админов)
   */
  @Post('send')
  async sendNotifications(@Query('appName') appName: string = 'etf.flow') {
    await this.etfNotificationService.sendETFNotificationsForNewRecords(
      appName,
    );
    return { success: true, message: 'Уведомления отправлены' };
  }
}
