import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import type { ETFFlowData, BTCFlowData, SolFlowData } from './etf-types';
import type {
  CEFIIndexData,
  CEFIIndexResponse,
  BPFData,
  AssetFlowData,
  FundFlowData,
} from './cefi-types';

@Injectable()
export class CEFIIndexService {
  private readonly logger = new Logger(CEFIIndexService.name);

  // Константы для расчета индекса
  private readonly BASE_VALUE = 1000;
  private readonly SMOOTHING_FACTOR = 0.3; // lambda в диапазоне [0.2, 0.4]
  private readonly Z_SCORE_WINDOW = 90; // дней
  private readonly ALPHA = 50; // коэффициент для экспоненты

  // Приблизительное количество монет в обращении (для расчета рыночной капитализации)
  private readonly BTC_SUPPLY = 19_700_000; // ~19.7M BTC
  private readonly ETH_SUPPLY = 120_000_000; // ~120M ETH
  private readonly SOL_SUPPLY = 600_000_000; // ~600M SOL

  constructor(
    private readonly prisma: PrismaService,
    private readonly etfFlowService: UniversalETFFlowService,
  ) {}

  /**
   * Получить индекс CEFI-BTC
   */
  async getCEFIBTC(): Promise<CEFIIndexResponse> {
    const flows = await this.etfFlowService.getETFFlowData('bitcoin');
    const assetFlows = await this.calculateAssetFlows('BTC', flows);
    const indexData = this.calculateIndex(assetFlows);

    return {
      index: 'CEFI-BTC',
      current: indexData[indexData.length - 1] || this.getDefaultIndexData(),
      history: indexData,
      metadata: {
        baseValue: this.BASE_VALUE,
        smoothingFactor: this.SMOOTHING_FACTOR,
        windowSize: this.Z_SCORE_WINDOW,
      },
    };
  }

  /**
   * Получить индекс CEFI-ETH
   */
  async getCEFIETH(): Promise<CEFIIndexResponse> {
    const flows = await this.etfFlowService.getETFFlowData('ethereum');
    const assetFlows = await this.calculateAssetFlows('ETH', flows);
    const indexData = this.calculateIndex(assetFlows);

    return {
      index: 'CEFI-ETH',
      current: indexData[indexData.length - 1] || this.getDefaultIndexData(),
      history: indexData,
      metadata: {
        baseValue: this.BASE_VALUE,
        smoothingFactor: this.SMOOTHING_FACTOR,
        windowSize: this.Z_SCORE_WINDOW,
      },
    };
  }

  /**
   * Получить составной индекс CEFI-Composite
   */
  async getCEFIComposite(): Promise<CEFIIndexResponse> {
    const btcFlows = await this.etfFlowService.getETFFlowData('bitcoin');
    const ethFlows = await this.etfFlowService.getETFFlowData('ethereum');

    const btcAssetFlows = await this.calculateAssetFlows('BTC', btcFlows);
    const ethAssetFlows = await this.calculateAssetFlows('ETH', ethFlows);

    // Объединяем потоки по датам
    const compositeFlows = this.combineAssetFlows(btcAssetFlows, ethAssetFlows);
    const indexData = this.calculateIndex(compositeFlows);

    return {
      index: 'CEFI-Composite',
      current: indexData[indexData.length - 1] || this.getDefaultIndexData(),
      history: indexData,
      metadata: {
        baseValue: this.BASE_VALUE,
        smoothingFactor: this.SMOOTHING_FACTOR,
        windowSize: this.Z_SCORE_WINDOW,
      },
    };
  }

