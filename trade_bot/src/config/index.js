module.exports = {
	server: {
		port: process.env.PORT || 3088,
		host: process.env.HOST || '0.0.0.0',
		logger: {
			level: process.env.LOG_LEVEL || 'info',
			prettyPrint: process.env.NODE_ENV === 'development'
		}
	},
	cors: {
		origin: true, // Разрешить все origins для отладки
		credentials: true
	},
	swagger: {
		info: {
			title: 'Trade Bot API',
			description: 'API для торгового бота',
			version: '1.0.0'
		},
		host: process.env.SWAGGER_HOST || 'localhost:3088',
		schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
		consumes: ['application/json'],
		produces: ['application/json']
	},
	swaggerUi: {
		routePrefix: '/docs',
		uiConfig: {
			docExpansion: 'full',
			deepLinking: false
		}
	},
	database: {
		url: process.env.DATABASE_URL || 'postgresql://etf_user:etf_password@postgres:5432/etf_tracker?schema=public'
	},
	okx: {
		apiKey: process.env.OKX_API_KEY,
		secretKey: process.env.OKX_SECRET_KEY,
		passphrase: process.env.OKX_PASSPHRASE,
		sandbox: process.env.OKX_SANDBOX === 'true',
		baseUrl: process.env.OKX_SANDBOX === 'true'
			? 'https://www.okx.com'
			: 'https://www.okx.com'
	},
	trading: {
		// Минимальное значение flow для открытия позиции
		minFlowThreshold: parseFloat(process.env.MIN_FLOW_THRESHOLD) || 1000000,
		// Максимальный размер позиции в USDT
		maxPositionSize: parseFloat(process.env.MAX_POSITION_SIZE) || 1000,
		// Интервал проверки данных в миллисекундах
		checkInterval: parseInt(process.env.CHECK_INTERVAL) || 60000, // 1 минута
		// Символы для торговли
		symbols: {
			btc: 'BTC-USDT',
			eth: 'ETH-USDT'
		}
	}
};
