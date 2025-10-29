import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { ParsingResult } from './etf-types';

interface IETFFlowService {
  parseAllETFFlowData(): Promise<{
    ethereum: ParsingResult;
    bitcoin: ParsingResult;
    solana?: ParsingResult;
  }>;
}

@Injectable()
export class ETFFlowSchedulerService {
  private readonly logger = new Logger(ETFFlowSchedulerService.name);
  private lastParseStatus: {
    ethereum: { success: boolean; count: number; timestamp: Date };
    bitcoin: { success: boolean; count: number; timestamp: Date };
  } = {
    ethereum: { success: false, count: 0, timestamp: new Date() },
    bitcoin: { success: false, count: 0, timestamp: new Date() },
  };

  constructor(private readonly etfFlowService: IETFFlowService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleMorningParse() {
    this.logger.log('🌅 Утренний парсинг ETF данных...');
    await this.parseAllETFFlowData();
  }

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async handleEveningParse() {
    this.logger.log('🌆 Вечерний парсинг ETF данных...');
    await this.parseAllETFFlowData();
  }

  async parseAllETFFlowData(): Promise<void> {
    try {
      const results = await this.etfFlowService.parseAllETFFlowData();

      if (results && results.ethereum && results.bitcoin) {
        this.lastParseStatus.ethereum = {
          success: results.ethereum.success,
          count: results.ethereum.count,
          timestamp: new Date(),
        };

        this.lastParseStatus.bitcoin = {
          success: results.bitcoin.success,
          count: results.bitcoin.count,
          timestamp: new Date(),
        };

        this.logger.log('✅ Парсинг ETF данных завершен успешно');
        this.logger.log(`Ethereum: ${results.ethereum.count} записей`);
        this.logger.log(`Bitcoin: ${results.bitcoin.count} записей`);
      }
    } catch (error) {
      this.logger.error('❌ Ошибка при парсинге ETF данных:', error);
    }
  }

  async manualParse(): Promise<void> {
    this.logger.log('🔧 Ручной запуск парсинга ETF данных...');
    await this.parseAllETFFlowData();
  }

  getLastParseStatus() {
    return this.lastParseStatus;
  }
}
