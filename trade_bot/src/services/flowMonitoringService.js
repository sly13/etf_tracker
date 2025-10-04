const config = require('../config');
const logger = require('../utils/logger');
const databaseService = require('./databaseService');
const okxService = require('./okxService');

class FlowMonitoringService {
	constructor() {
		this.isRunning = false;
		this.monitoringInterval = null;
		this.lastCheckTime = {
			btc: new Date(),
			eth: new Date()
		};
		this.stats = {
			totalSignals: 0,
			btcSignals: 0,
			ethSignals: 0,
			successfulTrades: 0,
			failedTrades: 0,
			lastSignal: null
		};
	}

	// Запуск мониторинга
	async start() {
		if (this.isRunning) {
			logger.warn('⚠️ Мониторинг уже запущен');
			return;
		}

		try {
			// Проверяем подключения
			if (!databaseService.isConnected) {
				await databaseService.connect();
			}

			const okxConnected = await okxService.checkConnection();
			if (!okxConnected) {
				throw new Error('Нет подключения к OKX API');
			}

			this.isRunning = true;
			logger.info('🚀 Запуск мониторинга Flow данных');

			// Запускаем периодическую проверку
			this.monitoringInterval = setInterval(() => {
				this.checkFlowData();
			}, config.trading.checkInterval);

			// Первая проверка сразу
			await this.checkFlowData();

		} catch (error) {
			logger.error('❌ Ошибка запуска мониторинга:', error);
			throw error;
		}
	}

	// Остановка мониторинга
	async stop() {
		if (!this.isRunning) {
			logger.warn('⚠️ Мониторинг не запущен');
			return;
		}

		this.isRunning = false;

		if (this.monitoringInterval) {
			clearInterval(this.monitoringInterval);
			this.monitoringInterval = null;
		}

		logger.info('🛑 Мониторинг остановлен');
	}

	// Основная функция проверки данных
	async checkFlowData() {
		try {
			logger.debug('🔍 Проверка новых Flow данных...');

			// Проверяем BTC Flow
			await this.checkBTCFlow();

			// Проверяем ETH Flow
			await this.checkETHFlow();

		} catch (error) {
			logger.error('❌ Ошибка проверки Flow данных:', error);
		}
	}

	// Проверка BTC Flow данных
	async checkBTCFlow() {
		try {
			const newFlows = await databaseService.getNewBTCFlowData(this.lastCheckTime.btc);

			if (newFlows.length > 0) {
				logger.info(`📊 Найдено ${newFlows.length} новых BTC Flow записей`);

				for (const flow of newFlows) {
					await this.processFlowSignal('BTC', flow);
				}

				this.lastCheckTime.btc = new Date();
			}
		} catch (error) {
			logger.error('❌ Ошибка проверки BTC Flow:', error);
		}
	}

	// Проверка ETH Flow данных
	async checkETHFlow() {
		try {
			const newFlows = await databaseService.getNewETHFlowData(this.lastCheckTime.eth);

			if (newFlows.length > 0) {
				logger.info(`📊 Найдено ${newFlows.length} новых ETH Flow записей`);

				for (const flow of newFlows) {
					await this.processFlowSignal('ETH', flow);
				}

				this.lastCheckTime.eth = new Date();
			}
		} catch (error) {
			logger.error('❌ Ошибка проверки ETH Flow:', error);
		}
	}

