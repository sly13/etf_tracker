const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

class DatabaseService {
	constructor() {
		this.prisma = new PrismaClient({
			log: [
				{ level: 'query', emit: 'event' },
				{ level: 'error', emit: 'event' },
				{ level: 'info', emit: 'event' },
				{ level: 'warn', emit: 'event' },
			],
		});

		// Настройка логирования
		this.prisma.$on('query', (e) => {
			if (process.env.NODE_ENV === 'development') {
				logger.debug('Prisma Query:', e.query);
			}
		});

		this.prisma.$on('error', (e) => {
			logger.error('Prisma Error:', e);
		});

		this.isConnected = false;
	}

	async connect() {
		try {
			await this.prisma.$connect();
			this.isConnected = true;
			logger.info('✅ Подключение к базе данных установлено (Prisma)');
		} catch (error) {
			logger.error('❌ Ошибка подключения к базе данных:', error);
			throw error;
		}
	}

	async disconnect() {
		if (this.prisma) {
			await this.prisma.$disconnect();
			this.isConnected = false;
			logger.info('🔌 Подключение к базе данных закрыто');
		}
	}

	// Получить последние данные BTC Flow
	async getLatestBTCFlow(limit = 1) {
		try {
			const flows = await this.prisma.bTCFlow.findMany({
				orderBy: { date: 'desc' },
				take: limit,
			});
			return flows;
		} catch (error) {
			logger.error('Ошибка получения BTC Flow данных:', error);
			throw error;
		}
	}

	// Получить последние данные ETH Flow
	async getLatestETHFlow(limit = 1) {
		try {
			const flows = await this.prisma.eTFFlow.findMany({
				orderBy: { date: 'desc' },
				take: limit,
			});
			return flows;
		} catch (error) {
			logger.error('Ошибка получения ETH Flow данных:', error);
			throw error;
		}
	}

	// Получить новые данные с определенного времени
	async getNewBTCFlowData(since) {
		try {
			const flows = await this.prisma.bTCFlow.findMany({
				where: {
					date: {
						gt: since
					}
				},
				orderBy: { date: 'asc' },
			});
			return flows;
		} catch (error) {
			logger.error('Ошибка получения новых BTC Flow данных:', error);
			throw error;
		}
	}

	async getNewETHFlowData(since) {
		try {
			const flows = await this.prisma.eTFFlow.findMany({
				where: {
					date: {
						gt: since
					}
				},
				orderBy: { date: 'asc' },
			});
			return flows;
		} catch (error) {
			logger.error('Ошибка получения новых ETH Flow данных:', error);
			throw error;
		}
	}

	// Создать новую торговую позицию
	async createTradingPosition(positionData) {
		try {
			const position = await this.prisma.tradingPosition.create({
				data: positionData
			});
			logger.info(`📈 Создана новая позиция: ${position.id} (${position.symbol} ${position.side})`);
			return position;
		} catch (error) {
			logger.error('Ошибка создания торговой позиции:', error);
			throw error;
		}
	}

	// Обновить торговую позицию
	async updateTradingPosition(id, updateData) {
		try {
			const position = await this.prisma.tradingPosition.update({
				where: { id },
				data: updateData
			});

			logger.info(`📊 Позиция ${id} обновлена`);
			return position;
		} catch (error) {
			logger.error('Ошибка обновления торговой позиции:', error);
			throw error;
		}
	}

	// Получить открытые позиции
	async getOpenPositions() {
		try {
			const positions = await this.prisma.tradingPosition.findMany({
				where: { status: 'open' },
				orderBy: { createdAt: 'desc' },
			});
			return positions;
		} catch (error) {
			logger.error('Ошибка получения открытых позиций:', error);
			throw error;
		}
	}

	// Получить все позиции
	async getAllPositions(limit = 50) {
		try {
			const positions = await this.prisma.tradingPosition.findMany({
				orderBy: { createdAt: 'desc' },
				take: limit,
			});
			return positions;
		} catch (error) {
			logger.error('Ошибка получения всех позиций:', error);
			throw error;
		}
	}

	// Получить статистику торговли
	async getTradingStats() {
		try {
			const stats = await this.prisma.tradingPosition.groupBy({
				by: ['status'],
				_count: {
					status: true
				},
				_sum: {
					profitLoss: true
				}
			});

			const totalPositions = await this.prisma.tradingPosition.count();
			const openPositions = await this.prisma.tradingPosition.count({
				where: { status: 'open' }
			});

			return {
				totalPositions,
				openPositions,
				closedPositions: totalPositions - openPositions,
				stats
			};
		} catch (error) {
			logger.error('Ошибка получения статистики торговли:', error);
			throw error;
		}
	}
}

module.exports = new DatabaseService();