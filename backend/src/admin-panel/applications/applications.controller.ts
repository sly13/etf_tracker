import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../../api/auth/jwt-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // ==================== АДМИНСКИЕ РОУТЫ ====================

  /**
   * Создание нового приложения (только для администраторов)
   */
  @Post('admin/create')
  @UseGuards(JwtAuthGuard)
  async createApplication(@Body() createApplicationDto: CreateApplicationDto) {
    return await this.applicationsService.createApplication(
      createApplicationDto,
    );
  }

  /**
   * Обновление приложения (только для администраторов)
   */
  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  async updateApplication(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return await this.applicationsService.updateApplication(
      id,
      updateApplicationDto,
    );
  }

  /**
   * Удаление приложения (только для администраторов)
   */
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  async deleteApplication(@Param('id') id: string) {
    return await this.applicationsService.deleteApplication(id);
  }

  /**
   * Получение всех приложений (только для администраторов)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async getAllApplications() {
    return await this.applicationsService.getAllApplications();
  }

  /**
   * Получение приложения по ID (только для администраторов)
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  async getApplicationById(@Param('id') id: string) {
    return await this.applicationsService.getApplicationById(id);
  }

  // ==================== ПУБЛИЧНЫЕ РОУТЫ ====================

  /**
   * Получение всех приложений (публичный доступ)
   */
  @Get()
  async getApplications() {
    return await this.applicationsService.getAllApplications();
  }

  /**
   * Получение приложения по имени (публичный доступ)
   */
  @Get(':appName')
  async getApplication(@Param('appName') appName: string) {
    return await this.applicationsService.getApplicationById(appName);
  }

  /**
   * Получение пользователей приложения
   */
  @Get(':appName/users')
  async getApplicationUsers(@Param('appName') appName: string) {
    return await this.applicationsService.getApplicationUsers(appName);
  }

  /**
   * Получение пользователя по deviceToken
   */
  @Get('user-by-token/:deviceToken')
  async getUserByToken(@Param('deviceToken') deviceToken: string) {
    // Используем notification service для поиска пользователя
    return {
      success: false,
      message: 'Метод не реализован. Используйте notification service.',
    };
  }

  /**
   * Обновление настроек пользователя
   */
  @Put(':appName/user/:userId/settings')
  async updateUserSettings(
    @Param('appName') appName: string,
    @Param('userId') userId: string,
    @Body() settings: any,
  ) {
    return await this.applicationsService.updateUserSettings(
      appName,
      userId,
      settings,
    );
  }

  /**
   * Отправка тестового уведомления
   */
  @Post(':appName/test-notification')
  async sendTestNotification(
    @Param('appName') appName: string,
    @Body() body: { userId?: string },
  ) {
    return await this.applicationsService.sendTestNotification(
      appName,
      body.userId,
    );
  }

  /**
   * Получение статистики приложения
   */
  @Get(':appName/stats')
  async getApplicationStats(@Param('appName') appName: string) {
    return await this.applicationsService.getApplicationStats(appName);
  }
}
