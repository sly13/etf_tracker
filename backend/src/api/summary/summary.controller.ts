import { Controller, Get } from '@nestjs/common';
import { UniversalETFFlowService } from '../etf/universal-etf-flow.service';
import type { ETFFlowData, BTCFlowData, SolFlowData } from '../etf/etf-types';

@Controller('summary')
export class SummaryController {
  constructor(private readonly etfFlowService: UniversalETFFlowService) {}

  @Get()
  async getSummary() {
    const ethereumData: ETFFlowData[] =
      await this.etfFlowService.getETFFlowData('ethereum');
    const bitcoinData: BTCFlowData[] =
      await this.etfFlowService.getETFFlowData('bitcoin');
    const solanaData: SolFlowData[] =
      await this.etfFlowService.getETFFlowData('solana');

    // Функция для расчета суммы всех фондов за день (исключая total и date)
    const calculateDailyTotal = (item: any): number => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { total: _total, date: _date, ...funds } = item;
      const numericFunds: Record<string, number> = funds;
      return Object.values(numericFunds).reduce(
        (sum: number, value: number) => sum + (value || 0),
        0,
      );
    };

    // Даты seed данных, которые нужно исключить из расчетов
    const seedDates = {
      ethereum: '2024-07-22',
      solana: '2025-10-27',
    };

    // Рассчитываем общие активы как сумму всех фондов за все дни
    // Суммируем все фонды за каждый день (используя calculateDailyTotal)
    // Исключаем seed данные из расчетов
    const bitcoinTotalAssets = bitcoinData.reduce(
      (sum, item) => sum + calculateDailyTotal(item),
      0,
    );

    const ethereumTotalAssets = ethereumData
      .filter((item) => item.date !== seedDates.ethereum)
      .reduce((sum, item) => sum + calculateDailyTotal(item), 0);

    const solanaTotalAssets = solanaData
      .filter((item) => item.date !== seedDates.solana)
      .reduce((sum, item) => sum + calculateDailyTotal(item), 0);

    // Получаем последние данные
    const latestEthereum = ethereumData[0];
    const latestBitcoin = bitcoinData[0];
    const latestSolana = solanaData[0];

    // Рассчитываем текущие потоки
    let ethereumCurrentFlow: number = calculateDailyTotal(latestEthereum || {});
    let bitcoinCurrentFlow: number = calculateDailyTotal(latestBitcoin || {});
    let solanaCurrentFlow: number = calculateDailyTotal(latestSolana || {});

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

    if (solanaCurrentFlow === 0 && solanaData.length > 0) {
      solanaCurrentFlow =
        solanaData
          .slice(0, Math.min(7, solanaData.length))
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
      solana: {
        totalAssets: Math.round(solanaTotalAssets * 10) / 10,
        currentFlow: Math.round(solanaCurrentFlow * 10) / 10,
        count: solanaData.length,
        latestDate: latestSolana?.date || null,
      },
      overall: {
        totalAssets:
          Math.round(
            (bitcoinTotalAssets + ethereumTotalAssets + solanaTotalAssets) * 10,
          ) / 10,
        currentFlow:
          Math.round(
            (bitcoinCurrentFlow + ethereumCurrentFlow + solanaCurrentFlow) * 10,
          ) / 10,
        totalCount:
          bitcoinData.length + ethereumData.length + solanaData.length,
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}
