import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class OkxService {
  private readonly logger = new Logger(OkxService.name);
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly passphrase: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OKX_API_KEY');
    this.secretKey = this.configService.get<string>('OKX_SECRET_KEY');
    this.passphrase = this.configService.get<string>('OKX_PASSPHRASE');
    this.baseUrl = 'https://www.okx.com';
  }

  private sign({
    timestamp,
    method,
    requestPath,
    body,
  }: {
    timestamp: string;
    method: string;
    requestPath: string;
    body: string;
  }) {
    const prehash = timestamp + method + requestPath + body;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(prehash)
      .digest('base64');
    return { signature, prehash };
  }

  async checkConnection(): Promise<{ connected: boolean; accountInfo?: any }> {
    try {
      const method = 'GET';
      const requestPath = '/api/v5/account/balance';
      const timestamp = new Date().toISOString();
      const { signature } = this.sign({
        timestamp,
        method,
        requestPath,
        body: '',
      });

      const headers = {
        'OK-ACCESS-KEY': this.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.passphrase,
        'Content-Type': 'application/json',
      };

      const url = `${this.baseUrl}${requestPath}`;
      const response = await axios({
        method,
        url,
        headers,
        timeout: 10000,
      });

      if (response.data.code === '0') {
        return {
          connected: true,
          accountInfo: response.data.data[0],
        };
      } else {
        throw new Error(`OKX API error: ${response.data.msg}`);
      }
    } catch (error) {
      this.logger.error('Ошибка подключения к OKX API:', error);
      return { connected: false };
    }
  }

  async getBalance(): Promise<any[]> {
    try {
      const method = 'GET';
      const requestPath = '/api/v5/account/balance';
      const timestamp = new Date().toISOString();
      const { signature } = this.sign({
        timestamp,
        method,
        requestPath,
        body: '',
      });

      const headers = {
        'OK-ACCESS-KEY': this.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.passphrase,
        'Content-Type': 'application/json',
      };

      const url = `${this.baseUrl}${requestPath}`;
      const response = await axios({
        method,
        url,
        headers,
        timeout: 10000,
      });

      if (response.data.code === '0') {
        return response.data.data[0].details || [];
      } else {
        throw new Error(`OKX API error: ${response.data.msg}`);
      }
    } catch (error) {
      this.logger.error('Ошибка получения баланса:', error);
      throw error;
    }
  }

  async getTicker(symbol: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/v5/market/ticker?instId=${symbol}`;
      const response = await axios.get(url, { timeout: 10000 });

      if (response.data.code === '0' && response.data.data.length > 0) {
        const ticker = response.data.data[0];
        return {
          symbol: ticker.instId,
          price: parseFloat(ticker.last),
          bid: parseFloat(ticker.bidPx),
          ask: parseFloat(ticker.askPx),
          volume: parseFloat(ticker.vol24h),
        };
      } else {
        throw new Error(`OKX API error: ${response.data.msg}`);
      }
    } catch (error) {
      this.logger.error('Ошибка получения тикера:', error);
      throw error;
    }
  }

  async getBalanceMultiple(ccyList: string[] = []): Promise<any> {
    try {
      const method = 'GET';
      const ccyString = ccyList.join(',');
      const q = ccyString ? `?ccy=${encodeURIComponent(ccyString)}` : '';
      const requestPath = `/api/v5/account/balance${q}`;
      const timestamp = new Date().toISOString();
      const { signature } = this.sign({
        timestamp,
        method,
        requestPath,
        body: '',
      });

      const headers = {
        'OK-ACCESS-KEY': this.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.passphrase,
        'Content-Type': 'application/json',
      };

      const url = `${this.baseUrl}${requestPath}`;
      const response = await axios({
        method,
        url,
        headers,
        timeout: 10000,
      });

      if (response.data.code === '0') {
        return response.data;
      } else {
        throw new Error(`OKX API error: ${response.data.msg}`);
      }
    } catch (error) {
      this.logger.error(
        'Ошибка получения баланса для нескольких валют:',
        error,
      );
      throw error;
    }
  }

  async getOpenOrders(symbol?: string): Promise<any> {
    try {
      const method = 'GET';
      const q = symbol ? `?instId=${symbol}` : '';
      const requestPath = `/api/v5/trade/orders-pending${q}`;
      const timestamp = new Date().toISOString();
      const { signature } = this.sign({
        timestamp,
        method,
        requestPath,
        body: '',
      });

      const headers = {
        'OK-ACCESS-KEY': this.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.passphrase,
        'Content-Type': 'application/json',
      };

      const url = `${this.baseUrl}${requestPath}`;
      const response = await axios({
        method,
        url,
        headers,
        timeout: 10000,
      });

      if (response.data.code === '0') {
        return response.data;
      } else {
        throw new Error(`OKX API error: ${response.data.msg}`);
      }
    } catch (error) {
      this.logger.error('Ошибка получения открытых ордеров:', error);
      throw error;
    }
  }

  async getOrderHistory(symbol?: string, limit?: number): Promise<any> {
    try {
      const method = 'GET';
      const params = new URLSearchParams();
      if (symbol) params.append('instId', symbol);
      if (limit) params.append('limit', limit.toString());

      const q = params.toString() ? `?${params.toString()}` : '';
      const requestPath = `/api/v5/trade/orders-history${q}`;
      const timestamp = new Date().toISOString();
      const { signature } = this.sign({
        timestamp,
        method,
        requestPath,
        body: '',
      });

      const headers = {
        'OK-ACCESS-KEY': this.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.passphrase,
        'Content-Type': 'application/json',
      };

      const url = `${this.baseUrl}${requestPath}`;
      const response = await axios({
        method,
        url,
        headers,
        timeout: 10000,
      });

      if (response.data.code === '0') {
        return response.data;
      } else {
        throw new Error(`OKX API error: ${response.data.msg}`);
      }
    } catch (error) {
      this.logger.error('Ошибка получения истории ордеров:', error);
      throw error;
    }
  }

  async placeMarketOrder(
    symbol: string,
    side: string,
    size: string,
  ): Promise<any> {
    try {
      const method = 'POST';
      const requestPath = '/api/v5/trade/order';
      const timestamp = new Date().toISOString();

      const body = JSON.stringify({
        instId: symbol,
        tdMode: 'cash',
        side: side,
        ordType: 'market',
        sz: size,
      });

      const { signature } = this.sign({
        timestamp,
        method,
        requestPath,
        body,
      });

      const headers = {
        'OK-ACCESS-KEY': this.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.passphrase,
        'Content-Type': 'application/json',
      };

      const url = `${this.baseUrl}${requestPath}`;
      const response = await axios({
        method,
        url,
        headers,
        data: body,
        timeout: 10000,
      });

      if (response.data.code === '0') {
        return response.data;
      } else {
        throw new Error(`OKX API error: ${response.data.msg}`);
      }
    } catch (error) {
      this.logger.error('Ошибка размещения рыночного ордера:', error);
      throw error;
    }
  }

  async placeLimitOrder(
    symbol: string,
    side: string,
    size: string,
    price: string,
  ): Promise<any> {
    try {
      const method = 'POST';
      const requestPath = '/api/v5/trade/order';
      const timestamp = new Date().toISOString();

      const body = JSON.stringify({
        instId: symbol,
        tdMode: 'cash',
        side: side,
        ordType: 'limit',
        sz: size,
        px: price,
      });

      const { signature } = this.sign({
        timestamp,
        method,
        requestPath,
        body,
      });

      const headers = {
        'OK-ACCESS-KEY': this.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.passphrase,
        'Content-Type': 'application/json',
      };

      const url = `${this.baseUrl}${requestPath}`;
      const response = await axios({
        method,
        url,
        headers,
        data: body,
        timeout: 10000,
      });

      if (response.data.code === '0') {
        return response.data;
      } else {
        throw new Error(`OKX API error: ${response.data.msg}`);
      }
    } catch (error) {
      this.logger.error('Ошибка размещения лимитного ордера:', error);
      throw error;
    }
  }

  async cancelOrder(symbol: string, orderId: string): Promise<any> {
    try {
      const method = 'POST';
      const requestPath = '/api/v5/trade/cancel-order';
      const timestamp = new Date().toISOString();

      const body = JSON.stringify({
        instId: symbol,
        ordId: orderId,
      });

      const { signature } = this.sign({
        timestamp,
        method,
        requestPath,
        body,
      });

      const headers = {
        'OK-ACCESS-KEY': this.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.passphrase,
        'Content-Type': 'application/json',
      };

      const url = `${this.baseUrl}${requestPath}`;
      const response = await axios({
        method,
        url,
        headers,
        data: body,
        timeout: 10000,
      });

      if (response.data.code === '0') {
        return response.data;
      } else {
        throw new Error(`OKX API error: ${response.data.msg}`);
      }
    } catch (error) {
      this.logger.error('Ошибка отмены ордера:', error);
      throw error;
    }
  }

  async getCurrentPrices(): Promise<{ BTC: any; ETH: any }> {
    try {
      const [btcPrice, ethPrice] = await Promise.all([
        this.getTicker('BTC-USDT'),
        this.getTicker('ETH-USDT'),
      ]);

      return {
        BTC: btcPrice,
        ETH: ethPrice,
      };
    } catch (error) {
      this.logger.error('Ошибка получения текущих цен:', error);
      throw error;
    }
  }
}
