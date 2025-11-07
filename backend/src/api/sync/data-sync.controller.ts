import { Controller, Post, Get, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DataSyncService } from './data-sync.service';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class DataSyncController {
  constructor(private readonly dataSyncService: DataSyncService) {}

  /**
   * Ручной запуск синхронизации данных
   */
  @Post('trigger')
  async triggerSync() {
    return await this.dataSyncService.triggerManualSync();
  }

  /**
   * Получить статус синхронизации
   */
  @Get('status')
  async getSyncStatus() {
    const status = this.dataSyncService.getSyncStatus();
    return {
      ...status,
      cronSchedule: 'Каждые 5 минут',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Прервать текущую синхронизацию
   */
  @Delete('stop')
  async stopSync() {
    return await this.dataSyncService.stopSync();
  }
}



