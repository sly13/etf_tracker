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
    } catch (error) {
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

      // Calculate 7-day average
      const sevenDayData = ethereumData.slice(0, 7);
      const sevenDayAverage =
        sevenDayData.reduce((sum, day) => sum + (day.total || 0), 0) /
        sevenDayData.length;

      return `
📊 <b>Ethereum ETF Flow Data</b>

📅 <b>Latest Data (${this.formatDate(latestData.date)}):</b>
💰 Total Flow: <b>${(totalFlow / 1000000).toFixed(1)}M ETH</b>

📈 <b>7-Day Average:</b>
📊 Average Flow: <b>${(sevenDayAverage / 1000000).toFixed(1)}M ETH</b>

🏢 <b>Top Performers:</b>
• BlackRock: ${((latestData.blackrock || 0) / 1000000).toFixed(1)}M ETH
• Fidelity: ${((latestData.fidelity || 0) / 1000000).toFixed(1)}M ETH
• Bitwise: ${((latestData.bitwise || 0) / 1000000).toFixed(1)}M ETH
• Grayscale: ${((latestData.grayscale || 0) / 1000000).toFixed(1)}M ETH

📊 <b>All Funds:</b>
• BlackRock: ${((latestData.blackrock || 0) / 1000000).toFixed(1)}M ETH
• Fidelity: ${((latestData.fidelity || 0) / 1000000).toFixed(1)}M ETH
• Bitwise: ${((latestData.bitwise || 0) / 1000000).toFixed(1)}M ETH
• 21Shares: ${((latestData.twentyOneShares || 0) / 1000000).toFixed(1)}M ETH
• VanEck: ${((latestData.vanEck || 0) / 1000000).toFixed(1)}M ETH
• Invesco: ${((latestData.invesco || 0) / 1000000).toFixed(1)}M ETH
• Franklin: ${((latestData.franklin || 0) / 1000000).toFixed(1)}M ETH
• Grayscale: ${((latestData.grayscale || 0) / 1000000).toFixed(1)}M ETH
• Grayscale ETH: ${((latestData.grayscaleCrypto || 0) / 1000000).toFixed(1)}M ETH

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

📅 <b>Latest Data (${this.formatDate(latestData.date)}):</b>
💰 Total Flow: <b>${(totalFlow / 1000000).toFixed(1)}M BTC</b>

📈 <b>7-Day Average:</b>
📊 Average Flow: <b>${(sevenDayAverage / 1000000).toFixed(1)}M BTC</b>

🏢 <b>Top Performers:</b>
• BlackRock: ${((latestData.blackrock || 0) / 1000000).toFixed(1)}M BTC
• Fidelity: ${((latestData.fidelity || 0) / 1000000).toFixed(1)}M BTC
• Bitwise: ${((latestData.bitwise || 0) / 1000000).toFixed(1)}M BTC
• Grayscale: ${((latestData.grayscale || 0) / 1000000).toFixed(1)}M BTC

📊 <b>All Funds:</b>
• BlackRock: ${((latestData.blackrock || 0) / 1000000).toFixed(1)}M BTC
• Fidelity: ${((latestData.fidelity || 0) / 1000000).toFixed(1)}M BTC
• Bitwise: ${((latestData.bitwise || 0) / 1000000).toFixed(1)}M BTC
• 21Shares: ${((latestData.twentyOneShares || 0) / 1000000).toFixed(1)}M BTC
• VanEck: ${((latestData.vanEck || 0) / 1000000).toFixed(1)}M BTC
• Invesco: ${((latestData.invesco || 0) / 1000000).toFixed(1)}M BTC
• Franklin: ${((latestData.franklin || 0) / 1000000).toFixed(1)}M BTC
• Valkyrie: ${((latestData.valkyrie || 0) / 1000000).toFixed(1)}M BTC
• WisdomTree: ${((latestData.wisdomTree || 0) / 1000000).toFixed(1)}M BTC
• Grayscale: ${((latestData.grayscale || 0) / 1000000).toFixed(1)}M BTC
• Grayscale BTC: ${((latestData.grayscaleBtc || 0) / 1000000).toFixed(1)}M BTC

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

        message += `🟠 <b>Bitcoin ETF (${this.formatDate(latestBtc.date)}):</b>\n`;
        message += `💰 Total Flow: <b>${(btcTotal / 1000000).toFixed(1)}M BTC</b>\n`;
        message += `📈 7-Day Avg: <b>${(btcAverage / 1000000).toFixed(1)}M BTC</b>\n\n`;
      }

      // Ethereum data
      if (ethereumData && ethereumData.length > 0) {
        const latestEth = ethereumData[0] as any;
        const ethTotal = latestEth.total || 0;
        const ethSevenDay = ethereumData.slice(0, 7);
        const ethAverage =
          ethSevenDay.reduce((sum, day) => sum + (day.total || 0), 0) /
          ethSevenDay.length;

        message += `🔵 <b>Ethereum ETF (${this.formatDate(latestEth.date)}):</b>\n`;
        message += `💰 Total Flow: <b>${(ethTotal / 1000000).toFixed(1)}M ETH</b>\n`;
        message += `📈 7-Day Avg: <b>${(ethAverage / 1000000).toFixed(1)}M ETH</b>\n\n`;
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
