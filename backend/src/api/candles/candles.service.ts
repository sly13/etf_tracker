import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class CandlesService {
  constructor(private readonly prisma: PrismaService) {}

  async getBTCCandles(
    limit: number = 1000,
    interval: string = '1h',
    offset: number = 0,
  ) {
    try {
      console.log(
        `Fetching BTC candles: limit=${limit}, interval=${interval}, offset=${offset}`,
      );

      // Если запрашивается интервал 5m, возвращаем данные как есть
      if (interval === '5m') {
        const candles = await this.prisma.bTCandle.findMany({
          where: {
            symbol: 'BTCUSDT',
            interval: '5m',
          },
          orderBy: {
            openTime: 'desc',
          },
          skip: offset,
          take: limit,
          select: {
            id: true,
            symbol: true,
            interval: true,
            openTime: true,
            closeTime: true,
            open: true,
            high: true,
            low: true,
            close: true,
            volume: true,
            quoteVolume: true,
            trades: true,
            takerBuyBase: true,
            takerBuyQuote: true,
            source: true,
            insertedAt: true,
            updatedAt: true,
          },
        });

        console.log(`Found ${candles.length} 5m candles`);
        return candles.reverse();
      }

      // Для других интервалов агрегируем 5-минутные данные
      const candles = await this.prisma.bTCandle.findMany({
        where: {
          symbol: 'BTCUSDT',
          interval: '5m',
        },
        orderBy: {
          openTime: 'desc',
        },
        skip: offset,
        take: Math.max(limit * 12 * 12, 10000), // Берем минимум 10000 записей для агрегации
        select: {
          id: true,
          symbol: true,
          interval: true,
          openTime: true,
          closeTime: true,
          open: true,
          high: true,
          low: true,
          close: true,
          volume: true,
          quoteVolume: true,
          trades: true,
          takerBuyBase: true,
          takerBuyQuote: true,
          source: true,
          insertedAt: true,
          updatedAt: true,
        },
      });

      console.log(`Found ${candles.length} 5m candles for aggregation`);
      console.log(`First few candles:`, candles.slice(0, 3));

      // Агрегируем данные по интервалам
      const aggregatedCandles = this.aggregateCandles(
        candles.reverse(),
        interval,
        limit,
      );

      console.log(
        `Aggregated to ${aggregatedCandles.length} ${interval} candles`,
      );
      console.log(`Aggregated candles:`, aggregatedCandles.slice(0, 2));
      return aggregatedCandles;
    } catch (error) {
      console.error('Error fetching BTC candles:', error);
      throw new Error(`Failed to fetch BTC candles: ${error.message}`);
    }
  }

  private aggregateCandles(
    candles: any[],
    targetInterval: string,
    limit: number,
  ) {
    console.log(
      `Aggregating ${candles.length} candles to ${targetInterval}, limit: ${limit}`,
    );

    if (candles.length === 0) {
      console.log('No candles to aggregate');
      return [];
    }

    // Определяем шаг для выборки свечей
    let step = 1;
    switch (targetInterval) {
      case '1h':
        step = 12; // каждую 12-ю свечу (12 * 5min = 1h)
        break;
      case '1d':
        step = 288; // каждую 288-ю свечу (288 * 5min = 1d)
        break;
      case '1w':
        step = 2016; // каждую 2016-ю свечу (2016 * 5min = 1w)
        break;
      default:
        console.log(
          `Unknown interval ${targetInterval}, returning first ${limit} candles`,
        );
        return candles.slice(0, limit);
    }

    console.log(`Using step: ${step}`);

    const sampled: any[] = [];

    // вместо N-й свечи
    for (let i = 0; i < candles.length; i += step) {
      if (sampled.length >= limit) break;

      const candle = candles[i];
      sampled.push({
        ...candle,
        interval: targetInterval,
      });
    }

    console.log(`Sampled ${sampled.length} candles`);
    return sampled;
  }

  async getETHCandles(
    limit: number = 1000,
    interval: string = '1h',
    offset: number = 0,
  ) {
    try {
      console.log(
        `Fetching ETH candles: limit=${limit}, interval=${interval}, offset=${offset}`,
      );

      // Если запрашивается интервал 5m, возвращаем данные как есть
      if (interval === '5m') {
        const candles = await this.prisma.bTCandle.findMany({
          where: {
            symbol: 'ETHUSDT',
            interval: '5m',
          },
          orderBy: {
            openTime: 'desc',
          },
          skip: offset,
          take: limit,
          select: {
            id: true,
            symbol: true,
            interval: true,
            openTime: true,
            closeTime: true,
            open: true,
            high: true,
            low: true,
            close: true,
            volume: true,
            quoteVolume: true,
            trades: true,
            takerBuyBase: true,
            takerBuyQuote: true,
            source: true,
            insertedAt: true,
            updatedAt: true,
          },
        });

        console.log(`Found ${candles.length} ETH 5m candles`);
        return candles.reverse();
      }

      // Для других интервалов агрегируем 5-минутные данные
      const candles = await this.prisma.bTCandle.findMany({
        where: {
          symbol: 'ETHUSDT',
          interval: '5m',
        },
        orderBy: {
          openTime: 'desc',
        },
        skip: offset,
        take: Math.max(limit * 12 * 12, 10000), // Берем минимум 10000 записей для агрегации
        select: {
          id: true,
          symbol: true,
          interval: true,
          openTime: true,
          closeTime: true,
          open: true,
          high: true,
          low: true,
          close: true,
          volume: true,
          quoteVolume: true,
          trades: true,
          takerBuyBase: true,
          takerBuyQuote: true,
          source: true,
          insertedAt: true,
          updatedAt: true,
        },
      });

      console.log(`Found ${candles.length} ETH 5m candles for aggregation`);

      // Агрегируем данные по интервалам
      const aggregatedCandles = this.aggregateCandles(
        candles.reverse(),
        interval,
        limit,
      );

      console.log(
        `Aggregated to ${aggregatedCandles.length} ETH ${interval} candles`,
      );
      return aggregatedCandles;
    } catch (error) {
      console.error('Error fetching ETH candles:', error);
      throw new Error(`Failed to fetch ETH candles: ${error.message}`);
    }
  }
}
