import { Controller, Get, Post } from '@nestjs/common';
import { UniversalETFFlowService, ETFFlowData, BTCFlowData } from './universal-etf-flow.service';
import { ETFSchedulerService } from './etf-scheduler.service';

@Controller('etf-flow')
export class ETFFlowController {
  constructor(
    private readonly etfFlowService: UniversalETFFlowService,
    private readonly etfSchedulerService: ETFSchedulerService,
  ) {}

  @Get()
  async getETFFlowData() {
    // Возвращаем общие данные для всех ETF
    const ethereumData = await this.etfFlowService.getETFFlowData('ethereum') as ETFFlowData[];
    const bitcoinData = await this.etfFlowService.getETFFlowData('bitcoin') as BTCFlowData[];

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

  @Get('bitcoin')
  async getBitcoinETFFlowData() {
    return await this.etfFlowService.getETFFlowData('bitcoin');
  }

  @Get('summary')
  async getETFFlowSummary() {
    const ethereumData = await this.etfFlowService.getETFFlowData('ethereum') as ETFFlowData[];
    const bitcoinData = await this.etfFlowService.getETFFlowData('bitcoin') as BTCFlowData[];

    // Берем только последние данные для каждого типа
    const latestEthereum = ethereumData[0];
    const latestBitcoin = bitcoinData[0];

    // Если total равен 0 или null, используем сумму всех потоков за последние 7 дней
    let ethereumTotal = latestEthereum?.total || 0;
    let bitcoinTotal = latestBitcoin?.total || 0;

    // Если total равен 0, берем сумму за последние 7 дней
    if (ethereumTotal === 0 && ethereumData.length > 0) {
      ethereumTotal = ethereumData
        .slice(0, Math.min(7, ethereumData.length))
        .reduce((sum, item) => sum + (item.total || 0), 0);
    }

    if (bitcoinTotal === 0 && bitcoinData.length > 0) {
      bitcoinTotal = bitcoinData
        .slice(0, Math.min(7, bitcoinData.length))
        .reduce((sum, item) => sum + (item.total || 0), 0);
    }

    // Считаем общий итог как сумму текущих потоков
    const overallTotal = ethereumTotal + bitcoinTotal;

    return {
      ethereum: {
        total: ethereumTotal,
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
        count: ethereumData.length + bitcoinData.length,
        latestDate: latestEthereum?.date || latestBitcoin?.date || null,
      },
    };
  }

  @Get('holdings')
  async getFundHoldings() {
    const ethereumData = await this.etfFlowService.getETFFlowData('ethereum') as ETFFlowData[];
    const bitcoinData = await this.etfFlowService.getETFFlowData('bitcoin') as BTCFlowData[];

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
      // Для Bitcoin данных нужно проверить наличие полей
      const btcItem = item as any;
      fundHoldings.valkyrie.btc += btcItem.valkyrie || 0;
      fundHoldings.wisdomTree.btc += btcItem.wisdomTree || 0;
    });

    // Округляем значения до 2 знаков после запятой
    Object.keys(fundHoldings).forEach((fund) => {
      fundHoldings[fund].eth = Math.round(fundHoldings[fund].eth * 100) / 100;
      fundHoldings[fund].btc = Math.round(fundHoldings[fund].btc * 100) / 100;
    });

    return {
      fundHoldings,
      summary: {
        totalEth:
          Math.round(
            Object.values(fundHoldings).reduce(
              (sum, fund) => sum + fund.eth,
              0,
            ) * 100,
          ) / 100,
        totalBtc:
          Math.round(
            Object.values(fundHoldings).reduce(
              (sum, fund) => sum + fund.btc,
              0,
            ) * 100,
          ) / 100,
        totalHoldings:
          Math.round(
            Object.values(fundHoldings).reduce(
              (sum, fund) => sum + fund.eth + fund.btc,
              0,
            ) * 100,
          ) / 100,
        fundCount: Object.keys(fundHoldings).length,
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
}
