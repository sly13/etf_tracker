import { Injectable, Logger } from '@nestjs/common';
import { UniversalETFFlowService } from '../../etf/universal-etf-flow.service';

@Injectable()
export class ETFService {
  private readonly logger = new Logger(ETFService.name);

  constructor(private etfFlowService: UniversalETFFlowService) {}

  async getEthereumData(): Promise<string> {
    try {
      const ethereumData = await this.etfFlowService.getETFFlowData('ethereum');

      if (!ethereumData || ethereumData.length === 0) {
        return '📊 <b>Ethereum ETF Data</b>\n\n❌ No data available at the moment.';
      }

      const latestData = ethereumData[0] as any;
      const totalFlow = latestData.total || 0;

      // Calculate 7-day average
      const sevenDayData = ethereumData.slice(0, 7);
      const sevenDayAverage =
        sevenDayData.reduce((sum, day) => sum + (day.total || 0), 0) /
        sevenDayData.length;

      return `
📊 <b>Ethereum ETF Flow Data</b>

📅 <b>Latest Data (${latestData.date}):</b>
💰 Total Flow: <b>${totalFlow.toLocaleString()} ETH</b>

📈 <b>7-Day Average:</b>
📊 Average Flow: <b>${sevenDayAverage.toLocaleString()} ETH</b>

🏢 <b>Top Performers:</b>
• BlackRock: ${(latestData.blackrock || 0).toLocaleString()} ETH
• Fidelity: ${(latestData.fidelity || 0).toLocaleString()} ETH
• Bitwise: ${(latestData.bitwise || 0).toLocaleString()} ETH
• Grayscale: ${(latestData.grayscale || 0).toLocaleString()} ETH

📊 <b>All Funds:</b>
• BlackRock: ${(latestData.blackrock || 0).toLocaleString()} ETH
• Fidelity: ${(latestData.fidelity || 0).toLocaleString()} ETH
• Bitwise: ${(latestData.bitwise || 0).toLocaleString()} ETH
• 21Shares: ${(latestData.twentyOneShares || 0).toLocaleString()} ETH
• VanEck: ${(latestData.vanEck || 0).toLocaleString()} ETH
• Invesco: ${(latestData.invesco || 0).toLocaleString()} ETH
• Franklin: ${(latestData.franklin || 0).toLocaleString()} ETH
• Grayscale: ${(latestData.grayscale || 0).toLocaleString()} ETH
• Grayscale ETH: ${(latestData.grayscaleCrypto || 0).toLocaleString()} ETH

<i>Data source: Farside.co.uk</i>
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

      // Calculate 7-day average
      const sevenDayData = bitcoinData.slice(0, 7);
      const sevenDayAverage =
        sevenDayData.reduce((sum, day) => sum + (day.total || 0), 0) /
        sevenDayData.length;

      return `
📊 <b>Bitcoin ETF Flow Data</b>

📅 <b>Latest Data (${latestData.date}):</b>
💰 Total Flow: <b>${totalFlow.toLocaleString()} BTC</b>

📈 <b>7-Day Average:</b>
📊 Average Flow: <b>${sevenDayAverage.toLocaleString()} BTC</b>

🏢 <b>Top Performers:</b>
• BlackRock: ${(latestData.blackrock || 0).toLocaleString()} BTC
• Fidelity: ${(latestData.fidelity || 0).toLocaleString()} BTC
• Bitwise: ${(latestData.bitwise || 0).toLocaleString()} BTC
• Grayscale: ${(latestData.grayscale || 0).toLocaleString()} BTC

📊 <b>All Funds:</b>
• BlackRock: ${(latestData.blackrock || 0).toLocaleString()} BTC
• Fidelity: ${(latestData.fidelity || 0).toLocaleString()} BTC
• Bitwise: ${(latestData.bitwise || 0).toLocaleString()} BTC
• 21Shares: ${(latestData.twentyOneShares || 0).toLocaleString()} BTC
• VanEck: ${(latestData.vanEck || 0).toLocaleString()} BTC
• Invesco: ${(latestData.invesco || 0).toLocaleString()} BTC
• Franklin: ${(latestData.franklin || 0).toLocaleString()} BTC
• Valkyrie: ${(latestData.valkyrie || 0).toLocaleString()} BTC
• WisdomTree: ${(latestData.wisdomTree || 0).toLocaleString()} BTC
• Grayscale: ${(latestData.grayscale || 0).toLocaleString()} BTC
• Grayscale BTC: ${(latestData.grayscaleBtc || 0).toLocaleString()} BTC

<i>Data source: Farside.co.uk</i>
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
          btcSevenDay.reduce((sum, day) => sum + (day.total || 0), 0) /
          btcSevenDay.length;

        message += `🟠 <b>Bitcoin ETF (${latestBtc.date}):</b>\n`;
        message += `💰 Total Flow: <b>${btcTotal.toLocaleString()} BTC</b>\n`;
        message += `📈 7-Day Avg: <b>${btcAverage.toLocaleString()} BTC</b>\n\n`;
      }

      // Ethereum data
      if (ethereumData && ethereumData.length > 0) {
        const latestEth = ethereumData[0] as any;
        const ethTotal = latestEth.total || 0;
        const ethSevenDay = ethereumData.slice(0, 7);
        const ethAverage =
          ethSevenDay.reduce((sum, day) => sum + (day.total || 0), 0) /
          ethSevenDay.length;

        message += `🔵 <b>Ethereum ETF (${latestEth.date}):</b>\n`;
        message += `💰 Total Flow: <b>${ethTotal.toLocaleString()} ETH</b>\n`;
        message += `📈 7-Day Avg: <b>${ethAverage.toLocaleString()} ETH</b>\n\n`;
      }

      message += '💡 <i>Use /bitcoin or /ethereum for detailed breakdown</i>\n';
      message += '<i>Data source: Farside.co.uk</i>';

      return message;
    } catch (error) {
      this.logger.error('❌ Error getting ETF summary:', error);
      return '❌ Error getting ETF summary. Please try again later.';
    }
  }
}
