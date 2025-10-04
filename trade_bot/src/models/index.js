// Модели данных для торгового бота

class Trade {
	constructor(data) {
		this.id = data.id || Date.now();
		this.symbol = data.symbol;
		this.quantity = data.quantity;
		this.side = data.side; // 'buy' или 'sell'
		this.price = data.price;
		this.status = data.status || 'pending'; // 'pending', 'executed', 'cancelled'
		this.timestamp = data.timestamp || new Date().toISOString();
		this.stopLoss = data.stopLoss;
		this.takeProfit = data.takeProfit;
	}

	toJSON() {
		return {
			id: this.id,
			symbol: this.symbol,
			quantity: this.quantity,
			side: this.side,
			price: this.price,
			status: this.status,
			timestamp: this.timestamp,
			stopLoss: this.stopLoss,
			takeProfit: this.takeProfit
		};
	}

	validate() {
		const errors = [];

		if (!this.symbol) errors.push('Symbol is required');
		if (!this.quantity || this.quantity <= 0) errors.push('Quantity must be positive');
		if (!this.side || !['buy', 'sell'].includes(this.side)) errors.push('Side must be buy or sell');
		if (this.price && this.price <= 0) errors.push('Price must be positive');

		return errors;
	}
}

class TradingSession {
	constructor() {
		this.id = Date.now();
		this.isActive = false;
		this.startTime = null;
		this.endTime = null;
		this.trades = [];
		this.totalProfit = 0;
		this.totalLoss = 0;
	}

	start() {
		this.isActive = true;
		this.startTime = new Date().toISOString();
	}

	stop() {
		this.isActive = false;
		this.endTime = new Date().toISOString();
	}

	addTrade(trade) {
		this.trades.push(trade);
	}

	getStats() {
		return {
			id: this.id,
			isActive: this.isActive,
			startTime: this.startTime,
			endTime: this.endTime,
			tradesCount: this.trades.length,
			totalProfit: this.totalProfit,
			totalLoss: this.totalLoss,
			netProfit: this.totalProfit - this.totalLoss
		};
	}
}

module.exports = {
	Trade,
	TradingSession
};
