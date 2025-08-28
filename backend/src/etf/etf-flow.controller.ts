import { Controller, Get, Post } from '@nestjs/common';
import { UniversalETFFlowService } from './universal-etf-flow.service';

@Controller('etf-flow')
export class ETFFlowController {
  constructor(private readonly etfFlowService: UniversalETFFlowService) {}

  @Get()
  async getETFFlowData() {
    return await this.etfFlowService.getETFFlowData('ethereum');
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
    const ethereumData = await this.etfFlowService.getETFFlowData('ethereum');
    const bitcoinData = await this.etfFlowService.getETFFlowData('bitcoin');

    const ethereumTotal = ethereumData.reduce(
      (sum, item) => sum + (item.total || 0),
      0,
    );
    const bitcoinTotal = bitcoinData.reduce(
      (sum, item) => sum + (item.total || 0),
      0,
    );

    return {
      ethereum: {
        total: ethereumTotal,
        count: ethereumData.length,
        average:
          ethereumData.length > 0 ? ethereumTotal / ethereumData.length : 0,
      },
      bitcoin: {
        total: bitcoinTotal,
        count: bitcoinData.length,
        average: bitcoinData.length > 0 ? bitcoinTotal / bitcoinData.length : 0,
      },
      overall: {
        total: ethereumTotal + bitcoinTotal,
        count: ethereumData.length + bitcoinData.length,
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
}
