const { healthCheck, getInfo } = require('../controllers/healthController');

async function healthRoutes(fastify, options) {
	// Главная страница
	fastify.get('/', {
		schema: {
			description: 'Получить информацию о API',
			tags: ['Health'],
			response: {
				200: {
					type: 'object',
					properties: {
						message: { type: 'string' },
						version: { type: 'string' },
						timestamp: { type: 'string' },
						environment: { type: 'string' }
					}
				}
			}
		}
	}, getInfo);

	// Health check
	fastify.get('/health', {
		schema: {
			description: 'Проверка состояния сервера',
			tags: ['Health'],
			response: {
				200: {
					type: 'object',
					properties: {
						status: { type: 'string' },
						uptime: { type: 'number' },
						timestamp: { type: 'string' },
						memory: {
							type: 'object',
							properties: {
								used: { type: 'number' },
								total: { type: 'number' }
							}
						}
					}
				}
			}
		}
	}, healthCheck);
}

module.exports = healthRoutes;