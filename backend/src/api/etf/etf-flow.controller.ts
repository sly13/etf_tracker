import { Controller, Get, Post, Param } from '@nestjs/common';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import type { ETFFlowData, BTCFlowData } from './etf-types';
import { ETFSchedulerService } from './etf-scheduler.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Controller('etf-flow')
export class ETFFlowController {
  constructor(
    private readonly etfFlowService: UniversalETFFlowService,
    private readonly etfSchedulerService: ETFSchedulerService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getETFFlowData() {
    // Возвращаем общие данные для всех ETF
    const ethereumData: ETFFlowData[] =
      await this.etfFlowService.getETFFlowData('ethereum');
    const bitcoinData: BTCFlowData[] =
      await this.etfFlowService.getETFFlowData('bitcoin');

    // Объединяем данные, убирая дубликаты по дате
    const allData = [...ethereumData, ...bitcoinData];
    const uniqueData = allData.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.date === item.date),
    );

    // Сортируем по дате (новые сначала)
    const sortedData = uniqueData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Фильтруем записи с нулевыми total, оставляя только те, где есть данные
    const filteredData = sortedData.filter(
      (item) => item.total !== null && item.total !== 0,
    );

    return filteredData.length > 0 ? filteredData : sortedData.slice(0, 10);
  }

  @Get('eth')
  async getEthereumETFFlowData() {
    return await this.etfFlowService.getETFFlowData('ethereum');
  }

  @Get('ethereum')
  async getEthereumETFFlowDataAlt() {
    return await this.etfFlowService.getETFFlowData('ethereum');
  }

  @Get('bitcoin')
  async getBitcoinETFFlowData() {
    return await this.etfFlowService.getETFFlowData('bitcoin');
  }

  @Get('daily/:date')
  async getDailyETFFlowData(@Param('date') date: string) {
    const targetDate = new Date(date);

    // Получаем данные Ethereum за день
    const ethereumData = await this.prisma.eTFFlow.findUnique({
      where: { date: targetDate },
    });

    // Получаем данные Bitcoin за день
    const bitcoinData = await this.prisma.bTCFlow.findUnique({
      where: { date: targetDate },
    });

    return {
      date: date,
      ethereum: ethereumData
        ? {
            blackrock: ethereumData.blackrock || 0,
            fidelity: ethereumData.fidelity || 0,
            bitwise: ethereumData.bitwise || 0,
            twentyOneShares: ethereumData.twentyOneShares || 0,
            vanEck: ethereumData.vanEck || 0,
            invesco: ethereumData.invesco || 0,
            franklin: ethereumData.franklin || 0,
            grayscale: ethereumData.grayscale || 0,
            grayscaleEth: ethereumData.grayscaleEth || 0,
            total: ethereumData.total || 0,
          }
        : null,
      bitcoin: bitcoinData
        ? {
            blackrock: bitcoinData.blackrock || 0,
            fidelity: bitcoinData.fidelity || 0,
            bitwise: bitcoinData.bitwise || 0,
            twentyOneShares: bitcoinData.twentyOneShares || 0,
            vanEck: bitcoinData.vanEck || 0,
            invesco: bitcoinData.invesco || 0,
            franklin: bitcoinData.franklin || 0,
            grayscale: bitcoinData.grayscale || 0,
            grayscaleBtc: bitcoinData.grayscaleBtc || 0,
            valkyrie: bitcoinData.valkyrie || 0,
            wisdomTree: bitcoinData.wisdomTree || 0,
            total: bitcoinData.total || 0,
          }
        : null,
    };
  }

  @Get('summary')
  async getETFFlowSummary() {
    const ethereumData: ETFFlowData[] =
      await this.etfFlowService.getETFFlowData('ethereum');
    const bitcoinData: BTCFlowData[] =
      await this.etfFlowService.getETFFlowData('bitcoin');

    // Функция для расчета суммы всех фондов за день (исключая total и date)
    const calculateDailyTotal = (item: any): number => {
      if (!item) return 0;
      return Object.entries(item)
        .filter(([key]) => key !== 'total' && key !== 'date' && key !== 'id')
        .reduce((sum: number, [, value]) => sum + (Number(value) || 0), 0);
    };

    // Берем только последние данные для каждого типа
    const latestEthereum = ethereumData[0];
    const latestBitcoin = bitcoinData[0];

    // Рассчитываем текущие потоки как сумму всех фондов за последний день
    let ethereumTotal: number = calculateDailyTotal(latestEthereum || {});
    let bitcoinTotal: number = calculateDailyTotal(latestBitcoin || {});

    // Если текущий поток равен 0, берем среднее за последние 7 дней
    if (ethereumTotal === 0 && ethereumData.length > 0) {
      ethereumTotal =
        ethereumData
          .slice(0, Math.min(7, ethereumData.length))
          .reduce((sum, item) => sum + calculateDailyTotal(item), 0) / 7;
    }

    if (bitcoinTotal === 0 && bitcoinData.length > 0) {
      bitcoinTotal =
        bitcoinData
          .slice(0, Math.min(7, bitcoinData.length))
          .reduce((sum, item) => sum + calculateDailyTotal(item), 0) / 7;
    }

    // Считаем общий итог как сумму текущих потоков
    const overallTotal = ethereumTotal + bitcoinTotal;

    // Вычисляем общие активы (total assets) - суммируем все фонды за все дни
    const ethereumTotalAssets = ethereumData.reduce(
      (sum, item) => sum + calculateDailyTotal(item),
      0,
    );

    const bitcoinTotalAssets = bitcoinData.reduce(
      (sum, item) => sum + calculateDailyTotal(item),
      0,
    );

    return {
      ethereum: {
        total: ethereumTotal,
        totalAssets: ethereumTotalAssets,
        count: ethereumData.length,
        average:
          ethereumData.length > 0
            ? ethereumData.reduce((sum, item) => sum + (item.total || 0), 0) /
              ethereumData.length
            : 0,
        latestDate: latestEthereum?.date || null,
      },
      bitcoin: {
        total: bitcoinTotal,
        totalAssets: bitcoinTotalAssets,
        count: bitcoinData.length,
        average:
          bitcoinData.length > 0
            ? bitcoinData.reduce((sum, item) => sum + (item.total || 0), 0) /
              bitcoinData.length
            : 0,
        latestDate: latestBitcoin?.date || null,
      },
      overall: {
        total: overallTotal,
        totalAssets: ethereumTotalAssets + bitcoinTotalAssets,
        count: ethereumData.length + bitcoinData.length,
        latestDate: latestEthereum?.date || latestBitcoin?.date || null,
      },
    };
  }

  /**
   * Возвращает суммы потоков за последние 7 записей для ETH и BTC
   * Также возвращает объединённую серию (ETH+BTC) и массив дат в хронологическом порядке
   */
  @Get('last7')
  async getLast7Totals() {
    // берём последние 7 по каждой таблице
    const [ethRows, btcRows] = await Promise.all([
      this.prisma.eTFFlow.findMany({ orderBy: { date: 'desc' }, take: 7 }),
      this.prisma.bTCFlow.findMany({ orderBy: { date: 'desc' }, take: 7 }),
    ]);

    // Функция для расчета суммы всех фондов за день (исключая total и date)
    const calculateDailyTotal = (item: any): number => {
      if (!item) return 0;
      return Object.entries(item)
        .filter(([key]) => key !== 'total' && key !== 'date' && key !== 'id')
        .reduce((sum: number, [, value]) => sum + (Number(value) || 0), 0);
    };

    // Берем последние данные для суммарных активов
    const latestEthereum = ethRows[0];
    const latestBitcoin = btcRows[0];

    // Рассчитываем суммарные активы (total assets) - это накопительная сумма всех фондов
    const ethereumTotalAssets = latestEthereum
      ? calculateDailyTotal(latestEthereum)
      : 0;
    const bitcoinTotalAssets = latestBitcoin
      ? calculateDailyTotal(latestBitcoin)
      : 0;

    // Рассчитываем дневные потоки для графика (разности между соседними днями)
    const ethSeriesDesc = ethRows.map((r) => ({
      date: r.date.toISOString().split('T')[0],
      totalAssets: calculateDailyTotal(r),
    }));
    const btcSeriesDesc = btcRows.map((r) => ({
      date: r.date.toISOString().split('T')[0],
      totalAssets: calculateDailyTotal(r),
    }));

    const ethSeries = ethSeriesDesc.reverse();
    const btcSeries = btcSeriesDesc.reverse();

    // Рассчитываем дневные потоки как разности
    const ethereumDailyFlows: number[] = [];
    const bitcoinDailyFlows: number[] = [];
    const dates: string[] = [];

    for (let i = 0; i < Math.max(ethSeries.length, btcSeries.length); i++) {
      const ethItem = ethSeries[i];
      const btcItem = btcSeries[i];

      if (ethItem || btcItem) {
        const date = ethItem?.date || btcItem?.date;
        dates.push(date);

        // Рассчитываем дневной поток как разность с предыдущим днем
        const prevEthAssets = i > 0 ? ethSeries[i - 1]?.totalAssets || 0 : 0;
        const prevBtcAssets = i > 0 ? btcSeries[i - 1]?.totalAssets || 0 : 0;

        const ethDailyFlow = (ethItem?.totalAssets || 0) - prevEthAssets;
        const btcDailyFlow = (btcItem?.totalAssets || 0) - prevBtcAssets;

        ethereumDailyFlows.push(ethDailyFlow);
        bitcoinDailyFlows.push(btcDailyFlow);
      }
    }

    return {
      // Суммарные активы (total assets) за последний день
      ethereum: {
        totalAssets: ethereumTotalAssets,
        dailyFlow: ethereumDailyFlows[ethereumDailyFlows.length - 1] || 0,
      },
      bitcoin: {
        totalAssets: bitcoinTotalAssets,
        dailyFlow: bitcoinDailyFlows[bitcoinDailyFlows.length - 1] || 0,
      },
      // Данные для графика за последние 7 дней
      chart: {
        dates,
        ethereumDailyFlows,
        bitcoinDailyFlows,
      },
    };
  }

  @Get('holdings')
  async getFundHoldings() {
    const ethereumData: ETFFlowData[] =
      await this.etfFlowService.getETFFlowData('ethereum');
    const bitcoinData: BTCFlowData[] =
      await this.etfFlowService.getETFFlowData('bitcoin');

    // Создаем объект для хранения суммарного владения каждого фонда
    const fundHoldings: Record<string, { eth: number; btc: number }> = {
      blackrock: { eth: 0, btc: 0 },
      fidelity: { eth: 0, btc: 0 },
      bitwise: { eth: 0, btc: 0 },
      twentyOneShares: { eth: 0, btc: 0 },
      vanEck: { eth: 0, btc: 0 },
      invesco: { eth: 0, btc: 0 },
      franklin: { eth: 0, btc: 0 },
      grayscale: { eth: 0, btc: 0 },
      grayscaleCrypto: { eth: 0, btc: 0 },
    };

    // Добавляем Bitcoin-специфичные фонды
    const bitcoinFundHoldings: Record<string, { eth: number; btc: number }> = {
      valkyrie: { eth: 0, btc: 0 },
      wisdomTree: { eth: 0, btc: 0 },
    };

    // Суммируем все потоки Ethereum для каждого фонда
    ethereumData.forEach((item) => {
      fundHoldings.blackrock.eth += item.blackrock || 0;
      fundHoldings.fidelity.eth += item.fidelity || 0;
      fundHoldings.bitwise.eth += item.bitwise || 0;
      fundHoldings.twentyOneShares.eth += item.twentyOneShares || 0;
      fundHoldings.vanEck.eth += item.vanEck || 0;
      fundHoldings.invesco.eth += item.invesco || 0;
      fundHoldings.franklin.eth += item.franklin || 0;
      fundHoldings.grayscale.eth += item.grayscale || 0;
      fundHoldings.grayscaleCrypto.eth += item.grayscaleCrypto || 0;
      // Valkyrie и WisdomTree нет в Ethereum ETF
    });

    // Суммируем все потоки Bitcoin для каждого фонда
    bitcoinData.forEach((item) => {
      fundHoldings.blackrock.btc += item.blackrock || 0;
      fundHoldings.fidelity.btc += item.fidelity || 0;
      fundHoldings.bitwise.btc += item.bitwise || 0;
      fundHoldings.twentyOneShares.btc += item.twentyOneShares || 0;
      fundHoldings.vanEck.btc += item.vanEck || 0;
      fundHoldings.invesco.btc += item.invesco || 0;
      fundHoldings.franklin.btc += item.franklin || 0;
      fundHoldings.grayscale.btc += item.grayscale || 0;
      fundHoldings.grayscaleCrypto.btc += item.grayscaleCrypto || 0;
      // Для Bitcoin данных добавляем специфичные фонды
      const btcItem = item as any;
      bitcoinFundHoldings.valkyrie.btc += btcItem.valkyrie || 0;
      bitcoinFundHoldings.wisdomTree.btc += btcItem.wisdomTree || 0;
    });

    // Объединяем общие фонды с Bitcoin-специфичными
    const allFundHoldings = { ...fundHoldings, ...bitcoinFundHoldings };

    // Округляем значения до 1 знака после запятой
    Object.keys(allFundHoldings).forEach((fund) => {
      allFundHoldings[fund].eth =
        Math.round(allFundHoldings[fund].eth * 10) / 10;
      allFundHoldings[fund].btc =
        Math.round(allFundHoldings[fund].btc * 10) / 10;
    });

    // Рассчитываем общие суммы без базовой суммы
    const totalEth = Object.values(allFundHoldings).reduce(
      (sum, fund) => sum + fund.eth,
      0,
    );
    const totalBtc = Object.values(allFundHoldings).reduce(
      (sum, fund) => sum + fund.btc,
      0,
    );

    return {
      fundHoldings: allFundHoldings,
      summary: {
        totalEth: Math.round(totalEth * 10) / 10,
        totalBtc: Math.round(totalBtc * 10) / 10,
        totalHoldings: Math.round((totalEth + totalBtc) * 10) / 10,
        fundCount: Object.keys(allFundHoldings).length,
      },
    };
  }

  @Post('parse')
  async parseETFFlowData() {
    return await this.etfFlowService.parseAllETFFlowData();
  }

  @Post('parse-ethereum')
  async parseEthereumETFFlowData() {
    const data = await this.etfFlowService.parseETFFlowData('ethereum');
    await this.etfFlowService.saveETFFlowData('ethereum', data);
    return { success: true, count: data.length };
  }

  @Post('parse-bitcoin')
  async parseBitcoinETFFlowData() {
    const data = await this.etfFlowService.parseETFFlowData('bitcoin');
    await this.etfFlowService.saveETFFlowData('bitcoin', data);
    return { success: true, count: data.length };
  }

  @Post('update-now')
  async updateETFDataNow() {
    await this.etfSchedulerService.manualUpdate();
    return {
      success: true,
      message: 'ETF данные обновляются в фоновом режиме',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Специальный эндпоинт для виджета iOS
   * Возвращает все необходимые данные в одном запросе
   */
  @Get('widget')
  async getWidgetData() {
    try {
      // Используем ту же логику, что и в summary API
      const ethereumData: ETFFlowData[] =
        await this.etfFlowService.getETFFlowData('ethereum');
      const bitcoinData: BTCFlowData[] =
        await this.etfFlowService.getETFFlowData('bitcoin');

      // Функция для получения дневного притока (используем поле total)
      const getDailyFlow = (item: any): number => {
        if (!item) return 0;
        return Math.round((Number(item.total) || 0) * 100) / 100;
      };

      // Функция для расчета суммы всех фондов за день (исключая total и date)
      const calculateDailyTotal = (item: any): number => {
        if (!item) return 0;
        return Object.entries(item)
          .filter(([key]) => key !== 'total' && key !== 'date' && key !== 'id')
          .reduce((sum: number, [, value]) => sum + (Number(value) || 0), 0);
      };

      // Берем только последние данные для каждого типа
      const latestEthereum = ethereumData[0];
      const latestBitcoin = bitcoinData[0];

      // Рассчитываем текущие потоки как сумму всех фондов за последний день
      let ethereumDailyFlow: number = getDailyFlow(latestEthereum || {});
      let bitcoinDailyFlow: number = getDailyFlow(latestBitcoin || {});

      // Если текущий поток равен 0, берем среднее за последние 10 дней
      if (ethereumDailyFlow === 0 && ethereumData.length > 0) {
        ethereumDailyFlow =
          ethereumData
            .slice(0, Math.min(10, ethereumData.length))
            .reduce((sum, item) => sum + getDailyFlow(item), 0) / 10;
      }

      if (bitcoinDailyFlow === 0 && bitcoinData.length > 0) {
        bitcoinDailyFlow =
          bitcoinData
            .slice(0, Math.min(10, bitcoinData.length))
            .reduce((sum, item) => sum + getDailyFlow(item), 0) / 10;
      }

      // Считаем общий итог как сумму текущих потоков
      const totalFlow =
        Math.round((ethereumDailyFlow + bitcoinDailyFlow) * 100) / 100;

      // Вычисляем общие активы (total assets) - суммируем все фонды за все дни
      const ethereumTotalAssets =
        Math.round(
          ethereumData.reduce(
            (sum, item) => sum + calculateDailyTotal(item),
            0,
          ) * 100,
        ) / 100;

      const bitcoinTotalAssets =
        Math.round(
          bitcoinData.reduce(
            (sum, item) => sum + calculateDailyTotal(item),
            0,
          ) * 100,
        ) / 100;

      // Для графика берем последние 10 дней и рассчитываем дневные потоки
      const ethLast10 = ethereumData.slice(0, 10);
      const btcLast10 = bitcoinData.slice(0, 10);

      // Рассчитываем дневные потоки для графика
      const ethereumDailyFlows: number[] = [];
      const bitcoinDailyFlows: number[] = [];
      const dates: string[] = [];

      for (let i = 0; i < Math.max(ethLast10.length, btcLast10.length); i++) {
        const ethItem = ethLast10[i];
        const btcItem = btcLast10[i];

        if (ethItem || btcItem) {
          const date = ethItem?.date || btcItem?.date;
          dates.push(date);

          // Дневной поток - это значение поля total
          const ethDailyFlow = ethItem ? getDailyFlow(ethItem) : 0;
          const btcDailyFlow = btcItem ? getDailyFlow(btcItem) : 0;

          ethereumDailyFlows.push(ethDailyFlow);
          bitcoinDailyFlows.push(btcDailyFlow);
        }
      }

      // Объединяем потоки для общего графика
      const combinedDailyFlows: number[] = [];
      const maxLength = Math.max(
        ethereumDailyFlows.length,
        bitcoinDailyFlows.length,
      );
      for (let i = 0; i < maxLength; i++) {
        const ethFlow =
          i < ethereumDailyFlows.length ? ethereumDailyFlows[i] : 0;
        const btcFlow = i < bitcoinDailyFlows.length ? bitcoinDailyFlows[i] : 0;
        combinedDailyFlows.push(Math.round((ethFlow + btcFlow) * 100) / 100);
      }

      return {
        // Основные данные для отображения
        bitcoin: {
          totalAssets: bitcoinTotalAssets,
          dailyFlow: bitcoinDailyFlow,
          latestDate: latestBitcoin?.date || null,
        },
        ethereum: {
          totalAssets: ethereumTotalAssets,
          dailyFlow: ethereumDailyFlow,
          latestDate: latestEthereum?.date || null,
        },
        overall: {
          totalFlow: totalFlow,
          isPositive: totalFlow >= 0,
          lastUpdated: new Date().toISOString(),
        },
        // Данные для графика за 10 дней
        chart: {
          dates: dates,
          ethereumDailyFlows: ethereumDailyFlows,
          bitcoinDailyFlows: bitcoinDailyFlows,
          combinedDailyFlows: combinedDailyFlows,
        },
      };
    } catch (error) {
      console.error('Ошибка при получении данных виджета:', error);
      throw error;
    }
  }
}
