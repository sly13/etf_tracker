import { Controller, Post, Get, UseGuards } from '@nestjs/common';
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
    return {
      message: 'Сервис синхронизации активен',
      cronSchedule: 'Каждые 5 минут',
      lastSync: new Date().toISOString(),
    };
  }
}



