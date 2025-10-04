const tradeService = require('../services/tradeService');
const { validateTradeData, formatResponse, formatError } = require('../utils/helpers');

async function startTrading(request, reply) {
	try {
		const result = await tradeService.startTrading();
		return reply.send(formatResponse(result, 'Trading started successfully'));
	} catch (error) {
		return reply.code(400).send(formatError(error, 'Failed to start trading'));
	}
}

async function stopTrading(request, reply) {
	try {
		const result = await tradeService.stopTrading();
		return reply.send(formatResponse(result, 'Trading stopped successfully'));
	} catch (error) {
		return reply.code(400).send(formatError(error, 'Failed to stop trading'));
	}
}

async function getTradingStatus(request, reply) {
	try {
		const status = await tradeService.getStatus();
		return reply.send(formatResponse(status, 'Trading status retrieved'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Failed to get trading status'));
	}
}

async function executeTrade(request, reply) {
	try {
		validateTradeData(request.body);
		const trade = await tradeService.executeTrade(request.body);
		return reply.send(formatResponse(trade, 'Trade executed successfully'));
	} catch (error) {
		return reply.code(400).send(formatError(error, 'Failed to execute trade'));
	}
}

async function getTrades(request, reply) {
	try {
		const limit = parseInt(request.query.limit) || 10;
		const trades = await tradeService.getTrades(limit);
		return reply.send(formatResponse(trades, 'Trades retrieved successfully'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Failed to get trades'));
	}
}

module.exports = {
	startTrading,
	stopTrading,
	getTradingStatus,
	executeTrade,
	getTrades
};
