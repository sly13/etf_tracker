// Схемы для валидации данных
const tradeSchema = {
	type: 'object',
	required: ['symbol', 'quantity', 'side'],
	properties: {
		symbol: {
			type: 'string',
			minLength: 1,
			maxLength: 10,
			pattern: '^[A-Z0-9]+$'
		},
		quantity: {
			type: 'number',
			minimum: 0.0001,
			maximum: 1000000
		},
		side: {
			type: 'string',
			enum: ['buy', 'sell']
		},
		price: {
			type: 'number',
			minimum: 0.0001
		},
		stopLoss: {
			type: 'number',
			minimum: 0.0001
		},
		takeProfit: {
			type: 'number',
			minimum: 0.0001
		}
	}
};

const paginationSchema = {
	type: 'object',
	properties: {
		page: {
			type: 'number',
			minimum: 1,
			default: 1
		},
		limit: {
			type: 'number',
			minimum: 1,
			maximum: 100,
			default: 10
		}
	}
};

const responseSchema = {
	type: 'object',
	properties: {
		success: { type: 'boolean' },
		message: { type: 'string' },
		data: { type: 'object' },
		timestamp: { type: 'string' }
	}
};

module.exports = {
	tradeSchema,
	paginationSchema,
	responseSchema
};
