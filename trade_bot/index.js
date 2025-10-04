// Загружаем переменные окружения из .env файла
require('dotenv').config();

const fastify = require('fastify');
const config = require('./src/config');
const logger = require('./src/utils/logger');
const databaseService = require('./src/services/databaseService');
const flowMonitoringService = require('./src/services/flowMonitoringService');

// Создаем экземпляр Fastify с конфигурацией
const app = fastify({
	logger: config.server.logger
});

// Функция для регистрации плагинов и роутов
async function registerPlugins() {
	// Регистрируем CORS напрямую
	await app.register(require('@fastify/cors'), {
		origin: true,
		credentials: true
	});

	// Добавляем CORS заголовки вручную для всех ответов
	app.addHook('onResponse', async (request, reply) => {
		reply.header('Access-Control-Allow-Origin', request.headers.origin || '*');
		reply.header('Access-Control-Allow-Credentials', 'true');
		reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	});

	// Регистрируем основные плагины
	await app.register(require('./src/plugins'));

	// Регистрируем роуты
	await app.register(require('./src/routes/health'));
	await app.register(require('./src/routes/trading'), { prefix: '/api/trading' });
	await app.register(require('./src/routes/bot'), { prefix: '/api/bot' });
	await app.register(require('./src/routes/okx'), { prefix: '/api/okx' });
}

// Функция инициализации сервисов
async function initializeServices() {
	try {
		// Подключаемся к базе данных
		await databaseService.connect();

		// Проверяем подключение к OKX (если настроено)
		if (config.okx.apiKey) {
			const okxConnected = await require('./src/services/okxService').checkConnection();
			if (okxConnected) {
				logger.info('✅ OKX API подключен');
			} else {
				logger.warn('⚠️ OKX API не подключен - торговля недоступна');
			}
		} else {
			logger.warn('⚠️ OKX API ключи не настроены - торговля недоступна');
		}

		// Автоматически запускаем мониторинг, если указано в переменных окружения
		if (process.env.AUTO_START_MONITORING === 'true') {
			await flowMonitoringService.start();
			logger.info('🤖 Автоматический запуск мониторинга Flow данных');
		}

	} catch (error) {
		logger.error('❌ Ошибка инициализации сервисов:', error);
		throw error;
	}
}

// Функция запуска сервера
async function start() {
	try {
		// Регистрируем все плагины и роуты
		await registerPlugins();

		// Инициализируем сервисы
		await initializeServices();

		// Запускаем сервер
		await app.listen({
			port: config.server.port,
			host: config.server.host
		});

		logger.info(`🚀 Сервер запущен на порту ${config.server.port}`);
		logger.info(`📚 Swagger документация: http://${config.server.host}:${config.server.port}/docs`);
		logger.info(`🤖 Bot API: http://${config.server.host}:${config.server.port}/api/bot`);

	} catch (err) {
		logger.error('Ошибка запуска сервера:', err);
		console.error('Детали ошибки:', err);
		process.exit(1);
	}
}

// Graceful shutdown функция
async function gracefulShutdown(signal) {
	logger.info(`Получен сигнал ${signal}, завершаем работу...`);

	try {
		// Останавливаем мониторинг
		if (flowMonitoringService.isRunning) {
			await flowMonitoringService.stop();
		}

		// Закрываем подключение к БД
		if (databaseService.isConnected) {
			await databaseService.disconnect();
		}

		// Закрываем сервер
		await app.close();

		logger.info('✅ Graceful shutdown завершен');
		process.exit(0);
	} catch (error) {
		logger.error('❌ Ошибка при graceful shutdown:', error);
		process.exit(1);
	}
}

// Обработка сигналов для graceful shutdown
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Обработка необработанных ошибок
process.on('uncaughtException', (error) => {
	logger.error('❌ Необработанная ошибка:', error);
	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
	logger.error('❌ Необработанное отклонение промиса:', reason);
	process.exit(1);
});

// Запускаем сервер
start();
