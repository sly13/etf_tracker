const logger = require('../utils/logger');

// Middleware для логирования запросов
async function requestLogger(request, reply) {
	const start = Date.now();

	request.log.info({
		method: request.method,
		url: request.url,
		headers: request.headers,
		body: request.body
	}, 'Incoming request');

	reply.addHook('onSend', (request, reply, payload, done) => {
		const duration = Date.now() - start;

		request.log.info({
			method: request.method,
			url: request.url,
			statusCode: reply.statusCode,
			duration: `${duration}ms`
		}, 'Request completed');

		done();
	});
}

// Middleware для обработки ошибок
async function errorHandler(error, request, reply) {
	logger.error({
		error: error.message,
		stack: error.stack,
		url: request.url,
		method: request.method
	}, 'Request error');

	const statusCode = error.statusCode || 500;
	const message = statusCode === 500 ? 'Internal Server Error' : error.message;

	reply.status(statusCode).send({
		success: false,
		message,
		timestamp: new Date().toISOString()
	});
}

// Middleware для валидации API ключа (пример)
async function apiKeyAuth(request, reply) {
	const apiKey = request.headers['x-api-key'];

	if (!apiKey) {
		return reply.status(401).send({
			success: false,
			message: 'API key required',
			timestamp: new Date().toISOString()
		});
	}

	// Здесь можно добавить проверку API ключа
	if (apiKey !== process.env.API_KEY) {
		return reply.status(403).send({
			success: false,
			message: 'Invalid API key',
			timestamp: new Date().toISOString()
		});
	}
}

module.exports = {
	requestLogger,
	errorHandler,
	apiKeyAuth
};
