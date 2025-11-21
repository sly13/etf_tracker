import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { UniversalETFFlowService } from './universal-etf-flow.service';
import type { ETFFlowData, BTCFlowData, SolFlowData } from './etf-types';
import { ETFSchedulerService } from './etf-scheduler.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Controller('etf-flow')
export class ETFFlowController {
  private readonly logger = new Logger(ETFFlowController.name);

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

  // Получить данные Solana ETF
  @Get('solana')
  async getSolanaETFFlowData() {
    try {
      this.logger.log('Запрос данных Solana ETF');
      const data = await this.etfFlowService.getETFFlowData('solana');
      this.logger.log(`Успешно получено ${data.length} записей Solana ETF`);
      return data;
    } catch (error) {
      this.logger.error('Ошибка при получении данных Solana ETF:', error);
      this.logger.error(`Stack trace: ${error.stack}`);

      // Возвращаем информативную ошибку вместо простого throw
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка загрузки данных Solana ETF',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

    // Получаем данные Solana за день
    const solanaData = await this.prisma.solFlow.findUnique({
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
      solana: solanaData
        ? {
            bitwise: (solanaData as any).bitwise || 0,
            vanEck: (solanaData as any).vanEck || 0,
            fidelity: (solanaData as any).fidelity || 0,
            twentyOneShares: (solanaData as any).twentyOneShares || 0,
            grayscale: (solanaData as any).grayscale || 0,
            total: (solanaData as any).total || 0,
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

    // Даты seed данных, которые нужно исключить из расчетов
    const seedDates = {
      ethereum: '2024-07-22',
      solana: '2025-10-27',
    };

    // Вычисляем общие активы (total assets) - суммируем все фонды за все дни
    // Исключаем seed данные из расчетов
    const ethereumTotalAssets = ethereumData
      .filter((item) => item.date !== seedDates.ethereum)
      .reduce((sum, item) => sum + calculateDailyTotal(item), 0);

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
    const solanaData: SolFlowData[] =
      await this.etfFlowService.getETFFlowData('solana');

    // Даты seed данных, которые нужно исключить из расчетов
    const seedDates = {
      ethereum: '2024-07-22',
      solana: '2025-10-27',
    };

    // Исключаем seed данные из расчетов
    const filteredEthereumData = ethereumData.filter(
      (item) => item.date !== seedDates.ethereum,
    );
    const filteredSolanaData = solanaData.filter(
      (item) => item.date !== seedDates.solana,
    );

    // Создаем объект для хранения суммарного владения каждого фонда
    const fundHoldings: Record<
      string,
      { eth: number; btc: number; sol: number }
    > = {
      blackrock: { eth: 0, btc: 0, sol: 0 },
      fidelity: { eth: 0, btc: 0, sol: 0 },
      bitwise: { eth: 0, btc: 0, sol: 0 },
      twentyOneShares: { eth: 0, btc: 0, sol: 0 },
      vanEck: { eth: 0, btc: 0, sol: 0 },
      invesco: { eth: 0, btc: 0, sol: 0 },
      franklin: { eth: 0, btc: 0, sol: 0 },
      grayscale: { eth: 0, btc: 0, sol: 0 },
      grayscaleCrypto: { eth: 0, btc: 0, sol: 0 },
    };

    // Добавляем Bitcoin-специфичные фонды
    const bitcoinFundHoldings: Record<
      string,
      { eth: number; btc: number; sol: number }
    > = {
      valkyrie: { eth: 0, btc: 0, sol: 0 },
      wisdomTree: { eth: 0, btc: 0, sol: 0 },
    };

    // Суммируем все потоки Ethereum для каждого фонда (исключая seed данные)
    filteredEthereumData.forEach((item) => {
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

    // Суммируем все потоки Solana для каждого фонда (исключая seed данные)
    filteredSolanaData.forEach((item) => {
      fundHoldings.bitwise.sol += item.bitwise || 0;
      fundHoldings.vanEck.sol += item.vanEck || 0;
      fundHoldings.fidelity.sol += item.fidelity || 0;
      fundHoldings.twentyOneShares.sol += item.twentyOneShares || 0;
      fundHoldings.grayscale.sol += item.grayscale || 0;
    });

    // Объединяем общие фонды с Bitcoin-специфичными
    const allFundHoldings = { ...fundHoldings, ...bitcoinFundHoldings };

    // Округляем значения до 1 знака после запятой
    Object.keys(allFundHoldings).forEach((fund) => {
      allFundHoldings[fund].eth =
        Math.round(allFundHoldings[fund].eth * 10) / 10;
      allFundHoldings[fund].btc =
        Math.round(allFundHoldings[fund].btc * 10) / 10;
      allFundHoldings[fund].sol =
        Math.round(allFundHoldings[fund].sol * 10) / 10;
    });

    // Рассчитываем общие суммы - используем тот же метод, что и в summary
    // для консистентности: суммируем все потоки за все дни через calculateDailyTotal
    const calculateDailyTotal = (item: any): number => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { total: _total, date: _date, ...funds } = item;
      const numericFunds: Record<string, number> = funds;
      return Object.values(numericFunds).reduce(
        (sum: number, value: number) => sum + (value || 0),
        0,
      );
    };

    // Пересчитываем totals используя тот же метод, что и в summary
    const totalEth = filteredEthereumData.reduce(
      (sum, item) => sum + calculateDailyTotal(item),
      0,
    );
    const totalBtc = bitcoinData.reduce(
      (sum, item) => sum + calculateDailyTotal(item),
      0,
    );
    const totalSol = filteredSolanaData.reduce(
      (sum, item) => sum + calculateDailyTotal(item),
      0,
    );

    return {
      fundHoldings: allFundHoldings,
      summary: {
        totalEth: Math.round(totalEth * 10) / 10,
        totalBtc: Math.round(totalBtc * 10) / 10,
        totalSol: Math.round(totalSol * 10) / 10,
        totalHoldings: Math.round((totalEth + totalBtc + totalSol) * 10) / 10,
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

  @Post('parse-solana')
  async parseSolanaETFFlowData() {
    const data = await this.etfFlowService.parseETFFlowData('solana');
    await this.etfFlowService.saveETFFlowData('solana', data);
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
      const solanaData: SolFlowData[] =
        await this.etfFlowService.getETFFlowData('solana');

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
      const latestSolana = solanaData[0];

      // Рассчитываем текущие потоки как сумму всех фондов за последний день
      let ethereumDailyFlow: number = getDailyFlow(latestEthereum || {});
      let bitcoinDailyFlow: number = getDailyFlow(latestBitcoin || {});
      let solanaDailyFlow: number = getDailyFlow(latestSolana || {});

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

      if (solanaDailyFlow === 0 && solanaData.length > 0) {
        solanaDailyFlow =
          solanaData
            .slice(0, Math.min(10, solanaData.length))
            .reduce((sum, item) => sum + getDailyFlow(item), 0) / 10;
      }

      // Считаем общий итог как сумму текущих потоков
      const totalFlow =
        Math.round(
          (ethereumDailyFlow + bitcoinDailyFlow + solanaDailyFlow) * 100,
        ) / 100;

      // Даты seed данных, которые нужно исключить из расчетов
      const seedDates = {
        ethereum: '2024-07-22',
        solana: '2025-10-27',
      };

      // Вычисляем общие активы (total assets) - суммируем все фонды за все дни
      // Исключаем seed данные из расчетов
      const ethereumTotalAssets =
        Math.round(
          ethereumData
            .filter((item) => item.date !== seedDates.ethereum)
            .reduce((sum, item) => sum + calculateDailyTotal(item), 0) * 100,
        ) / 100;

      const bitcoinTotalAssets =
        Math.round(
          bitcoinData.reduce(
            (sum, item) => sum + calculateDailyTotal(item),
            0,
          ) * 100,
        ) / 100;

      const solanaTotalAssets =
        Math.round(
          solanaData
            .filter((item) => item.date !== seedDates.solana)
            .reduce((sum, item) => sum + calculateDailyTotal(item), 0) * 100,
        ) / 100;

      // Для графика берем последние 10 дней и рассчитываем дневные потоки
      const ethLast10 = ethereumData.slice(0, 10);
      const btcLast10 = bitcoinData.slice(0, 10);
      const solLast10 = solanaData.slice(0, 10);

      // Рассчитываем дневные потоки для графика
      const ethereumDailyFlows: number[] = [];
      const bitcoinDailyFlows: number[] = [];
      const solanaDailyFlows: number[] = [];
      const dates: string[] = [];

      const maxLength = Math.max(
        ethLast10.length,
        btcLast10.length,
        solLast10.length,
      );

      for (let i = 0; i < maxLength; i++) {
        const ethItem = ethLast10[i];
        const btcItem = btcLast10[i];
        const solItem = solLast10[i];

        if (ethItem || btcItem || solItem) {
          const date = ethItem?.date || btcItem?.date || solItem?.date;
          dates.push(date);

          // Дневной поток - это значение поля total
          const ethDailyFlow = ethItem ? getDailyFlow(ethItem) : 0;
          const btcDailyFlow = btcItem ? getDailyFlow(btcItem) : 0;
          const solDailyFlow = solItem ? getDailyFlow(solItem) : 0;

          ethereumDailyFlows.push(ethDailyFlow);
          bitcoinDailyFlows.push(btcDailyFlow);
          solanaDailyFlows.push(solDailyFlow);
        }
      }

      // Объединяем потоки для общего графика (включая Solana)
      const combinedDailyFlows: number[] = [];
      for (let i = 0; i < maxLength; i++) {
        const ethFlow =
          i < ethereumDailyFlows.length ? ethereumDailyFlows[i] : 0;
        const btcFlow = i < bitcoinDailyFlows.length ? bitcoinDailyFlows[i] : 0;
        const solFlow = i < solanaDailyFlows.length ? solanaDailyFlows[i] : 0;
        combinedDailyFlows.push(
          Math.round((ethFlow + btcFlow + solFlow) * 100) / 100,
        );
      }

      // Получаем данные по фондам за последний день
      const getFundFlows = (item: any) => {
        if (!item) return {};
        return {
          blackrock: Math.round((Number(item.blackrock) || 0) * 100) / 100,
          fidelity: Math.round((Number(item.fidelity) || 0) * 100) / 100,
          bitwise: Math.round((Number(item.bitwise) || 0) * 100) / 100,
          twentyOneShares:
            Math.round((Number(item.twentyOneShares) || 0) * 100) / 100,
          vanEck: Math.round((Number(item.vanEck) || 0) * 100) / 100,
          invesco: Math.round((Number(item.invesco) || 0) * 100) / 100,
          franklin: Math.round((Number(item.franklin) || 0) * 100) / 100,
          grayscale: Math.round((Number(item.grayscale) || 0) * 100) / 100,
          grayscaleCrypto:
            Math.round(
              (Number(item.grayscaleCrypto || item.grayscaleEth) || 0) * 100,
            ) / 100,
        };
      };

      const getBTCFundFlows = (item: any) => {
        if (!item) return {};
        const base = getFundFlows(item);
        return {
          ...base,
          valkyrie: Math.round((Number(item.valkyrie) || 0) * 100) / 100,
          wisdomTree: Math.round((Number(item.wisdomTree) || 0) * 100) / 100,
        };
      };

      // Для Solana только 5 фондов: bitwise, vanEck, fidelity, twentyOneShares, grayscale
      const getSolFundFlows = (item: any) => {
        if (!item) return {};
        return {
          bitwise: Math.round((Number(item.bitwise) || 0) * 100) / 100,
          vanEck: Math.round((Number(item.vanEck) || 0) * 100) / 100,
          fidelity: Math.round((Number(item.fidelity) || 0) * 100) / 100,
          twentyOneShares:
            Math.round((Number(item.twentyOneShares) || 0) * 100) / 100,
          grayscale: Math.round((Number(item.grayscale) || 0) * 100) / 100,
          // Остальные фонды не используются для Solana, но добавляем их с нулевыми значениями для совместимости
          blackrock: 0,
          invesco: 0,
          franklin: 0,
          grayscaleCrypto: 0,
          valkyrie: 0,
          wisdomTree: 0,
        };
      };

      // Получаем данные из таблицы etf_notification_deliveries
      const notificationDeliveries =
        await this.prisma.eTFNotificationDelivery.findMany({
          take: 100, // Берем последние 100 записей
          orderBy: { createdAt: 'desc' },
          include: {
            record: {
              select: {
                id: true,
                date: true,
                assetType: true,
                company: true,
                amount: true,
              },
            },
            user: {
              select: {
                id: true,
                deviceId: true,
              },
            },
          },
        });

      // Статистика по доставкам
      const deliveriesStats = {
        total: notificationDeliveries.length,
        sent: notificationDeliveries.filter((d) => d.sent).length,
        pending: notificationDeliveries.filter((d) => !d.sent).length,
        withErrors: notificationDeliveries.filter((d) => d.error).length,
        byChannel: {
          push: notificationDeliveries.filter((d) => d.channel === 'push')
            .length,
          telegram: notificationDeliveries.filter(
            (d) => d.channel === 'telegram',
          ).length,
          email: notificationDeliveries.filter((d) => d.channel === 'email')
            .length,
          other: notificationDeliveries.filter(
            (d) =>
              d.channel && !['push', 'telegram', 'email'].includes(d.channel),
          ).length,
        },
      };

      // latestDate уже является строкой в формате "yyyy-MM-dd" из getETFFlowData
      // Используем её напрямую
      return {
        // Основные данные для отображения
        bitcoin: {
          totalAssets: bitcoinTotalAssets,
          dailyFlow: bitcoinDailyFlow,
          latestDate: latestBitcoin?.date || null,
          fundFlows: getBTCFundFlows(latestBitcoin),
        },
        ethereum: {
          totalAssets: ethereumTotalAssets,
          dailyFlow: ethereumDailyFlow,
          latestDate: latestEthereum?.date || null,
          fundFlows: getFundFlows(latestEthereum),
        },
        solana: {
          totalAssets: solanaTotalAssets,
          dailyFlow: solanaDailyFlow,
          latestDate: latestSolana?.date || null,
          fundFlows: getSolFundFlows(latestSolana),
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
          solanaDailyFlows: solanaDailyFlows,
          combinedDailyFlows: combinedDailyFlows,
        },
        // Данные из таблицы etf_notification_deliveries
        notificationDeliveries: {
          deliveries: notificationDeliveries.map((d) => ({
            id: d.id,
            userId: d.userId,
            recordId: d.recordId,
            sent: d.sent,
            sentAt: d.sentAt,
            channel: d.channel,
            error: d.error,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
            record: d.record,
            user: d.user,
          })),
          stats: deliveriesStats,
        },
      };
    } catch (error) {
      console.error('Ошибка при получении данных виджета:', error);
      throw error;
    }
  }

  /**
   * Получить последние N событий притоков/оттоков за сегодня
   * GET /etf-flow/events/today?limit=5
   * Использует таблицу etf_new_records, если есть данные, иначе генерирует из потоков
   * Если за сегодня нет данных, возвращает события за последний доступный день
   */
  @Get('events/today')
  async getTodayEvents(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 5;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Сначала пытаемся получить из etf_new_records
      try {
        // Пытаемся получить ВСЕ события за сегодня, отсортированные по detectedAt (новые сначала)
        // Не ограничиваем количеством, чтобы показать все события за день
        let newRecords = await this.prisma.eTFNewRecord.findMany({
          where: {
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
          orderBy: { detectedAt: 'desc' },
          // Убираем take, чтобы получить все события за день
        });

        // Если за сегодня нет данных, берем последний доступный день
        if (newRecords.length === 0) {
          const latestRecord = await this.prisma.eTFNewRecord.findFirst({
            orderBy: { date: 'desc' },
            select: { date: true },
          });

          if (latestRecord) {
            const latestDate = new Date(latestRecord.date);
            latestDate.setHours(0, 0, 0, 0);
            const latestTomorrow = new Date(latestDate);
            latestTomorrow.setDate(latestTomorrow.getDate() + 1);

            // Получаем ВСЕ события за последний доступный день
            newRecords = await this.prisma.eTFNewRecord.findMany({
              where: {
                date: {
                  gte: latestDate,
                  lt: latestTomorrow,
                },
              },
              orderBy: { detectedAt: 'desc' },
              // Убираем take, чтобы получить все события за день
            });
          }
        }

        // Если все еще нет данных, берем последние N событий по detectedAt (независимо от даты)
        // Здесь используем лимит, так как это fallback для случая, когда нет данных за конкретный день
        if (newRecords.length === 0) {
          newRecords = await this.prisma.eTFNewRecord.findMany({
            orderBy: { detectedAt: 'desc' },
            take: limitNum,
          });
        }

        if (newRecords.length > 0) {
          const events = newRecords.map((record) => {
            const etfName =
              record.assetType === 'bitcoin'
                ? 'Bitcoin ETF'
                : record.assetType === 'ethereum'
                  ? 'Ethereum ETF'
                  : 'Solana ETF';

            // Маппинг названий компаний
            const companyMap: Record<string, string> = {
              blackrock: 'BlackRock',
              fidelity: 'Fidelity',
              bitwise: 'Bitwise',
              twentyOneShares: '21Shares',
              vanEck: 'VanEck',
              invesco: 'Invesco',
              franklin: 'Franklin Templeton',
              grayscale: 'Grayscale',
              grayscaleBtc: 'Grayscale BTC',
              grayscaleEth: 'Grayscale Crypto',
              valkyrie: 'Valkyrie',
              wisdomTree: 'WisdomTree',
            };

            return {
              time: record.detectedAt.toISOString(),
              company: companyMap[record.company] || record.company,
              etf: etfName,
              amount: record.amount,
              date: record.date.toISOString().split('T')[0],
            };
          });

          // Подсчитываем общее количество за тот же день, что и события
          const eventDate = newRecords[0].date;
          const eventDateStart = new Date(eventDate);
          eventDateStart.setHours(0, 0, 0, 0);
          const eventDateEnd = new Date(eventDateStart);
          eventDateEnd.setDate(eventDateEnd.getDate() + 1);

          const totalToday = await this.prisma.eTFNewRecord.count({
            where: {
              date: {
                gte: eventDateStart,
                lt: eventDateEnd,
              },
            },
          });

          return {
            events,
            total: totalToday,
            source: 'etf_new_records',
            date: eventDate.toISOString().split('T')[0],
            isToday: eventDateStart.getTime() === today.getTime(),
          };
        }
      } catch (error: any) {
        // Если таблица не существует или произошла ошибка, возвращаем пустой результат
        if (
          error?.code === 'P2021' ||
          error?.message?.includes('does not exist')
        ) {
          this.logger.warn(
            'Таблица etf_new_records не существует. Возвращаем пустой результат.',
          );
        } else {
          this.logger.error(
            'Ошибка при чтении etf_new_records:',
            error.message,
          );
        }
      }

      // Если нет данных в etf_new_records, возвращаем пустой результат
      // События должны создаваться только через парсинг и сохранение в etf_new_records
      return {
        events: [],
        total: 0,
        source: 'etf_new_records',
        date: today.toISOString().split('T')[0],
        isToday: true,
      };
    } catch (error) {
      this.logger.error('Ошибка при получении событий за сегодня:', error);
      throw new HttpException(
        {
          message: 'Ошибка при получении событий за сегодня',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Получить все события притоков/оттоков с пагинацией
   * GET /etf-flow/events?page=1&limit=20
   * Использует таблицу etf_new_records, если есть данные, иначе генерирует из потоков
   */
  @Get('events')
  async getAllEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 50; // Увеличено с 20 до 50 по умолчанию
      const skip = (pageNum - 1) * limitNum;

      // Получаем данные только из etf_new_records
      try {
        const total = await this.prisma.eTFNewRecord.count();
        const newRecords = await this.prisma.eTFNewRecord.findMany({
          orderBy: { detectedAt: 'desc' },
          skip,
          take: limitNum,
        });

        const companyMap: Record<string, string> = {
          blackrock: 'BlackRock',
          fidelity: 'Fidelity',
          bitwise: 'Bitwise',
          twentyOneShares: '21Shares',
          vanEck: 'VanEck',
          invesco: 'Invesco',
          franklin: 'Franklin Templeton',
          grayscale: 'Grayscale',
          grayscaleBtc: 'Grayscale BTC',
          grayscaleEth: 'Grayscale Crypto',
          valkyrie: 'Valkyrie',
          wisdomTree: 'WisdomTree',
        };

        const events = newRecords.map((record) => {
          const etfName =
            record.assetType === 'bitcoin'
              ? 'Bitcoin ETF'
              : record.assetType === 'ethereum'
                ? 'Ethereum ETF'
                : 'Solana ETF';

          return {
            time: record.detectedAt.toISOString(),
            company: companyMap[record.company] || record.company,
            etf: etfName,
            amount: record.amount,
            date: record.date.toISOString().split('T')[0],
          };
        });

        const hasMore = skip + limitNum < total;

        return {
          events,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            hasMore,
          },
          source: 'etf_new_records',
        };
      } catch (error: any) {
        // Если таблица не существует или произошла ошибка, возвращаем пустой результат
        if (
          error?.code === 'P2021' ||
          error?.message?.includes('does not exist')
        ) {
          this.logger.warn(
            'Таблица etf_new_records не существует. Возвращаем пустой результат.',
          );
        } else {
          this.logger.error(
            'Ошибка при чтении etf_new_records:',
            error.message,
          );
        }

        return {
          events: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            hasMore: false,
          },
          source: 'etf_new_records',
        };
      }

      // Удален fallback: больше не генерируем события из таблиц потоков
      // События должны создаваться только через парсинг и сохранение в etf_new_records
    } catch (error) {
      this.logger.error('Ошибка при получении всех событий:', error);
      throw new HttpException(
        {
          message: 'Ошибка при получении всех событий',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('new-records')
  async getNewRecords(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 50;
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (search) {
        where.OR = [
          { company: { contains: search, mode: 'insensitive' } },
          { assetType: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [records, total] = await Promise.all([
        this.prisma.eTFNewRecord.findMany({
          where,
          orderBy: { detectedAt: 'desc' },
          skip,
          take: limitNum,
        }),
        this.prisma.eTFNewRecord.count({ where }),
      ]);

      return {
        success: true,
        records,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          hasMore: skip + limitNum < total,
        },
      };
    } catch (error: any) {
      this.logger.error('Ошибка при получении новых записей ETF:', error);
      throw new HttpException(
        {
          message: 'Ошибка при получении новых записей ETF',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('new-records/:id')
  async deleteNewRecord(@Param('id') id: string) {
    try {
      // Проверяем, существует ли запись
      const record = await this.prisma.eTFNewRecord.findUnique({
        where: { id },
      });

      if (!record) {
        throw new HttpException(
          {
            message: 'Запись не найдена',
            error: 'Record not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Удаляем запись (каскадное удаление доставок произойдет автоматически)
      await this.prisma.eTFNewRecord.delete({
        where: { id },
      });

      this.logger.log(`Запись ETFNewRecord удалена: ${id}`);

      return {
        success: true,
        message: 'Запись успешно удалена',
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Ошибка при удалении записи ETF:', error);
      throw new HttpException(
        {
          message: 'Ошибка при удалении записи ETF',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('notification-deliveries')
  async getNotificationDeliveries(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sent') sent?: string,
    @Query('channel') channel?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 50;
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (search) {
        where.OR = [
          { record: { company: { contains: search, mode: 'insensitive' } } },
          { record: { assetType: { contains: search, mode: 'insensitive' } } },
          { user: { deviceId: { contains: search, mode: 'insensitive' } } },
        ];
      }

      if (sent !== undefined) {
        where.sent = sent === 'true';
      }

      if (channel) {
        where.channel = channel;
      }

      const [deliveries, total] = await Promise.all([
        this.prisma.eTFNotificationDelivery.findMany({
          where,
          include: {
            record: {
              select: {
                id: true,
                date: true,
                assetType: true,
                company: true,
                amount: true,
                previousAmount: true,
              },
            },
            user: {
              select: {
                id: true,
                deviceId: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        this.prisma.eTFNotificationDelivery.count({ where }),
      ]);

      return {
        success: true,
        deliveries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          hasMore: skip + limitNum < total,
        },
      };
    } catch (error: any) {
      this.logger.error('Ошибка при получении доставок уведомлений:', error);
      throw new HttpException(
        {
          message: 'Ошибка при получении доставок уведомлений',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
