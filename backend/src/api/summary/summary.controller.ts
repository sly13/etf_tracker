import { Controller, Get } from '@nestjs/common';
import {
  UniversalETFFlowService,
  ETFFlowData,
  BTCFlowData,
} from '../etf/universal-etf-flow.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly etfFlowService: UniversalETFFlowService) {}

  @Get()
  async getSummary() {
    const ethereumData = (await this.etfFlowService.getETFFlowData(
      'ethereum',
    )) as ETFFlowData[];
    const bitcoinData = (await this.etfFlowService.getETFFlowData(
      'bitcoin',
    )) as BTCFlowData[];

    // Функция для расчета суммы всех фондов за день (исключая total и date)
    const calculateDailyTotal = (item: any): number => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { total: _total, date: _date, ...funds } = item;
      return (Object.values(funds) as number[]).reduce(
        (sum: number, value: number) => {
          return sum + (value || 0);
        },
        0,
      );
    };

    // Рассчитываем общие активы для Bitcoin - суммируем все фонды за все дни
    const bitcoinTotalAssets = bitcoinData.reduce(
      (sum, item) => sum + calculateDailyTotal(item),
      0,
    );

    // Рассчитываем общие активы для Ethereum - суммируем все фонды за все дни
    const ethereumTotalAssets = ethereumData.reduce(
      (sum, item) => sum + calculateDailyTotal(item),
      0,
    );

    // Получаем последние данные
    const latestEthereum = ethereumData[0];
    const latestBitcoin = bitcoinData[0];

    // Рассчитываем текущие потоки
    let ethereumCurrentFlow: number = calculateDailyTotal(latestEthereum || {});
    let bitcoinCurrentFlow: number = calculateDailyTotal(latestBitcoin || {});

    // Если текущий поток равен 0, берем среднее за последние 7 дней
    if (ethereumCurrentFlow === 0 && ethereumData.length > 0) {
      ethereumCurrentFlow =
        ethereumData
          .slice(0, Math.min(7, ethereumData.length))
          .reduce((sum, item) => sum + calculateDailyTotal(item), 0) / 7;
    }

    if (bitcoinCurrentFlow === 0 && bitcoinData.length > 0) {
      bitcoinCurrentFlow =
        bitcoinData
          .slice(0, Math.min(7, bitcoinData.length))
          .reduce((sum, item) => sum + calculateDailyTotal(item), 0) / 7;
    }

    return {
      bitcoin: {
        totalAssets: Math.round(bitcoinTotalAssets * 10) / 10,
        currentFlow: Math.round(bitcoinCurrentFlow * 10) / 10,
        count: bitcoinData.length,
        latestDate: latestBitcoin?.date || null,
      },
      ethereum: {
        totalAssets: Math.round(ethereumTotalAssets * 10) / 10,
        currentFlow: Math.round(ethereumCurrentFlow * 10) / 10,
        count: ethereumData.length,
        latestDate: latestEthereum?.date || null,
      },
      overall: {
        totalAssets:
          Math.round((bitcoinTotalAssets + ethereumTotalAssets) * 10) / 10,
        currentFlow:
          Math.round((bitcoinCurrentFlow + ethereumCurrentFlow) * 10) / 10,
        totalCount: bitcoinData.length + ethereumData.length,
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}
