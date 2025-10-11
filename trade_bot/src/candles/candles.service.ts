import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CandlesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getBTCCandles(limit: number = 1000, interval: string = '1h', offset: number = 0) {
    try {
      console.log(`Fetching BTC candles: limit=${limit}, interval=${interval}, offset=${offset}`);

      const candles = await this.databaseService.getBTCCandles(limit, interval, offset);

      console.log(`Found ${candles.length} candles`);
      console.log('First candle:', candles[0]);

      // Возвращаем данные в правильном порядке (от старых к новым)
      return candles.reverse();
    } catch (error) {
      console.error('Error fetching BTC candles:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`Failed to fetch BTC candles: ${error.message}`);
    }
  }

  async getETHCandles(limit: number = 1000, interval: string = '1h', offset: number = 0) {
    try {
      console.log(`Fetching ETH candles: limit=${limit}, interval=${interval}, offset=${offset}`);

      const candles = await this.databaseService.getETHCandles(limit, interval, offset);

      console.log(`Found ${candles.length} candles`);

      // Возвращаем данные в правильном порядке (от старых к новым)
      return candles.reverse();
    } catch (error) {
      console.error('Error fetching ETH candles:', error);
      throw new Error(`Failed to fetch ETH candles: ${error.message}`);
    }
  }
}
