const {
	startMonitoring,
	stopMonitoring,
	getMonitoringStatus,
	getMonitoringStats,
	resetStats,
	getLatestFlowData,
	getTradingPositions,
	getTradingStats
} = require('../controllers/botController');

async function botRoutes(fastify, options) {
	// Мониторинг Flow данных
	fastify.post('/monitoring/start', {
		schema: {
			description: 'Запустить мониторинг Flow данных',
			tags: ['Bot Management'],
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: {
							type: 'object',
							properties: {
								isRunning: { type: 'boolean' },
								lastCheckTime: { type: 'object' },
								stats: { type: 'object' },
								config: { type: 'object' }
							}
						},
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, startMonitoring);

	fastify.post('/monitoring/stop', {
		schema: {
			description: 'Остановить мониторинг Flow данных',
			tags: ['Bot Management'],
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: { type: 'object' },
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, stopMonitoring);

	fastify.get('/monitoring/status', {
		schema: {
			description: 'Получить статус мониторинга',
			tags: ['Bot Management'],
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: { type: 'object' },
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, getMonitoringStatus);

	fastify.get('/monitoring/stats', {
		schema: {
			description: 'Получить статистику мониторинга',
			tags: ['Bot Management'],
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: { type: 'object' },
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, getMonitoringStats);

	fastify.post('/monitoring/reset-stats', {
		schema: {
			description: 'Сбросить статистику мониторинга',
			tags: ['Bot Management'],
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: { type: 'object' },
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, resetStats);

	// Flow данные
	fastify.get('/flow/:asset', {
		schema: {
			description: 'Получить последние Flow данные',
			tags: ['Flow Data'],
			params: {
				type: 'object',
				properties: {
					asset: {
						type: 'string',
						enum: ['btc', 'eth']
					}
				}
			},
			querystring: {
				type: 'object',
				properties: {
					limit: { type: 'number', default: 10 }
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: { type: 'array' },
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, getLatestFlowData);

	// Торговые позиции
	fastify.get('/positions', {
		schema: {
			description: 'Получить торговые позиции',
			tags: ['Trading'],
			querystring: {
				type: 'object',
				properties: {
					status: { type: 'string', enum: ['open', 'closed', 'cancelled'] },
					limit: { type: 'number', default: 50 }
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: { type: 'array' },
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, getTradingPositions);

	fastify.get('/stats', {
		schema: {
			description: 'Получить статистику торговли',
			tags: ['Trading'],
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: { type: 'object' },
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, getTradingStats);
}

module.exports = botRoutes;
