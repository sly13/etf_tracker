const logger = require('../utils/logger');

class TradeService {
	constructor() {
		this.isRunning = false;
		this.trades = [];
	}

	async startTrading() {
		if (this.isRunning) {
			throw new Error('Trading already running');
		}

		this.isRunning = true;
		logger.info('Trading started');

		return {
			status: 'started',
			timestamp: new Date().toISOString()
		};
	}

	async stopTrading() {
		if (!this.isRunning) {
			throw new Error('Trading not running');
		}

		this.isRunning = false;
		logger.info('Trading stopped');

		return {
			status: 'stopped',
			timestamp: new Date().toISOString()
		};
	}

	async getStatus() {
		return {
			isRunning: this.isRunning,
			tradesCount: this.trades.length,
			timestamp: new Date().toISOString()
		};
	}

	async executeTrade(tradeData) {
		if (!this.isRunning) {
			throw new Error('Trading not running');
		}

		const trade = {
			id: Date.now(),
			...tradeData,
			timestamp: new Date().toISOString(),
			status: 'executed'
		};

		this.trades.push(trade);
		logger.info(`Trade executed: ${trade.id}`);

		return trade;
	}

	async getTrades(limit = 10) {
		return this.trades.slice(-limit);
	}
}

module.exports = new TradeService();
