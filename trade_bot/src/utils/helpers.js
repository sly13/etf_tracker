const logger = require('./logger');

function validateTradeData(data) {
	const errors = [];

	if (!data.symbol) {
		errors.push('Symbol is required');
	}

	if (!data.quantity || data.quantity <= 0) {
		errors.push('Quantity must be positive');
	}

	if (!data.side || !['buy', 'sell'].includes(data.side)) {
		errors.push('Side must be "buy" or "sell"');
	}

	if (errors.length > 0) {
		const error = new Error('Validation failed');
		error.details = errors;
		throw error;
	}

	return true;
}

function formatResponse(data, message = 'Success') {
	return {
		success: true,
		message,
		data,
		timestamp: new Date().toISOString()
	};
}

function formatError(error, message = 'Error occurred') {
	logger.error(error);

	return {
		success: false,
		message,
		error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
		timestamp: new Date().toISOString()
	};
}

module.exports = {
	validateTradeData,
	formatResponse,
	formatError
};