	// Обработка сигнала Flow
	async processFlowSignal(asset, flowData) {
		try {
			const flowValue = parseFloat(flowData.total);
			const threshold = config.trading.minFlowThreshold;

			// Проверяем, превышает ли значение порог
			if (Math.abs(flowValue) < threshold) {
				logger.debug(`📈 ${asset} Flow ${flowValue} не превышает порог ${threshold}`);
				return;
			}

			// Определяем направление торговли
			const side = flowValue > 0 ? 'long' : 'short';
			const symbol = config.trading.symbols[asset.toLowerCase()];

			logger.info(`🚨 Сигнал ${asset}: Flow = ${flowValue}, Направление = ${side}`);

			// Выполняем торговую операцию
			await this.executeTrade(symbol, side, flowValue, flowData);

			// Обновляем статистику
			this.stats.totalSignals++;
			this.stats[`${asset.toLowerCase()}Signals`]++;
			this.stats.lastSignal = {
				asset,
				flowValue,
				side,
				timestamp: new Date().toISOString()
			};

		} catch (error) {
			logger.error(`❌ Ошибка обработки сигнала ${asset}:`, error);
			this.stats.failedTrades++;
		}
	}

	// Выполнение торговой операции
	async executeTrade(symbol, side, flowValue, flowData) {
		try {
			// Получаем текущую цену
			const ticker = await okxService.getTicker(symbol);
			const currentPrice = ticker.price;

			// Рассчитываем размер позиции
			const positionSize = this.calculatePositionSize(currentPrice, flowValue);

			logger.info(`💰 Выполнение сделки: ${symbol} ${side} ${positionSize} @ ${currentPrice}`);

			// Размещаем рыночный ордер
			const order = await okxService.placeMarketOrder(symbol, side, positionSize);

			// Сохраняем позицию в БД
			const positionData = {
				symbol,
				side,
				size: positionSize,
				entry_price: currentPrice,
				total: flowValue,
				okx_order_id: order.ordId,
				status: 'open'
			};

			const savedPosition = await databaseService.createTradingPosition(positionData);

			logger.info(`✅ Позиция создана: ID ${savedPosition.id}, OKX Order ID: ${order.ordId}`);
			this.stats.successfulTrades++;

		} catch (error) {
			logger.error(`❌ Ошибка выполнения сделки ${symbol}:`, error);
			this.stats.failedTrades++;
			throw error;
		}
	}

	// Расчет размера позиции
	calculatePositionSize(currentPrice, flowValue) {
		const maxPositionValue = config.trading.maxPositionSize;

		// Базовый размер позиции
		let positionValue = maxPositionValue;

		// Корректируем размер в зависимости от силы сигнала
		const flowStrength = Math.abs(flowValue) / config.trading.minFlowThreshold;
		positionValue = Math.min(positionValue * Math.min(flowStrength, 2), maxPositionSize);

		// Рассчитываем количество токенов
		const tokenAmount = positionValue / currentPrice;

		// Округляем до разумного количества знаков
		return Math.round(tokenAmount * 100000) / 100000;
	}

	// Получить статус мониторинга
	getStatus() {
		console.log('=== DEBUG: getStatus() ===');
		console.log('this.isRunning:', this.isRunning);
		console.log('this.lastCheckTime:', this.lastCheckTime);
		console.log('this.stats:', this.stats);
		
		const status = {
			isRunning: this.isRunning,
			lastCheckTime: this.lastCheckTime,
			stats: this.stats,
			config: {
				checkInterval: config.trading.checkInterval,
				minFlowThreshold: config.trading.minFlowThreshold,
				maxPositionSize: config.trading.maxPositionSize
			}
		};
		
		console.log('Returning status:', JSON.stringify(status, null, 2));
		return status;
	}

	// Получить статистику
	getStats() {
		return {
			...this.stats,
			uptime: this.isRunning ? Date.now() - this.startTime : 0,
			successRate: this.stats.totalSignals > 0
				? (this.stats.successfulTrades / this.stats.totalSignals * 100).toFixed(2) + '%'
				: '0%'
		};
	}

	// Сброс статистики
	resetStats() {
		this.stats = {
			totalSignals: 0,
			btcSignals: 0,
			ethSignals: 0,
			successfulTrades: 0,
			failedTrades: 0,
			lastSignal: null
		};
		logger.info('📊 Статистика сброшена');
	}
}

module.exports = new FlowMonitoringService();
