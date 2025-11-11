import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { CEFIIndexService } from './cefi-index.service';
import type { CEFIIndexResponse, BPFData } from './cefi-types';

@Controller('cefi')
export class CEFIIndexController {
  private readonly logger = new Logger(CEFIIndexController.name);

  constructor(private readonly cefiIndexService: CEFIIndexService) {}

  /**
   * Получить индекс CEFI-BTC
   * GET /cefi/btc
   */
  @Get('btc')
  async getCEFIBTC(
    @Query('limit') limit?: string,
  ): Promise<CEFIIndexResponse | CEFIIndexResponse['history']> {
    try {
      const response = await this.cefiIndexService.getCEFIBTC();
      const limitNum = limit ? parseInt(limit, 10) : undefined;

      if (limitNum && limitNum > 0) {
        // Возвращаем только последние N записей истории
        return response.history.slice(-limitNum);
      }

      return response;
    } catch (error) {
      this.logger.error('Ошибка при получении CEFI-BTC:', error);
      throw error;
    }
  }

  /**
   * Получить индекс CEFI-ETH
   * GET /cefi/eth
   */
  @Get('eth')
  async getCEFIETH(
    @Query('limit') limit?: string,
  ): Promise<CEFIIndexResponse | CEFIIndexResponse['history']> {
    try {
      const response = await this.cefiIndexService.getCEFIETH();
      const limitNum = limit ? parseInt(limit, 10) : undefined;

      if (limitNum && limitNum > 0) {
        // Возвращаем только последние N записей истории
        return response.history.slice(-limitNum);
      }

      return response;
    } catch (error) {
      this.logger.error('Ошибка при получении CEFI-ETH:', error);
      throw error;
    }
  }

  /**
   * Получить составной индекс CEFI-Composite
   * GET /cefi/composite
   */
  @Get('composite')
  async getCEFIComposite(
    @Query('limit') limit?: string,
  ): Promise<CEFIIndexResponse | CEFIIndexResponse['history']> {
    try {
      const response = await this.cefiIndexService.getCEFIComposite();
      const limitNum = limit ? parseInt(limit, 10) : undefined;

      if (limitNum && limitNum > 0) {
        // Возвращаем только последние N записей истории
        return response.history.slice(-limitNum);
      }

      return response;
    } catch (error) {
      this.logger.error('Ошибка при получении CEFI-Composite:', error);
      throw error;
    }
  }

  /**
   * Получить BPF (Breadth of Positive Flows)
   * GET /cefi/bpf?asset=bitcoin|ethereum
   */
  @Get('bpf')
  async getBPF(
    @Query('asset') asset: 'bitcoin' | 'ethereum' = 'bitcoin',
    @Query('limit') limit?: string,
  ): Promise<BPFData[] | BPFData> {
    try {
      const bpfData = await this.cefiIndexService.getBPF(asset);
      const limitNum = limit ? parseInt(limit, 10) : undefined;

      if (limitNum && limitNum > 0) {
        // Возвращаем только последние N записей
        return bpfData.slice(-limitNum);
      }

      // Если запрашивается только текущее значение
      if (limitNum === 1) {
        return bpfData[bpfData.length - 1] || {
          date: new Date().toISOString().split('T')[0],
          percentage: 0,
          positiveFunds: 0,
          totalFunds: 0,
        };
      }

      return bpfData;
    } catch (error) {
      this.logger.error('Ошибка при получении BPF:', error);
      throw error;
    }
  }

  /**
   * Получить все индексы
   * GET /cefi/all
   */
  @Get('all')
  async getAllIndices(
    @Query('limit') limit?: string,
  ): Promise<{
    btc: CEFIIndexResponse;
    eth: CEFIIndexResponse;
    composite: CEFIIndexResponse;
    bpf: {
      bitcoin: BPFData[];
      ethereum: BPFData[];
    };
  }> {
    try {
      const limitNum = limit ? parseInt(limit, 10) : undefined;
      const [btc, eth, composite, bpfBtc, bpfEth] = await Promise.all([
        this.cefiIndexService.getCEFIBTC(),
        this.cefiIndexService.getCEFIETH(),
        this.cefiIndexService.getCEFIComposite(),
        this.cefiIndexService.getBPF('bitcoin'),
        this.cefiIndexService.getBPF('ethereum'),
      ]);

      return {
        btc: limitNum
          ? {
              ...btc,
              history: btc.history.slice(-limitNum),
            }
          : btc,
        eth: limitNum
          ? {
              ...eth,
              history: eth.history.slice(-limitNum),
            }
          : eth,
        composite: limitNum
          ? {
              ...composite,
              history: composite.history.slice(-limitNum),
            }
          : composite,
        bpf: {
          bitcoin: limitNum ? bpfBtc.slice(-limitNum) : bpfBtc,
          ethereum: limitNum ? bpfEth.slice(-limitNum) : bpfEth,
        },
      };
    } catch (error) {
      this.logger.error('Ошибка при получении всех индексов:', error);
      throw error;
    }
  }
}

