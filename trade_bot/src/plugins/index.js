const config = require('../config');

module.exports = async function (fastify, opts) {
	// Регистрируем Helmet для безопасности
	await fastify.register(require('@fastify/helmet'));

	// Регистрируем Swagger
	await fastify.register(require('@fastify/swagger'), {
		swagger: config.swagger
	});

	// Регистрируем Swagger UI
	await fastify.register(require('@fastify/swagger-ui'), config.swaggerUi);
};
