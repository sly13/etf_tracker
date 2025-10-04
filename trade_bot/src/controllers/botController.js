const flowMonitoringService = require('../services/flowMonitoringService');
const databaseService = require('../services/databaseService');
const { formatResponse, formatError } = require('../utils/helpers');

// Запуск мониторинга
async function startMonitoring(request, reply) {
	try {
		await flowMonitoringService.start();
		const status = flowMonitoringService.getStatus();
		
		// Преобразуем даты в строки для корректной сериализации
		const serializedStatus = {
			...status,
			lastCheckTime: {
				btc: status.lastCheckTime.btc ? 
					(status.lastCheckTime.btc instanceof Date ? 
						status.lastCheckTime.btc.toISOString() : 
						status.lastCheckTime.btc) : null,
				eth: status.lastCheckTime.eth ? 
					(status.lastCheckTime.eth instanceof Date ? 
						status.lastCheckTime.eth.toISOString() : 
						status.lastCheckTime.eth) : null
			}
		};
		
		return reply.send({
			success: true,
			message: 'Мониторинг Flow данных запущен',
			data: serializedStatus,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка запуска мониторинга'));
	}
}

// Остановка мониторинга
async function stopMonitoring(request, reply) {
	try {
		await flowMonitoringService.stop();
		return reply.send(formatResponse(
			flowMonitoringService.getStatus(),
			'Мониторинг Flow данных остановлен'
		));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка остановки мониторинга'));
	}
}

// Получить статус мониторинга
async function getMonitoringStatus(request, reply) {
	try {
		const status = flowMonitoringService.getStatus();
		
		// Принудительная сериализация через JSON
		const serializedStatus = JSON.parse(JSON.stringify(status));
		
		return reply.send({
			success: true,
			message: 'Статус мониторинга получен',
			data: serializedStatus,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка получения статуса мониторинга'));
	}
}

// Получить статистику мониторинга
async function getMonitoringStats(request, reply) {
	try {
		const stats = flowMonitoringService.getStats();
		return reply.send(formatResponse(stats, 'Статистика мониторинга получена'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка получения статистики мониторинга'));
	}
}

// Сброс статистики
async function resetStats(request, reply) {
	try {
		flowMonitoringService.resetStats();
		return reply.send(formatResponse(
			flowMonitoringService.getStats(),
			'Статистика сброшена'
		));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка сброса статистики'));
	}
}

// Получить последние Flow данные
async function getLatestFlowData(request, reply) {
	try {
		const { asset } = request.params;
		const limit = parseInt(request.query.limit) || 10;

		let flows = [];
		if (asset === 'btc') {
			flows = await databaseService.getLatestBTCFlow(limit);
		} else if (asset === 'eth') {
			flows = await databaseService.getLatestETHFlow(limit);
		} else {
			return reply.code(400).send(formatError(
				new Error('Неверный asset. Используйте btc или eth'),
				'Неверный параметр asset'
			));
		}

		return reply.send(formatResponse(flows, `Последние ${asset.toUpperCase()} Flow данные получены`));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка получения Flow данных'));
	}
}

// Получить торговые позиции
async function getTradingPositions(request, reply) {
	try {
		const { status } = request.query;
		const limit = parseInt(request.query.limit) || 50;

		let positions = [];
		if (status === 'open') {
			positions = await databaseService.getOpenPositions();
		} else {
			positions = await databaseService.getAllPositions(limit);
		}

		return reply.send(formatResponse(positions, 'Торговые позиции получены'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка получения торговых позиций'));
	}
}

// Получить статистику торговли
async function getTradingStats(request, reply) {
	try {
		const stats = await databaseService.getTradingStats();
		return reply.send(formatResponse(stats, 'Статистика торговли получена'));
	} catch (error) {
		return reply.code(500).send(formatError(error, 'Ошибка получения статистики торговли'));
	}
}


module.exports = {
	startMonitoring,
	stopMonitoring,
	getMonitoringStatus,
	getMonitoringStats,
	resetStats,
	getLatestFlowData,
	getTradingPositions,
	getTradingStats
};
