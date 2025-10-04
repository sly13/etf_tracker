const {
	startTrading,
	stopTrading,
	getTradingStatus,
	executeTrade,
	getTrades
} = require('../controllers/tradeController');

async function tradeRoutes(fastify, options) {
	// Начать торговлю
	fastify.post('/start', {
		schema: {
			description: 'Начать торговлю',
			tags: ['Trading'],
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: {
							type: 'object',
							properties: {
								status: { type: 'string' },
								timestamp: { type: 'string' }
							}
						},
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, startTrading);

	// Остановить торговлю
	fastify.post('/stop', {
		schema: {
			description: 'Остановить торговлю',
			tags: ['Trading'],
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: {
							type: 'object',
							properties: {
								status: { type: 'string' },
								timestamp: { type: 'string' }
							}
						},
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, stopTrading);

	// Получить статус торговли
	fastify.get('/status', {
		schema: {
			description: 'Получить статус торговли',
			tags: ['Trading'],
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
								tradesCount: { type: 'number' },
								timestamp: { type: 'string' }
							}
						},
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, getTradingStatus);

	// Выполнить сделку
	fastify.post('/execute', {
		schema: {
			description: 'Выполнить сделку',
			tags: ['Trading'],
			body: {
				type: 'object',
				required: ['symbol', 'quantity', 'side'],
				properties: {
					symbol: { type: 'string' },
					quantity: { type: 'number' },
					side: { type: 'string', enum: ['buy', 'sell'] },
					price: { type: 'number' }
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: {
							type: 'object',
							properties: {
								id: { type: 'number' },
								symbol: { type: 'string' },
								quantity: { type: 'number' },
								side: { type: 'string' },
								status: { type: 'string' },
								timestamp: { type: 'string' }
							}
						},
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, executeTrade);

	// Получить список сделок
	fastify.get('/trades', {
		schema: {
			description: 'Получить список сделок',
			tags: ['Trading'],
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
						data: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									id: { type: 'number' },
									symbol: { type: 'string' },
									quantity: { type: 'number' },
									side: { type: 'string' },
									status: { type: 'string' },
									timestamp: { type: 'string' }
								}
							}
						},
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, getTrades);
}

module.exports = tradeRoutes;
