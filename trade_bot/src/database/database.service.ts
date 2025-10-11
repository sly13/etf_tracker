import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private prisma: PrismaClient;
  private isConnected = false;

  constructor() {
    this.prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    // Настройка логирования
    this.prisma.$on('query', (e) => {
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug('Prisma Query:', e.query);
      }
    });

    this.prisma.$on('error', (e) => {
      this.logger.error('Prisma Error:', e);
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      this.isConnected = true;
      this.logger.log('✅ Подключение к базе данных установлено (Prisma)');
    } catch (error) {
      this.logger.error('❌ Ошибка подключения к базе данных:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.isConnected = false;
      this.logger.log('🔌 Подключение к базе данных закрыто');
    }
  }

  // Получить последние данные BTC Flow
  async getLatestBTCFlow(limit = 1) {
    try {
      const flows = await this.prisma.btc_flows.findMany({
        orderBy: { date: 'desc' },
        take: limit,
      });
      return flows;
    } catch (error) {
      this.logger.error('Ошибка получения BTC Flow данных:', error);
      throw error;
    }
  }

  // Получить последние данные ETH Flow
  async getLatestETHFlow(limit = 1) {
    try {
      const flows = await this.prisma.eth_flow.findMany({
        orderBy: { date: 'desc' },
        take: limit,
      });
      return flows;
    } catch (error) {
      this.logger.error('Ошибка получения ETH Flow данных:', error);
      throw error;
    }
  }

  // Получить все торговые позиции
  async getAllPositions(limit = 50) {
    try {
      const positions = await this.prisma.trading_positions.findMany({
        orderBy: { created_at: 'desc' },
        take: limit,
      });
      return positions;
    } catch (error) {
      this.logger.error('Ошибка получения торговых позиций:', error);
      throw error;
    }
  }

  // Получить открытые позиции
  async getOpenPositions() {
    try {
      const positions = await this.prisma.trading_positions.findMany({
        where: { status: 'open' },
        orderBy: { created_at: 'desc' },
      });
      return positions;
    } catch (error) {
      this.logger.error('Ошибка получения открытых позиций:', error);
      throw error;
    }
  }

  // Получить статистику торговли
  async getTradingStats() {
    try {
      const totalPositions = await this.prisma.trading_positions.count();
      const openPositions = await this.prisma.trading_positions.count({
        where: { status: 'open' },
      });
      const closedPositions = await this.prisma.trading_positions.count({
        where: { status: 'closed' },
      });

      const totalProfitLoss = await this.prisma.trading_positions.aggregate({
        _sum: { profit_loss: true },
        where: { status: 'closed' },
      });

      return {
        totalPositions,
        openPositions,
        closedPositions,
        totalProfitLoss: totalProfitLoss._sum.profit_loss || 0,
      };
    } catch (error) {
      this.logger.error('Ошибка получения статистики торговли:', error);
      throw error;
    }
  }

  // Создать новую торговую позицию
  async createTradingPosition(data: {
    symbol: string;
    side: string;
    size: number;
    entry_price: number;
    total: number;
    okx_order_id?: string;
  }) {
    try {
      const position = await this.prisma.trading_positions.create({
        data: {
          id: crypto.randomUUID(),
          symbol: data.symbol,
          side: data.side,
          size: data.size,
          entry_price: data.entry_price,
          total: data.total,
          okx_order_id: data.okx_order_id,
          updated_at: new Date(),
        },
      });
      return position;
    } catch (error) {
      this.logger.error('Ошибка создания торговой позиции:', error);
      throw error;
    }
  }

  // Обновить торговую позицию
  async updateTradingPosition(id: string, data: any) {
    try {
      const position = await this.prisma.trading_positions.update({
        where: { id },
        data,
      });
      return position;
    } catch (error) {
      this.logger.error('Ошибка обновления торговой позиции:', error);
      throw error;
    }
  }

  async getBTCCandles(
    limit: number = 1000,
    interval: string = '1h',
    offset: number = 0,
  ) {
    try {
      const candles = await this.prisma.btc_candles.findMany({
        where: {
          symbol: 'BTCUSDT',
          interval: interval,
        },
        orderBy: [
          {
            open_time: 'desc',
          },
          {
            id: 'desc',
          },
        ],
        skip: offset,
        take: limit,
        select: {
          id: true,
          symbol: true,
          interval: true,
          open_time: true,
          close_time: true,
          open: true,
          high: true,
          low: true,
          close: true,
          volume: true,
          quote_volume: true,
          trades: true,
          taker_buy_base: true,
          taker_buy_quote: true,
          source: true,
          inserted_at: true,
          updated_at: true,
        },
      });

      // Конвертируем BigInt в строку для JSON сериализации
      return candles.map((candle) => ({
        ...candle,
        id: candle.id.toString(),
      }));
    } catch (error) {
      this.logger.error('Ошибка получения BTC свечей:', error);
      throw error;
    }
  }

  async getETHCandles(
    limit: number = 1000,
    interval: string = '1h',
    offset: number = 0,
  ) {
    try {
      // Пока используем ту же таблицу, но можем создать отдельную для ETH
      const candles = await this.prisma.btc_candles.findMany({
        where: {
          symbol: 'ETHUSDT',
          interval: interval,
        },
        orderBy: [
          {
            open_time: 'desc',
          },
          {
            id: 'desc',
          },
        ],
        skip: offset,
        take: limit,
        select: {
          id: true,
          symbol: true,
          interval: true,
          open_time: true,
          close_time: true,
          open: true,
          high: true,
          low: true,
          close: true,
          volume: true,
          quote_volume: true,
          trades: true,
          taker_buy_base: true,
          taker_buy_quote: true,
          source: true,
          inserted_at: true,
          updated_at: true,
        },
      });

      // Конвертируем BigInt в строку для JSON сериализации
      return candles.map((candle) => ({
        ...candle,
        id: candle.id.toString(),
      }));
    } catch (error) {
      this.logger.error('Ошибка получения ETH свечей:', error);
      throw error;
    }
  }
}
