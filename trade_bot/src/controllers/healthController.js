const { getHealthStatus } = require('../services/healthService');

async function healthCheck(request, reply) {
	try {
		const health = await getHealthStatus();
		return reply.code(200).send(health);
	} catch (error) {
		return reply.code(500).send({
			status: 'error',
			message: 'Health check failed',
			error: error.message
		});
	}
}

async function getInfo(request, reply) {
	return reply.send({
		message: 'Trade Bot API работает!',
		version: '1.0.0',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development'
	});
}

module.exports = {
	healthCheck,
	getInfo
};
