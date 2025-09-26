import { Injectable, Logger } from '@nestjs/common';
import { UniversalETFFlowService } from '../../etf/universal-etf-flow.service';

@Injectable()
export class ETFService {
  private readonly logger = new Logger(ETFService.name);

  constructor(private etfFlowService: UniversalETFFlowService) {}

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateString; // Возвращаем исходную строку если не удалось распарсить
    }
  }

  async getEthereumData(): Promise<string> {
    try {
      const ethereumData = await this.etfFlowService.getETFFlowData('ethereum');

      if (!ethereumData || ethereumData.length === 0) {
        return '📊 <b>Ethereum ETF Data</b>\n\n❌ No data available at the moment.';
      }

      const latestData = ethereumData[0] as any;
      const totalFlow = latestData.total || 0;

      // Calculate 7-day total
      const sevenDayData = ethereumData.slice(0, 7);
      const sevenDayTotal = sevenDayData.reduce(
        (sum, day) => (sum as number) + Number(day.total || 0),
        0 as number,
      );

      // Calculate 30-day total
      const thirtyDayData = ethereumData.slice(0, 30);
      const thirtyDayTotal = thirtyDayData.reduce(
        (sum, day) => sum + Number(day.total || 0),
        0 as number,
      );

      // Calculate total for all days for each fund
      const totalBlackrock = ethereumData.reduce(
        (sum, day) => (sum as number) + Number(day.blackrock || 0),
        0 as any,
      );
      const totalFidelity = ethereumData.reduce(
        (sum, day) => (sum as number) + Number(day.fidelity || 0),
        0 as any,
      );
      const totalBitwise = ethereumData.reduce(
        (sum, day) => (sum as number) + Number(day.bitwise || 0),
        0 as any,
      );
      const totalTwentyOneShares = ethereumData.reduce(
        (sum, day) => (sum as number) + Number(day.twentyOneShares || 0),
        0 as number,
      );
      const totalVanEck = ethereumData.reduce(
        (sum, day) => (sum as number) + Number(day.vanEck || 0),
        0 as number,
      );
      const totalInvesco = ethereumData.reduce(
        (sum, day) => (sum as number) + Number(day.invesco || 0),
        0 as number,
      );
      const totalFranklin = ethereumData.reduce(
        (sum, day) => (sum as number) + Number(day.franklin || 0),
        0 as number,
      );
      const totalGrayscale = ethereumData.reduce(
        (sum, day) => (sum as number) + Number(day.grayscale || 0),
        0 as number,
      );
      const totalGrayscaleCrypto = ethereumData.reduce(
        (sum, day) => (sum as number) + Number(day.grayscaleCrypto || 0),
        0 as number,
      );

      return `
📊 <b>Ethereum ETF Flow Data</b>

📅 <b>Latest Data (${this.formatDate(latestData.date)}):</b>
💰 Total Flow: <b>${(totalFlow / 1000000).toFixed(1)}M</b>

📈 <b>7-Day Total:</b>
📊 Total Flow: <b>${(Number(sevenDayTotal) / 1000000).toFixed(1)}M</b>

📅 <b>30-Day Total:</b>
📊 Total Flow: <b>${(Number(thirtyDayTotal) / 1000000).toFixed(1)}M</b>

🏢 <b>Top Performers:</b>
• BlackRock: ${((latestData.blackrock || 0) / 1000000).toFixed(1)}M
• Fidelity: ${((latestData.fidelity || 0) / 1000000).toFixed(1)}M
• Bitwise: ${((latestData.bitwise || 0) / 1000000).toFixed(1)}M
• Grayscale: ${((latestData.grayscale || 0) / 1000000).toFixed(1)}M

📊 <b>All Funds (Total):</b>
• BlackRock: ${(Number(totalBlackrock) / 1000000).toFixed(1)}M
• Fidelity: ${(Number(totalFidelity) / 1000000).toFixed(1)}M
• Bitwise: ${(Number(totalBitwise) / 1000000).toFixed(1)}M
• 21Shares: ${(Number(totalTwentyOneShares) / 1000000).toFixed(1)}M
• VanEck: ${(Number(totalVanEck) / 1000000).toFixed(1)}M
• Invesco: ${(Number(totalInvesco) / 1000000).toFixed(1)}M
• Franklin: ${(Number(totalFranklin) / 1000000).toFixed(1)}M
• Grayscale: ${(Number(totalGrayscale) / 1000000).toFixed(1)}M
• Grayscale ETH: ${(Number(totalGrayscaleCrypto) / 1000000).toFixed(1)}M
      `.trim();
    } catch (error) {
      this.logger.error('❌ Error getting Ethereum ETF data:', error);
      return '❌ Error getting Ethereum ETF data. Please try again later.';
    }
  }

  async getBitcoinData(): Promise<string> {
    try {
      const bitcoinData = await this.etfFlowService.getETFFlowData('bitcoin');

      if (!bitcoinData || bitcoinData.length === 0) {
        return '📊 <b>Bitcoin ETF Data</b>\n\n❌ No data available at the moment.';
      }

      const latestData = bitcoinData[0] as any;
      const totalFlow = latestData.total || 0;

      // Calculate 7-day total
      const sevenDayData = bitcoinData.slice(0, 7);
      const sevenDayTotal = sevenDayData.reduce(
        (sum, day) => (sum as number) + Number(day.total || 0),
        0 as number,
      );

      // Calculate 30-day total
      const thirtyDayData = bitcoinData.slice(0, 30);
      const thirtyDayTotal = thirtyDayData.reduce(
        (sum, day) => (sum as number) + Number(day.total || 0),
        0 as number,
      );

      // Calculate total for all days for each fund
      const totalBlackrock = bitcoinData.reduce(
        (sum, day) => (sum as number) + Number(day.blackrock || 0),
        0 as number,
      );
      const totalFidelity = bitcoinData.reduce(
        (sum, day) => (sum as number) + Number(day.fidelity || 0),
        0 as number,
      );
      const totalBitwise = bitcoinData.reduce(
        (sum, day) => (sum as number) + Number(day.bitwise || 0),
        0 as number,
      );
      const totalTwentyOneShares = bitcoinData.reduce(
        (sum, day) => (sum as number) + Number(day.twentyOneShares || 0),
        0 as number,
      );
      const totalVanEck = bitcoinData.reduce(
        (sum, day) => (sum as number) + Number(day.vanEck || 0),
        0 as number,
      );
      const totalInvesco = bitcoinData.reduce(
        (sum, day) => (sum as number) + Number(day.invesco || 0),
        0 as number,
      );
      const totalFranklin = bitcoinData.reduce(
        (sum, day) => (sum as number) + Number(day.franklin || 0),
        0 as number,
      );
      const totalValkyrie = bitcoinData.reduce(
        (sum, day) => (sum as number) + Number(day.valkyrie || 0),
        0 as number,
      );
      const totalWisdomTree = bitcoinData.reduce(
        (sum, day) => (sum as number) + Number(day.wisdomTree || 0),
        0 as number,
      );
      const totalGrayscale = bitcoinData.reduce(
        (sum, day) => (sum as number) + Number(day.grayscale || 0),
        0 as number,
      );
      const totalGrayscaleBtc = bitcoinData.reduce(
        (sum, day) => (sum as number) + Number(day.grayscaleBtc || 0),
        0 as number,
      );

      return `
📊 <b>Bitcoin ETF Flow Data</b>

📅 <b>Latest Data (${this.formatDate(latestData.date)}):</b>
💰 Total Flow: <b>${(totalFlow / 1000000).toFixed(1)}M</b>

📈 <b>7-Day Total:</b>
📊 Total Flow: <b>${(Number(sevenDayTotal) / 1000000).toFixed(1)}M</b>

📅 <b>30-Day Total:</b>
📊 Total Flow: <b>${(Number(thirtyDayTotal) / 1000000).toFixed(1)}M</b>

🏢 <b>Top Performers:</b>
• BlackRock: ${((latestData.blackrock || 0) / 1000000).toFixed(1)}M
• Fidelity: ${((latestData.fidelity || 0) / 1000000).toFixed(1)}M
• Bitwise: ${((latestData.bitwise || 0) / 1000000).toFixed(1)}M
• Grayscale: ${((latestData.grayscale || 0) / 1000000).toFixed(1)}M

📊 <b>All Funds (Total):</b>
• BlackRock: ${(Number(totalBlackrock) / 1000000).toFixed(1)}M
• Fidelity: ${(Number(totalFidelity) / 1000000).toFixed(1)}M
• Bitwise: ${(Number(totalBitwise) / 1000000).toFixed(1)}M
• 21Shares: ${(Number(totalTwentyOneShares) / 1000000).toFixed(1)}M
• VanEck: ${(Number(totalVanEck) / 1000000).toFixed(1)}M
• Invesco: ${(Number(totalInvesco) / 1000000).toFixed(1)}M
• Franklin: ${(Number(totalFranklin) / 1000000).toFixed(1)}M
• Valkyrie: ${(Number(totalValkyrie) / 1000000).toFixed(1)}M
• WisdomTree: ${(Number(totalWisdomTree) / 1000000).toFixed(1)}M
• Grayscale: ${(Number(totalGrayscale) / 1000000).toFixed(1)}M
• Grayscale BTC: ${(Number(totalGrayscaleBtc) / 1000000).toFixed(1)}M
      `.trim();
    } catch (error) {
      this.logger.error('❌ Error getting Bitcoin ETF data:', error);
      return '❌ Error getting Bitcoin ETF data. Please try again later.';
    }
  }

  async getSummaryData(): Promise<string> {
    try {
      const [bitcoinData, ethereumData] = await Promise.all([
        this.etfFlowService.getETFFlowData('bitcoin'),
        this.etfFlowService.getETFFlowData('ethereum'),
      ]);

      if (
        (!bitcoinData || bitcoinData.length === 0) &&
        (!ethereumData || ethereumData.length === 0)
      ) {
        return '📊 <b>ETF Summary</b>\n\n❌ No data available at the moment.';
      }

      let message = '📊 <b>ETF Flow Summary</b>\n\n';

      // Bitcoin data
      if (bitcoinData && bitcoinData.length > 0) {
        const latestBtc = bitcoinData[0] as any;
        const btcTotal = latestBtc.total || 0;
        const btcSevenDay = bitcoinData.slice(0, 7);
        const btcAverage =
          btcSevenDay.reduce((sum, day) => sum + Number(day.total || 0), 0) /
          btcSevenDay.length;

        message += `🟠 <b>Bitcoin ETF (${this.formatDate(latestBtc.date)}):</b>\n`;
        message += `💰 Total Flow: <b>${(btcTotal / 1000000).toFixed(1)}M</b>\n`;
        message += `📈 7-Day Avg: <b>${(btcAverage / 1000000).toFixed(1)}M</b>\n\n`;
      }

      // Ethereum data
      if (ethereumData && ethereumData.length > 0) {
        const latestEth = ethereumData[0] as any;
        const ethTotal = latestEth.total || 0;
        const ethSevenDay = ethereumData.slice(0, 7);
        const ethAverage =
          ethSevenDay.reduce((sum, day) => sum + Number(day.total || 0), 0) /
          ethSevenDay.length;

        message += `🔵 <b>Ethereum ETF (${this.formatDate(latestEth.date)}):</b>\n`;
        message += `💰 Total Flow: <b>${(ethTotal / 1000000).toFixed(1)}M</b>\n`;
        message += `📈 7-Day Avg: <b>${(ethAverage / 1000000).toFixed(1)}M</b>\n\n`;
      }

      message += '💡 <i>Use /bitcoin or /ethereum for detailed breakdown</i>';

      return message;
    } catch (error) {
      this.logger.error('❌ Error getting ETF summary:', error);
      return '❌ Error getting ETF summary. Please try again later.';
    }
  }
}
