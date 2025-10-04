const {
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
} = require('../../controllers/okxController');

async function okxRoutes(fastify, options) {
	// Проверка статуса подключения к OKX
	fastify.get('/status', {
		schema: {
			description: 'Проверить статус подключения к OKX API',
			tags: ['OKX API'],
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: {
							type: 'object',
							properties: {
								connected: { type: 'boolean' },
								accountInfo: { type: 'object' }
							}
						},
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, checkConnection);

	// Получить подробную информацию об аккаунте
	fastify.get('/account', {
		schema: {
			description: 'Получить подробную информацию об аккаунте OKX',
			tags: ['OKX API'],
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: {
							type: 'object',
							properties: {
								accountDetails: { type: 'object' },
								balance: { type: 'array' },
								timestamp: { type: 'string' }
							}
						}
					}
				}
			}
		}
	}, getAccountDetails);

	// Получить текущие цены BTC и ETH
	fastify.get('/prices', {
		schema: {
			description: 'Получить текущие цены BTC и ETH',
			tags: ['OKX API'],
			response: {
				200: {
					type: 'object',
					properties: {
						success: { type: 'boolean' },
						message: { type: 'string' },
						data: {
							type: 'object',
							properties: {
								BTC: {
									type: 'object',
									properties: {
										symbol: { type: 'string' },
										price: { type: 'number' },
										bid: { type: 'number' },
										ask: { type: 'number' },
										volume: { type: 'number' }
									}
								},
								ETH: {
									type: 'object',
									properties: {
										symbol: { type: 'string' },
										price: { type: 'number' },
										bid: { type: 'number' },
										ask: { type: 'number' },
										volume: { type: 'number' }
									}
								}
							}
						},
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, getCurrentPrices);

	// Получить цену конкретного символа
	fastify.get('/ticker/:symbol', {
		schema: {
			description: 'Получить цену конкретного символа',
			tags: ['OKX API'],
			params: {
				type: 'object',
				properties: {
					symbol: { type: 'string' }
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
								symbol: { type: 'string' },
								price: { type: 'number' },
								bid: { type: 'number' },
								ask: { type: 'number' },
								volume: { type: 'number' }
							}
						},
						timestamp: { type: 'string' }
					}
				}
			}
		}
	}, getTicker);

	// Получить открытые ордера
	fastify.get('/orders/open', {
		schema: {
			description: 'Получить открытые ордера на OKX',
			tags: ['OKX API'],
			querystring: {
				type: 'object',
				properties: {
					symbol: { type: 'string' }
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
	}, getOpenOrders);

	// Получить историю ордеров
	fastify.get('/orders/history', {
		schema: {
			description: 'Получить историю ордеров',
			tags: ['OKX API'],
			querystring: {
				type: 'object',
				properties: {
					symbol: { type: 'string' },
					limit: { type: 'number', default: 100 }
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
	}, getOrderHistory);

	// Получить информацию об ордере
	fastify.get('/orders/:symbol/:orderId', {
		schema: {
			description: 'Получить информацию об ордере',
			tags: ['OKX API'],
			params: {
				type: 'object',
				properties: {
					symbol: { type: 'string' },
					orderId: { type: 'string' }
				}
			},
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
	}, getOrderInfo);

	// Получить баланс аккаунта
	fastify.get('/balance', {
		schema: {
			description: 'Получить баланс аккаунта OKX',
			tags: ['OKX API'],
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
	}, getAccountBalance);

	// Получить баланс для нескольких валют
	fastify.get('/balance/multiple', {
		schema: {
			description: 'Получить баланс для нескольких валют',
			tags: ['OKX API'],
			querystring: {
				type: 'object',
				properties: {
					ccy: { type: 'string', description: 'Список валют через запятую (например: USDT,BTC,ETH)' }
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
	}, getBalanceMultiple);

	// Разместить рыночный ордер
	fastify.post('/orders/market', {
		schema: {
			description: 'Разместить рыночный ордер',
			tags: ['OKX Trading'],
			body: {
				type: 'object',
				required: ['symbol', 'side', 'size'],
				properties: {
					symbol: { type: 'string' },
					side: { type: 'string', enum: ['buy', 'sell'] },
					size: { type: 'number' }
				}
			},
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
	}, placeMarketOrder);

	// Разместить лимитный ордер
	fastify.post('/orders/limit', {
		schema: {
			description: 'Разместить лимитный ордер',
			tags: ['OKX Trading'],
			body: {
				type: 'object',
				required: ['symbol', 'side', 'size', 'price'],
				properties: {
					symbol: { type: 'string' },
					side: { type: 'string', enum: ['buy', 'sell'] },
					size: { type: 'number' },
					price: { type: 'number' }
				}
			},
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
	}, placeLimitOrder);

	// Отменить ордер
	fastify.post('/orders/cancel', {
		schema: {
			description: 'Отменить ордер',
			tags: ['OKX Trading'],
			body: {
				type: 'object',
				required: ['symbol', 'orderId'],
				properties: {
					symbol: { type: 'string' },
					orderId: { type: 'string' }
				}
			},
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
	}, cancelOrder);
}

module.exports = okxRoutes;