  /**
   * Получить BPF (Breadth of Positive Flows)
   */
  async getBPF(
    assetType: 'bitcoin' | 'ethereum' = 'bitcoin',
  ): Promise<BPFData[]> {
    let flows: ETFFlowData[] | BTCFlowData[];
    if (assetType === 'bitcoin') {
      flows = await this.etfFlowService.getETFFlowData('bitcoin');
    } else {
      flows = await this.etfFlowService.getETFFlowData('ethereum');
    }

    const bpfData: BPFData[] = [];

    for (const flow of flows) {
      const fundFields = this.getFundFields(assetType, flow);
      const positiveFunds = fundFields.filter((f) => f > 0).length;
      const totalFunds = fundFields.length;
      const percentage =
        totalFunds > 0 ? (positiveFunds / totalFunds) * 100 : 0;

      bpfData.push({
        date: flow.date,
        percentage,
        positiveFunds,
        totalFunds,
      });
    }

    return bpfData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  /**
   * Рассчитать потоки для актива
   */
  private async calculateAssetFlows(
    asset: 'BTC' | 'ETH' | 'SOL',
    flows: ETFFlowData[] | BTCFlowData[] | SolFlowData[],
  ): Promise<AssetFlowData[]> {
    const assetFlows: AssetFlowData[] = [];
    const sortedFlows = [...flows].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    if (sortedFlows.length === 0) {
      return [];
    }

    // Рассчитываем накопленные AUM для каждого фонда
    const fundAUMs = this.calculateFundAUMs(asset, sortedFlows);

    // Получаем все рыночные капитализации за один запрос для оптимизации
    const marketCaps = await this.getMarketCaps(
      asset,
      sortedFlows.map((f) => f.date),
    );

    for (const flow of sortedFlows) {
      const date = flow.date;
      const fundFields = this.getFundFields(
        asset === 'BTC' ? 'bitcoin' : asset === 'ETH' ? 'ethereum' : 'solana',
        flow,
      );
      const fundNames = this.getFundNames(
        asset === 'BTC' ? 'bitcoin' : asset === 'ETH' ? 'ethereum' : 'solana',
      );

      // Рассчитываем веса фондов на основе AUM
      const totalAUM = fundAUMs.reduce(
        (sum, aum) => sum + (aum.get(date) || 0),
        0,
      );

      const funds: FundFlowData[] = fundNames.map((name, idx) => {
        const netFlow = fundFields[idx] || 0;
        const aum = fundAUMs[idx].get(date) || 0;
        const weight = totalAUM > 0 ? aum / totalAUM : 0;

        return {
          fundName: name,
          netFlow,
          aum,
          weight,
        };
      });

      // Рассчитываем взвешенную сумму потоков
      const totalFlow = funds.reduce(
        (sum, fund) => sum + fund.weight * fund.netFlow,
        0,
      );

      // Получаем рыночную капитализацию из кэша
      const marketCap = marketCaps.get(date) || this.getDefaultMarketCap(asset);

      // Нормализуем поток относительно рыночной капитализации
      const normalizedFlow =
        marketCap > 0 ? (totalFlow * 1_000_000) / marketCap : 0; // конвертируем миллионы в доллары

      assetFlows.push({
        date,
        asset,
        totalFlow,
        normalizedFlow,
        smoothedFlow: 0, // будет рассчитано позже
        funds,
      });
    }

    // Применяем экспоненциальное сглаживание
    this.applySmoothing(assetFlows);

    return assetFlows;
  }

  /**
   * Рассчитать накопленные AUM для каждого фонда
   */
  private calculateFundAUMs(
    asset: 'BTC' | 'ETH' | 'SOL',
    flows: ETFFlowData[] | BTCFlowData[] | SolFlowData[],
  ): Map<string, number>[] {
    const fundNames = this.getFundNames(
      asset === 'BTC' ? 'bitcoin' : asset === 'ETH' ? 'ethereum' : 'solana',
    );
    const fundAUMs = fundNames.map(() => new Map<string, number>());

    const cumulativeAUMs = fundNames.map(() => 0);

    for (const flow of flows) {
      const date = flow.date;
      const fundFields = this.getFundFields(
        asset === 'BTC' ? 'bitcoin' : asset === 'ETH' ? 'ethereum' : 'solana',
        flow,
      );

      fundFields.forEach((netFlow, idx) => {
        cumulativeAUMs[idx] += netFlow || 0;
        fundAUMs[idx].set(date, cumulativeAUMs[idx]);
      });
    }

    return fundAUMs;
  }

  /**
   * Применить экспоненциальное сглаживание (EWMA)
   */
  private applySmoothing(assetFlows: AssetFlowData[]): void {
    let previousSmoothed = 0;

    for (const flow of assetFlows) {
      if (previousSmoothed === 0) {
        flow.smoothedFlow = flow.normalizedFlow;
      } else {
        flow.smoothedFlow =
          this.SMOOTHING_FACTOR * flow.normalizedFlow +
          (1 - this.SMOOTHING_FACTOR) * previousSmoothed;
      }
      previousSmoothed = flow.smoothedFlow;
    }
  }

  /**
   * Рассчитать индекс на основе сглаженных потоков
   */
  private calculateIndex(assetFlows: AssetFlowData[]): CEFIIndexData[] {
    if (assetFlows.length === 0) {
      return [];
    }

    const indexData: CEFIIndexData[] = [];

    for (let i = 0; i < assetFlows.length; i++) {
      const flow = assetFlows[i];
      const windowStart = Math.max(0, i - this.Z_SCORE_WINDOW + 1);
      const window = assetFlows.slice(windowStart, i + 1);

      if (window.length < 2) {
        // Недостаточно данных для расчета Z-score
        indexData.push({
          date: flow.date,
          value: this.BASE_VALUE,
          change: 0,
          changePercent: 0,
        });
        continue;
      }

      // Рассчитываем среднее и стандартное отклонение
      const smoothedValues = window.map((w) => w.smoothedFlow);
      const mean =
        smoothedValues.reduce((sum, val) => sum + val, 0) /
        smoothedValues.length;
      const variance =
        smoothedValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        smoothedValues.length;
      const stdDev = Math.sqrt(variance);

      // Рассчитываем Z-score
      const zScore = stdDev > 0 ? (flow.smoothedFlow - mean) / stdDev : 0;

      // Применяем экспоненту для получения индекса
      const indexValue = this.BASE_VALUE * Math.exp(this.ALPHA * zScore * 0.01);

      // Рассчитываем изменение
      const previousIndex = i > 0 ? indexData[i - 1].value : this.BASE_VALUE;
      const change = indexValue - previousIndex;
      const changePercent =
        previousIndex > 0 ? (change / previousIndex) * 100 : 0;

      indexData.push({
        date: flow.date,
        value: Math.round(indexValue * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
      });
    }

    return indexData;
  }

  /**
   * Объединить потоки разных активов для составного индекса
   */
  private combineAssetFlows(
    btcFlows: AssetFlowData[],
    ethFlows: AssetFlowData[],
  ): AssetFlowData[] {
    const dateMap = new Map<string, AssetFlowData>();

    // Добавляем BTC потоки
    for (const flow of btcFlows) {
      dateMap.set(flow.date, { ...flow });
    }

    // Объединяем с ETH потоками
    for (const ethFlow of ethFlows) {
      const existing = dateMap.get(ethFlow.date);
      if (existing) {
        existing.totalFlow += ethFlow.totalFlow;
        existing.normalizedFlow += ethFlow.normalizedFlow;
        existing.smoothedFlow += ethFlow.smoothedFlow;
        existing.funds = [...existing.funds, ...ethFlow.funds];
      } else {
        dateMap.set(ethFlow.date, { ...ethFlow });
      }
    }

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  /**
   * Получить рыночные капитализации для списка дат (оптимизированная версия)
   */
  private async getMarketCaps(
    asset: 'BTC' | 'ETH' | 'SOL',
    dates: string[],
  ): Promise<Map<string, number>> {
    const marketCaps = new Map<string, number>();
    const symbol =
      asset === 'BTC' ? 'BTCUSDT' : asset === 'ETH' ? 'ETHUSDT' : 'SOLUSDT';
    const supply =
      asset === 'BTC'
        ? this.BTC_SUPPLY
        : asset === 'ETH'
          ? this.ETH_SUPPLY
          : this.SOL_SUPPLY;

    try {
      // Получаем минимальную и максимальную даты
      const minDate = new Date(
        Math.min(...dates.map((d) => new Date(d).getTime())),
      );
      const maxDate = new Date(
        Math.max(...dates.map((d) => new Date(d).getTime())),
      );
      minDate.setHours(0, 0, 0, 0);
      maxDate.setHours(23, 59, 59, 999);

      // Получаем все свечи за период одним запросом
      const candles = await this.prisma.bTCandle.findMany({
        where: {
          symbol,
          interval: '1d',
          openTime: {
            gte: minDate,
            lte: maxDate,
          },
        },
        orderBy: {
          openTime: 'asc',
        },
      });

      // Создаем мапу дат к свечам
      const candleMap = new Map<string, number>();
      for (const candle of candles) {
        const candleDate = candle.openTime.toISOString().split('T')[0];
        candleMap.set(candleDate, candle.close);
      }

      // Получаем последнюю доступную цену до периода (для дат без данных)
      let lastPrice: number | null = null;
      if (candles.length > 0) {
        lastPrice = candles[0].close;
      } else {
        const lastCandle = await this.prisma.bTCandle.findFirst({
          where: {
            symbol,
            interval: '1d',
            openTime: {
              lte: minDate,
            },
          },
          orderBy: {
            openTime: 'desc',
          },
        });
        if (lastCandle) {
          lastPrice = lastCandle.close;
        }
      }

      // Заполняем рыночные капитализации для каждой даты
      for (const date of dates) {
        const price =
          candleMap.get(date) || lastPrice || this.getDefaultPrice(asset);
        marketCaps.set(date, price * supply);
      }
    } catch (error) {
      this.logger.warn(
        `Ошибка при получении рыночных капитализаций для ${asset}:`,
        error,
      );
      // Заполняем значениями по умолчанию
      const defaultMarketCap = this.getDefaultMarketCap(asset);
      for (const date of dates) {
        if (!marketCaps.has(date)) {
          marketCaps.set(date, defaultMarketCap);
        }
      }
    }

    return marketCaps;
  }

  /**
   * Получить цену по умолчанию для актива
   */
  private getDefaultPrice(asset: 'BTC' | 'ETH' | 'SOL'): number {
    const defaultPrices: Record<string, number> = {
      BTC: 60_000,
      ETH: 3_000,
      SOL: 150,
    };
    return defaultPrices[asset];
  }

  /**
   * Получить значения по умолчанию для рыночной капитализации
   */
  private getDefaultMarketCap(asset: 'BTC' | 'ETH' | 'SOL'): number {
    // Приблизительные значения (в долларах)
    const defaultPrices: Record<string, number> = {
      BTC: 60_000,
      ETH: 3_000,
      SOL: 150,
    };

    const supply =
      asset === 'BTC'
        ? this.BTC_SUPPLY
        : asset === 'ETH'
          ? this.ETH_SUPPLY
          : this.SOL_SUPPLY;

    return defaultPrices[asset] * supply;
  }

  /**
   * Получить поля фондов из данных потока
   */
  private getFundFields(
    assetType: 'bitcoin' | 'ethereum' | 'solana',
    flow: ETFFlowData | BTCFlowData | SolFlowData,
  ): number[] {
    if (assetType === 'bitcoin') {
      const btcFlow = flow as BTCFlowData;
      return [
        btcFlow.blackrock || 0,
        btcFlow.fidelity || 0,
        btcFlow.bitwise || 0,
        btcFlow.twentyOneShares || 0,
        btcFlow.vanEck || 0,
        btcFlow.invesco || 0,
        btcFlow.franklin || 0,
        btcFlow.grayscale || 0,
        btcFlow.grayscaleBtc || 0,
        btcFlow.valkyrie || 0,
        btcFlow.wisdomTree || 0,
      ];
    } else if (assetType === 'ethereum') {
      const ethFlow = flow as ETFFlowData;
      return [
        ethFlow.blackrock || 0,
        ethFlow.fidelity || 0,
        ethFlow.bitwise || 0,
        ethFlow.twentyOneShares || 0,
        ethFlow.vanEck || 0,
        ethFlow.invesco || 0,
        ethFlow.franklin || 0,
        ethFlow.grayscale || 0,
        ethFlow.grayscaleCrypto || 0,
      ];
    } else {
      const solFlow = flow as SolFlowData;
      return [solFlow.bitwise || 0, solFlow.grayscale || 0];
    }
  }

  /**
   * Получить названия фондов
   */
  private getFundNames(assetType: 'bitcoin' | 'ethereum' | 'solana'): string[] {
    if (assetType === 'bitcoin') {
      return [
        'blackrock',
        'fidelity',
        'bitwise',
        'twentyOneShares',
        'vanEck',
        'invesco',
        'franklin',
        'grayscale',
        'grayscaleBtc',
        'valkyrie',
        'wisdomTree',
      ];
    } else if (assetType === 'ethereum') {
      return [
        'blackrock',
        'fidelity',
        'bitwise',
        'twentyOneShares',
        'vanEck',
        'invesco',
        'franklin',
        'grayscale',
        'grayscaleEth',
      ];
    } else {
      return ['bitwise', 'grayscale'];
    }
  }

  /**
   * Получить данные индекса по умолчанию
   */
  private getDefaultIndexData(): CEFIIndexData {
    return {
      date: new Date().toISOString().split('T')[0],
      value: this.BASE_VALUE,
      change: 0,
      changePercent: 0,
    };
  }
}
