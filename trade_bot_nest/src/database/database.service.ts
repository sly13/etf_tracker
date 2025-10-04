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
      const flows = await this.prisma.bTCFlow.findMany({
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
      const flows = await this.prisma.eTFFlow.findMany({
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
      const positions = await this.prisma.tradingPosition.findMany({
        orderBy: { createdAt: 'desc' },
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
      const positions = await this.prisma.tradingPosition.findMany({
        where: { status: 'open' },
        orderBy: { createdAt: 'desc' },
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
      const totalPositions = await this.prisma.tradingPosition.count();
      const openPositions = await this.prisma.tradingPosition.count({
        where: { status: 'open' },
      });
      const closedPositions = await this.prisma.tradingPosition.count({
        where: { status: 'closed' },
      });

      const totalProfitLoss = await this.prisma.tradingPosition.aggregate({
        _sum: { profitLoss: true },
        where: { status: 'closed' },
      });

      return {
        totalPositions,
        openPositions,
        closedPositions,
        totalProfitLoss: totalProfitLoss._sum.profitLoss || 0,
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
    entryPrice: number;
    total: number;
    okxOrderId?: string;
  }) {
    try {
      const position = await this.prisma.tradingPosition.create({
        data,
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
      const position = await this.prisma.tradingPosition.update({
        where: { id },
        data,
      });
      return position;
    } catch (error) {
      this.logger.error('Ошибка обновления торговой позиции:', error);
      throw error;
    }
  }
}
