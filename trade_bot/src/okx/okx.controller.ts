import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { OkxService } from './okx.service';

@Controller('api/okx')
export class OkxController {
  constructor(private readonly okxService: OkxService) {}

  @Get('status')
  async checkConnection() {
    const result = await this.okxService.checkConnection();
    return {
      success: true,
      message: 'Статус подключения к OKX получен',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('balance')
  async getBalance() {
    const balance = await this.okxService.getBalance();
    return {
      success: true,
      message: 'Баланс аккаунта получен',
      data: balance,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('prices')
  async getCurrentPrices() {
    const prices = await this.okxService.getCurrentPrices();
    return {
      success: true,
      message: 'Текущие цены получены',
      data: prices,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ticker/:symbol')
  async getTicker(@Param('symbol') symbol: string) {
    const ticker = await this.okxService.getTicker(symbol);
    return {
      success: true,
      message: 'Данные тикера получены',
      data: ticker,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('balance/multiple')
  async getBalanceMultiple(@Query('ccy') ccy?: string) {
    const ccyList = ccy ? ccy.split(',').map((c) => c.trim()) : [];
    const balance = await this.okxService.getBalanceMultiple(ccyList);
    return {
      success: true,
      message: 'Баланс для нескольких валют получен',
      data: balance.data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('orders/open')
  async getOpenOrders(@Query('symbol') symbol?: string) {
    const orders = await this.okxService.getOpenOrders(symbol);
    return {
      success: true,
      message: 'Открытые ордера получены',
      data: orders.data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('orders/history')
  async getOrderHistory(
    @Query('symbol') symbol?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const orders = await this.okxService.getOrderHistory(symbol, limitNum);
    return {
      success: true,
      message: 'История ордеров получена',
      data: orders.data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('orders/market')
  async placeMarketOrder(
    @Body() body: { symbol: string; side: string; size: string },
  ) {
    const { symbol, side, size } = body;

    if (!symbol || !side || !size) {
      return {
        success: false,
        message: 'Необходимы параметры: symbol, side, size',
        timestamp: new Date().toISOString(),
      };
    }

    if (!['buy', 'sell'].includes(side)) {
      return {
        success: false,
        message: 'Side должен быть "buy" или "sell"',
        timestamp: new Date().toISOString(),
      };
    }

    const order = await this.okxService.placeMarketOrder(symbol, side, size);
    return {
      success: true,
      message: 'Рыночный ордер размещен',
      data: order.data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('orders/limit')
  async placeLimitOrder(
    @Body() body: { symbol: string; side: string; size: string; price: string },
  ) {
    const { symbol, side, size, price } = body;

    if (!symbol || !side || !size || !price) {
      return {
        success: false,
        message: 'Необходимы параметры: symbol, side, size, price',
        timestamp: new Date().toISOString(),
      };
    }

    if (!['buy', 'sell'].includes(side)) {
      return {
        success: false,
        message: 'Side должен быть "buy" или "sell"',
        timestamp: new Date().toISOString(),
      };
    }

    const order = await this.okxService.placeLimitOrder(
      symbol,
      side,
      size,
      price,
    );
    return {
      success: true,
      message: 'Лимитный ордер размещен',
      data: order.data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('orders/cancel')
  async cancelOrder(@Body() body: { symbol: string; orderId: string }) {
    const { symbol, orderId } = body;

    if (!symbol || !orderId) {
      return {
        success: false,
        message: 'Необходимы параметры: symbol, orderId',
        timestamp: new Date().toISOString(),
      };
    }

    const result = await this.okxService.cancelOrder(symbol, orderId);
    return {
      success: true,
      message: 'Ордер отменен',
      data: result.data,
      timestamp: new Date().toISOString(),
    };
  }
}
