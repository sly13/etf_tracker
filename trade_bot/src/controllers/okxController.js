const okxService = require('../services/okxService');
const { formatResponse, formatError } = require('../utils/helpers');
const logger = require('../utils/logger');

// Проверить подключение к OKX
async function checkConnection(request, reply) {
	try {
		const isConnected = await okxService.checkConnection();
		const accountInfo = isConnected ? await okxService.getAccountInfo() : null;

		return reply.send(formatResponse({
			connected: isConnected,
			accountInfo: accountInfo
		}, 'Статус подключения к OKX получен'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка проверки подключения к OKX'));
	}
}

// Получить подробную информацию об аккаунте
async function getAccountDetails(request, reply) {
	try {
		const accountDetails = await okxService.getAccountDetails();
		const balance = await okxService.getBalance();

		return reply.send({
			success: true,
			message: 'Информация об аккаунте получена',
			data: {
				accountDetails: accountDetails,
				balance: balance,
				timestamp: new Date().toISOString()
			}
		});
	} catch (error) {
		logger.error('Ошибка получения информации об аккаунте:', error);
		return reply.code(500).send(formatError(error, 'Ошибка получения информации об аккаунте'));
	}
}

// Получить текущие цены
async function getCurrentPrices(request, reply) {
	try {
		const btcPrice = await okxService.getTicker('BTC-USDT');
		const ethPrice = await okxService.getTicker('ETH-USDT');

		return reply.send({
			success: true,
			message: 'Текущие цены получены',
			data: {
				BTC: btcPrice,
				ETH: ethPrice
			},
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка получения текущих цен'));
	}
}

// Получить цену конкретного символа
async function getTicker(request, reply) {
	try {
		const { symbol } = request.params;
		const ticker = await okxService.getTicker(symbol);

		return reply.send({
			success: true,
			message: `Цена ${symbol} получена`,
			data: ticker,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		logger.error(`Ошибка получения цены ${request.params.symbol}:`, error);
		return reply.code(500).send(formatError(error, `Ошибка получения цены ${request.params.symbol}`));
	}
}

// Получить открытые ордера
async function getOpenOrders(request, reply) {
	try {
		const { symbol } = request.query;
		const orders = await okxService.getOpenOrders(symbol);

		return reply.send(formatResponse(orders, 'Открытые ордера получены'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка получения открытых ордеров'));
	}
}

// Получить историю ордеров
async function getOrderHistory(request, reply) {
	try {
		const { symbol, limit } = request.query;
		const orders = await okxService.getOrderHistory(symbol, limit);

		return reply.send(formatResponse(orders, 'История ордеров получена'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка получения истории ордеров'));
	}
}

// Получить информацию об ордере
async function getOrderInfo(request, reply) {
	try {
		const { symbol, orderId } = request.params;
		const order = await okxService.getOrderInfo(symbol, orderId);

		return reply.send(formatResponse(order, 'Информация об ордере получена'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка получения информации об ордере'));
	}
}

// Получить баланс аккаунта
async function getAccountBalance(request, reply) {
	try {
		const balance = await okxService.getBalance();

		return reply.send(formatResponse(balance, 'Баланс аккаунта получен'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка получения баланса аккаунта'));
	}
}

// Получить баланс для нескольких валют
async function getBalanceMultiple(request, reply) {
	try {
		const { ccy } = request.query;
		const ccyList = ccy ? ccy.split(',').map(c => c.trim()) : [];
		const balance = await okxService.getBalanceMultiple(ccyList);

		return reply.send({
			success: true,
			message: 'Баланс для нескольких валют получен',
			data: balance.data,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		logger.error('Ошибка получения баланса для нескольких валют:', error);
		return reply.code(500).send(formatError(error, 'Ошибка получения баланса для нескольких валют'));
	}
}

// Разместить рыночный ордер
async function placeMarketOrder(request, reply) {
	try {
		const { symbol, side, size } = request.body;

		// Валидация
		if (!symbol || !side || !size) {
			return reply.code(400).send(formatError(
				new Error('Необходимы параметры: symbol, side, size'),
				'Неверные параметры ордера'
			));
		}

		if (!['buy', 'sell'].includes(side)) {
			return reply.code(400).send(formatError(
				new Error('Side должен быть "buy" или "sell"'),
				'Неверное направление ордера'
			));
		}

		const order = await okxService.placeMarketOrder(symbol, side, size);

		return reply.send(formatResponse(order, 'Рыночный ордер размещен'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка размещения рыночного ордера'));
	}
}

// Разместить лимитный ордер
async function placeLimitOrder(request, reply) {
	try {
		const { symbol, side, size, price } = request.body;

		// Валидация
		if (!symbol || !side || !size || !price) {
			return reply.code(400).send(formatError(
				new Error('Необходимы параметры: symbol, side, size, price'),
				'Неверные параметры ордера'
			));
		}

		if (!['buy', 'sell'].includes(side)) {
			return reply.code(400).send(formatError(
				new Error('Side должен быть "buy" или "sell"'),
				'Неверное направление ордера'
			));
		}

		const order = await okxService.placeLimitOrder(symbol, side, size, price);

		return reply.send(formatResponse(order, 'Лимитный ордер размещен'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка размещения лимитного ордера'));
	}
}

// Отменить ордер
async function cancelOrder(request, reply) {
	try {
		const { symbol, orderId } = request.body;

		if (!symbol || !orderId) {
			return reply.code(400).send(formatError(
				new Error('Необходимы параметры: symbol, orderId'),
				'Неверные параметры для отмены ордера'
			));
		}

		const result = await okxService.cancelOrder(symbol, orderId);

		return reply.send(formatResponse(result, 'Ордер отменен'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка отмены ордера'));
	}
}

module.exports = {
	checkConnection,
	getAccountDetails,
	getCurrentPrices,
	getTicker,
	getOpenOrders,
	getOrderHistory,
	getOrderInfo,
	getAccountBalance,
	getBalanceMultiple,
	placeMarketOrder,
	placeLimitOrder,
	cancelOrder
};
