import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ETFService {
  private readonly logger = new Logger(ETFService.name);

  constructor(private httpService: HttpService) {}

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
      const response = await firstValueFrom(
        this.httpService.get(
          'https://api-etf.vadimsemenko.ru/api/etf/ethereum',
        ),
      );
      const ethereumData = response.data;

      if (!ethereumData || ethereumData.length === 0) {
        return '📊 <b>Ethereum ETF Data</b>\n\n❌ No data available at the moment.';
      }

      const latestData = ethereumData[0];
      const totalFlow = latestData.total || 0;

      // Calculate 7-day total
      const sevenDayData = ethereumData.slice(0, 7);
      const sevenDayTotal = sevenDayData.reduce(
        (sum, day) => sum + Number(day.total || 0),
        0,
      );

      // Calculate 30-day total
      const thirtyDayData = ethereumData.slice(0, 30);
      const thirtyDayTotal = thirtyDayData.reduce(
        (sum, day) => sum + Number(day.total || 0),
        0,
      );

      // Calculate total for all days for each fund
      let totalBlackrock = 0;
      for (const day of ethereumData) {
        totalBlackrock += Number(day.blackrock || 0);
      }
      let totalFidelity = 0;
      for (const day of ethereumData) {
        totalFidelity += Number(day.fidelity || 0);
      }
      let totalBitwise = 0;
      for (const day of ethereumData) {
        totalBitwise += Number(day.bitwise || 0);
      }
      let totalTwentyOneShares = 0;
      for (const day of ethereumData) {
        totalTwentyOneShares += Number(day.twentyOneShares || 0);
      }
      let totalVanEck = 0;
      for (const day of ethereumData) {
        totalVanEck += Number(day.vanEck || 0);
      }
      let totalInvesco = 0;
      for (const day of ethereumData) {
        totalInvesco += Number(day.invesco || 0);
      }
      let totalFranklin = 0;
      for (const day of ethereumData) {
        totalFranklin += Number(day.franklin || 0);
      }
      let totalGrayscale = 0;
      for (const day of ethereumData) {
        totalGrayscale += Number(day.grayscale || 0);
      }
      let totalGrayscaleCrypto = 0;
      for (const day of ethereumData) {
        totalGrayscaleCrypto += Number(day.grayscaleCrypto || 0);
      }

      return `
📊 <b>Ethereum ETF Flow Data</b>

📅 <b>Latest Data (${this.formatDate(latestData.date)}):</b>
💰 Total Flow: <b>${totalFlow.toFixed(1)}M</b>

📈 <b>7-Day Total:</b>
📊 Total Flow: <b>${sevenDayTotal.toFixed(1)}M</b>

📅 <b>30-Day Total:</b>
📊 Total Flow: <b>${thirtyDayTotal.toFixed(1)}M</b>

🏢 <b>Top Performers:</b>
• BlackRock: ${(latestData.blackrock || 0).toFixed(1)}M
• Fidelity: ${(latestData.fidelity || 0).toFixed(1)}M
• Bitwise: ${(latestData.bitwise || 0).toFixed(1)}M
• Grayscale: ${(latestData.grayscale || 0).toFixed(1)}M

📊 <b>All Funds (Total):</b>
• BlackRock: ${totalBlackrock.toFixed(1)}M
• Fidelity: ${totalFidelity.toFixed(1)}M
• Bitwise: ${totalBitwise.toFixed(1)}M
• 21Shares: ${totalTwentyOneShares.toFixed(1)}M
• VanEck: ${totalVanEck.toFixed(1)}M
• Invesco: ${totalInvesco.toFixed(1)}M
• Franklin: ${totalFranklin.toFixed(1)}M
• Grayscale: ${totalGrayscale.toFixed(1)}M
• Grayscale ETH: ${totalGrayscaleCrypto.toFixed(1)}M
      `.trim();
    } catch (error) {
      this.logger.error('❌ Error getting Ethereum ETF data:', error);
      return '❌ Error getting Ethereum ETF data. Please try again later.';
    }
  }

  async getBitcoinData(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://api-etf.vadimsemenko.ru/api/etf/bitcoin'),
      );
      const bitcoinData = response.data;

      this.logger.log(
        `Bitcoin API response: ${JSON.stringify(bitcoinData?.slice(0, 2))}`,
      );

      if (!bitcoinData || bitcoinData.length === 0) {
        return '📊 <b>Bitcoin ETF Data</b>\n\n❌ No data available at the moment.';
      }

      const latestData = bitcoinData[0];
      const totalFlow = latestData.total || 0;

      // Calculate 7-day total
      const sevenDayData = bitcoinData.slice(0, 7);
      const sevenDayTotal = sevenDayData.reduce(
        (sum, day) => sum + Number(day.total || 0),
        0,
      );

      // Calculate 30-day total
      const thirtyDayData = bitcoinData.slice(0, 30);
      const thirtyDayTotal = thirtyDayData.reduce(
        (sum, day) => sum + Number(day.total || 0),
        0,
      );

      // Calculate total for all days for each fund
      let totalBlackrock = 0;
      for (const day of bitcoinData) {
        totalBlackrock += Number(day.blackrock || 0);
      }
      let totalFidelity = 0;
      for (const day of bitcoinData) {
        totalFidelity += Number(day.fidelity || 0);
      }
      let totalBitwise = 0;
      for (const day of bitcoinData) {
        totalBitwise += Number(day.bitwise || 0);
      }
      let totalTwentyOneShares = 0;
      for (const day of bitcoinData) {
        totalTwentyOneShares += Number(day.twentyOneShares || 0);
      }
      let totalVanEck = 0;
      for (const day of bitcoinData) {
        totalVanEck += Number(day.vanEck || 0);
      }
      let totalInvesco = 0;
      for (const day of bitcoinData) {
        totalInvesco += Number(day.invesco || 0);
      }
      let totalFranklin = 0;
      for (const day of bitcoinData) {
        totalFranklin += Number(day.franklin || 0);
      }
      let totalValkyrie = 0;
      for (const day of bitcoinData) {
        totalValkyrie += Number(day.valkyrie || 0);
      }
      let totalWisdomTree = 0;
      for (const day of bitcoinData) {
        totalWisdomTree += Number(day.wisdomTree || 0);
      }
      let totalGrayscale = 0;
      for (const day of bitcoinData) {
        totalGrayscale += Number(day.grayscale || 0);
      }
      let totalGrayscaleBtc = 0;
      for (const day of bitcoinData) {
        totalGrayscaleBtc += Number(day.grayscaleBtc || 0);
      }

      return `
📊 <b>Bitcoin ETF Flow Data</b>

📅 <b>Latest Data (${this.formatDate(latestData.date)}):</b>
💰 Total Flow: <b>${totalFlow.toFixed(1)}M</b>

📈 <b>7-Day Total:</b>
📊 Total Flow: <b>${sevenDayTotal.toFixed(1)}M</b>

📅 <b>30-Day Total:</b>
📊 Total Flow: <b>${thirtyDayTotal.toFixed(1)}M</b>

🏢 <b>Top Performers:</b>
• BlackRock: ${(latestData.blackrock || 0).toFixed(1)}M
• Fidelity: ${(latestData.fidelity || 0).toFixed(1)}M
• Bitwise: ${(latestData.bitwise || 0).toFixed(1)}M
• Grayscale: ${(latestData.grayscale || 0).toFixed(1)}M

📊 <b>All Funds (Total):</b>
• BlackRock: ${totalBlackrock.toFixed(1)}M
• Fidelity: ${totalFidelity.toFixed(1)}M
• Bitwise: ${totalBitwise.toFixed(1)}M
• 21Shares: ${totalTwentyOneShares.toFixed(1)}M
• VanEck: ${totalVanEck.toFixed(1)}M
• Invesco: ${totalInvesco.toFixed(1)}M
• Franklin: ${totalFranklin.toFixed(1)}M
• Valkyrie: ${totalValkyrie.toFixed(1)}M
• WisdomTree: ${totalWisdomTree.toFixed(1)}M
• Grayscale: ${totalGrayscale.toFixed(1)}M
• Grayscale BTC: ${Number(totalGrayscaleBtc).toFixed(1)}M
      `.trim();
    } catch (error) {
      this.logger.error('❌ Error getting Bitcoin ETF data:', error);
      return '❌ Error getting Bitcoin ETF data. Please try again later.';
    }
  }

  async getSummaryData(): Promise<string> {
    try {
      const [bitcoinResponse, ethereumResponse] = await Promise.all([
        firstValueFrom(
          this.httpService.get(
            'https://api-etf.vadimsemenko.ru/api/etf/bitcoin',
          ),
        ),
        firstValueFrom(
          this.httpService.get(
            'https://api-etf.vadimsemenko.ru/api/etf/ethereum',
          ),
        ),
      ]);

      const bitcoinData = bitcoinResponse.data;
      const ethereumData = ethereumResponse.data;

      if (
        (!bitcoinData || bitcoinData.length === 0) &&
        (!ethereumData || ethereumData.length === 0)
      ) {
        return '📊 <b>ETF Summary</b>\n\n❌ No data available at the moment.';
      }

      let message = '📊 <b>ETF Flow Summary</b>\n\n';

      // Bitcoin data
      if (bitcoinData && bitcoinData.length > 0) {
        const latestBtc = bitcoinData[0];
        const btcTotal = latestBtc.total || 0;
        const btcSevenDay = bitcoinData.slice(0, 7);
        const btcAverage =
          (() => {
            let sum = 0;
            for (const day of btcSevenDay) {
              sum += Number(day.total || 0);
            }
            return sum;
          })() / btcSevenDay.length;

        message += `🟠 <b>Bitcoin ETF (${this.formatDate(latestBtc.date)}):</b>\n`;
        message += `💰 Total Flow: <b>${btcTotal.toFixed(1)}M</b>\n`;
        message += `📈 7-Day Avg: <b>${btcAverage.toFixed(1)}M</b>\n\n`;
      }

      // Ethereum data
      if (ethereumData && ethereumData.length > 0) {
        const latestEth = ethereumData[0];
        const ethTotal = latestEth.total || 0;
        const ethSevenDay = ethereumData.slice(0, 7);
        const ethAverage =
          (() => {
            let sum = 0;
            for (const day of ethSevenDay) {
              sum += Number(day.total || 0);
            }
            return sum;
          })() / ethSevenDay.length;

        message += `🔵 <b>Ethereum ETF (${this.formatDate(latestEth.date)}):</b>\n`;
        message += `💰 Total Flow: <b>${ethTotal.toFixed(1)}M</b>\n`;
        message += `📈 7-Day Avg: <b>${ethAverage.toFixed(1)}M</b>\n\n`;
      }

      message += '💡 <i>Use /bitcoin or /ethereum for detailed breakdown</i>';

      return message;
    } catch (error) {
      this.logger.error('❌ Error getting ETF summary:', error);
      return '❌ Error getting ETF summary. Please try again later.';
    }
  }
}
