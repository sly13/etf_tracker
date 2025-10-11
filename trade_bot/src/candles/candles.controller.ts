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
  async test() {
    return {
      success: true,
      message: 'Candles controller is working',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('btc')
  async getBTCCandles(
    @Query('limit') limit?: string,
    @Query('interval') interval?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 1000;
      const intervalStr = interval || '1h';
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      const candles = await this.candlesService.getBTCCandles(
        limitNum,
        intervalStr,
        offsetNum,
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
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 1000;
      const intervalStr = interval || '1h';

      const candles = await this.candlesService.getETHCandles(
        limitNum,
        intervalStr,
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
