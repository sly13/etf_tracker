import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../api/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Получение всех пользователей (только для администраторов)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  /**
   * Получение пользователя по ID (только для администраторов)
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return await this.usersService.getUserById(id);
  }

  /**
   * Обновление статуса пользователя (только для администраторов)
   */
  @Put('admin/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return await this.usersService.updateUserSettings(id, {
      // Обновляем только статус активности
      isActive: body.isActive,
    });
  }

  /**
   * Удаление пользователя (только для администраторов)
   */
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }

  /**
   * Получение статистики пользователей (только для администраторов)
   */
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats() {
    return await this.usersService.getUserStats();
  }

  // ==================== ПУБЛИЧНЫЕ РОУТЫ ====================

  /**
   * Получение пользователя по deviceId
   */
  @Get('by-device-id/:deviceId')
  async getUserByDeviceId(@Param('deviceId') deviceId: string) {
    return await this.usersService.getUserByDeviceId(deviceId);
  }

  /**
   * Обновление настроек пользователя
   */
  @Put(':userId/settings')
  async updateUserSettings(
    @Param('userId') userId: string,
    @Body() settings: any,
  ) {
    return await this.usersService.updateUserSettings(userId, settings);
  }
}
