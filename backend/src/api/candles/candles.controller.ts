import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CandlesService } from './candles.service';

@Controller('bot/candles')
export class CandlesController {
  constructor(private readonly candlesService: CandlesService) {}

  @Get('test')
  test() {
    return {
      success: true,
      message: 'Candles controller is working',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('debug')
  async debug() {
    try {
      // Тестируем получение 5-минутных данных
      const candles5m = await this.candlesService.getBTCCandles(50, '5m', 0);
      
      // Тестируем агрегацию
      const candles1h = await this.candlesService.getBTCCandles(3, '1h', 0);
      
      return {
        success: true,
        message: 'Debug info',
        data: {
          '5m_count': candles5m.length,
          '1h_count': candles1h.length,
          '5m_sample': candles5m.slice(0, 3),
          '1h_sample': candles1h.slice(0, 3),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('btc')
  async getBTCCandles(
    @Query('limit') limit?: string,
    @Query('interval') interval?: string,
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 1000;
      const intervalStr = interval || '1h';

      const candles = await this.candlesService.getBTCCandles(
        limitNum,
        intervalStr,
      );

      return {
        success: true,
        message: 'BTC candles data retrieved successfully',
        data: candles,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('eth')
  async getETHCandles(
    @Query('limit') limit?: string,
    @Query('interval') interval?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 1000;
      const intervalStr = interval || '1h';
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      const candles = await this.candlesService.getETHCandles(
        limitNum,
        intervalStr,
        offsetNum,
      );

      return {
        success: true,
        message: 'ETH candles data retrieved successfully',
        data: candles,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
