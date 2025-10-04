import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FlowMonitoringService } from '../flow-monitoring/flow-monitoring.service';

@Controller('api/bot')
export class BotController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly flowMonitoringService: FlowMonitoringService,
  ) {}

  @Get('flow/:asset')
  async getLatestFlowData(
    @Param('asset') asset: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;

    let flows = [];
    if (asset === 'btc') {
      flows = await this.databaseService.getLatestBTCFlow(limitNum);
    } else if (asset === 'eth') {
      flows = await this.databaseService.getLatestETHFlow(limitNum);
    } else {
      return {
        success: false,
        message: 'Неверный asset. Используйте btc или eth',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      message: `Последние ${asset.toUpperCase()} Flow данные получены`,
      data: flows,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('monitoring/status')
  async getMonitoringStatus() {
    const status = this.flowMonitoringService.getStatus();

    // Принудительная сериализация через JSON
    const serializedStatus = JSON.parse(JSON.stringify(status));

    return {
      success: true,
      message: 'Статус мониторинга получен',
      data: serializedStatus,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('monitoring/stats')
  async getMonitoringStats() {
    const stats = this.flowMonitoringService.getStats();
    return {
      success: true,
      message: 'Статистика мониторинга получена',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('monitoring/start')
  async startMonitoring() {
    await this.flowMonitoringService.start();
    const status = this.flowMonitoringService.getStatus();

    // Преобразуем даты в строки для корректной сериализации
    const serializedStatus = {
      ...status,
      lastCheckTime: {
        btc: status.lastCheckTime.btc
          ? status.lastCheckTime.btc instanceof Date
            ? status.lastCheckTime.btc.toISOString()
            : status.lastCheckTime.btc
          : null,
        eth: status.lastCheckTime.eth
          ? status.lastCheckTime.eth instanceof Date
            ? status.lastCheckTime.eth.toISOString()
            : status.lastCheckTime.eth
          : null,
      },
    };

    return {
      success: true,
      message: 'Мониторинг Flow данных запущен',
      data: serializedStatus,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('monitoring/stop')
  async stopMonitoring() {
    await this.flowMonitoringService.stop();
    const status = this.flowMonitoringService.getStatus();

    return {
      success: true,
      message: 'Мониторинг Flow данных остановлен',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('monitoring/reset-stats')
  async resetStats() {
    this.flowMonitoringService.resetStats();
    const stats = this.flowMonitoringService.getStats();

    return {
      success: true,
      message: 'Статистика сброшена',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('positions')
  async getTradingPositions(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;

    let positions = [];
    if (status === 'open') {
      positions = await this.databaseService.getOpenPositions();
    } else {
      positions = await this.databaseService.getAllPositions(limitNum);
    }

    return {
      success: true,
      message: 'Торговые позиции получены',
      data: positions,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  async getTradingStats() {
    const stats = await this.databaseService.getTradingStats();

    return {
      success: true,
      message: 'Статистика торговли получена',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }
}
