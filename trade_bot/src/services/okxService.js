const crypto = require('crypto');
const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class OKXService {
	constructor() {
		this.apiKey = config.okx.apiKey;
		this.secretKey = config.okx.secretKey;
		this.passphrase = config.okx.passphrase;
		this.baseUrl = config.okx.baseUrl;
		this.isAuthenticated = false;
	}

	// Создание подписи для OKX API (точная копия рабочего кода)
	sign({ timestamp, method, requestPath, body = "" }) {
		const prehash = `${timestamp}${method.toUpperCase()}${requestPath}${body}`;
		const hmac = crypto.createHmac("sha256", this.secretKey);
		hmac.update(prehash);
		return { signature: hmac.digest("base64"), prehash };
	}

	// Получить баланс аккаунта (адаптированная версия для контроллера)
	async getBalance(ccy = "") {
		try {
			const response = await this.getBalanceRaw(ccy);
			return response.data;
		} catch (error) {
			logger.error('Ошибка получения баланса:', error);
			throw error;
		}
	}

	// Получить баланс аккаунта (сырой ответ от API)
	async getBalanceRaw(ccy = "") {
		const method = "GET";
		const q = ccy ? `?ccy=${encodeURIComponent(ccy)}` : "";
		const requestPath = `/api/v5/account/balance${q}`;
		const timestamp = new Date().toISOString(); // важно: ISO8601 timestamp, UTC
		const { signature, prehash } = this.sign({ timestamp, method, requestPath, body: "" });

		logger.info("=== OKX DEBUG ===");
		logger.info("DEBUG timestamp:", timestamp);
		logger.info("DEBUG prehash:", prehash);
		logger.info("DEBUG signature:", signature);
		logger.info("DEBUG API_KEY:", this.apiKey);
		logger.info("DEBUG API_SECRET:", this.secretKey);
		logger.info("DEBUG API_PASSPHRASE:", this.passphrase);

		const headers = {
			"OK-ACCESS-KEY": this.apiKey,
			"OK-ACCESS-SIGN": signature,
			"OK-ACCESS-TIMESTAMP": timestamp,
			"OK-ACCESS-PASSPHRASE": this.passphrase,
			"Content-Type": "application/json",
		};

		logger.info("DEBUG headers:", JSON.stringify(headers, null, 2));

		const res = await axios({
			method,
			url: `${this.baseUrl}${requestPath}`,
			headers,
		});

		if (res.status !== 200) {
			logger.error(`HTTP ${res.status} ${res.statusText}`);
			logger.error("Response body:", res.data);
			throw new Error(`Request failed: ${res.status}`);
		}

		return res.data;
	}

	// Получить баланс для нескольких валют
	async getBalanceMultiple(ccyList = []) {
		const method = "GET";
		const ccyString = ccyList.join(',');
		const q = ccyString ? `?ccy=${encodeURIComponent(ccyString)}` : "";
		const requestPath = `/api/v5/account/balance${q}`;
		const timestamp = new Date().toISOString();
		const { signature, prehash } = this.sign({ timestamp, method, requestPath, body: "" });

		const headers = {
			"OK-ACCESS-KEY": this.apiKey,
			"OK-ACCESS-SIGN": signature,
			"OK-ACCESS-TIMESTAMP": timestamp,
			"OK-ACCESS-PASSPHRASE": this.passphrase,
			"Content-Type": "application/json",
		};

		const url = `${this.baseUrl}${requestPath}`;
		const response = await axios({
			method,
			url,
			headers,
			timeout: 10000
		});

		return response.data;
	}

	// Публичный запрос (без аутентификации)
	async makePublicRequest(method, endpoint, data = null) {
		try {
			const url = `${this.baseUrl}${endpoint}`;
			const body = data ? JSON.stringify(data) : '';

			const response = await axios({
				method,
				url,
				data: body,
				timeout: 10000
			});

			return response.data;
		} catch (error) {
			logger.error('Ошибка публичного OKX API запроса:', {
				endpoint,
				method,
				error: error.response?.data || error.message
			});
			throw error;
		}
	}

	// Получить информацию об аккаунте
	async getAccountInfo() {
		try {
			const response = await this.getBalanceRaw("USDT");

			if (response.code === '0') {
				this.isAuthenticated = true;
				logger.info('✅ OKX API аутентификация успешна');
				return response.data;
			} else {
				throw new Error(`OKX API error: ${response.msg}`);
			}
		} catch (error) {
			logger.error('❌ Ошибка аутентификации OKX:', error);
			throw error;
		}
	}

	// Получить подробную информацию об аккаунте
	async getAccountDetails() {
		try {
			const method = "GET";
			const requestPath = "/api/v5/account/config";
			const timestamp = new Date().toISOString();
			const { signature, prehash } = this.sign({ timestamp, method, requestPath, body: "" });

			const headers = {
				"OK-ACCESS-KEY": this.apiKey,
				"OK-ACCESS-SIGN": signature,
				"OK-ACCESS-TIMESTAMP": timestamp,
				"OK-ACCESS-PASSPHRASE": this.passphrase,
				"Content-Type": "application/json",
			};

			const url = `${this.baseUrl}${requestPath}`;
			const response = await axios({
				method,
				url,
				headers,
				timeout: 10000
			});

			if (response.data.code === '0') {
				return response.data.data[0];
			} else {
				throw new Error(`OKX API error: ${response.data.msg}`);
			}
		} catch (error) {
			logger.error('Ошибка получения информации об аккаунте:', error);
			throw error;
		}
	}

	// Получить текущую цену символа (публичный API)
	async getTicker(symbol) {
		try {
			// Прямой вызов OKX API
			const axios = require('axios');
			const response = await axios.get(`https://www.okx.com/api/v5/market/ticker?instId=${symbol}`);

			if (response.data.code === '0' && response.data.data && response.data.data.length > 0) {
				const tickerData = response.data.data[0];

				return {
					symbol: tickerData.instId,
					price: parseFloat(tickerData.last),
					bid: parseFloat(tickerData.bidPx),
					ask: parseFloat(tickerData.askPx),
					volume: parseFloat(tickerData.vol24h)
				};
			} else {
				throw new Error(`Не удалось получить цену для ${symbol}`);
			}
		} catch (error) {
			logger.error(`Ошибка получения цены ${symbol}:`, error);
			throw error;
		}
	}

	// Разместить рыночный ордер
	async placeMarketOrder(symbol, side, size) {
		try {
			const method = "POST";
			const requestPath = "/api/v5/trade/order";
			const timestamp = new Date().toISOString();

			const orderData = {
				instId: symbol,
				tdMode: 'cash',
				side: side,
				ordType: 'market',
				sz: size.toString()
			};

			const body = JSON.stringify(orderData);
			const { signature } = this.sign({ timestamp, method, requestPath, body });

			const headers = {
				"OK-ACCESS-KEY": this.apiKey,
				"OK-ACCESS-SIGN": signature,
				"OK-ACCESS-TIMESTAMP": timestamp,
				"OK-ACCESS-PASSPHRASE": this.passphrase,
				"Content-Type": "application/json",
			};

			const response = await axios({
				method,
				url: `${this.baseUrl}${requestPath}`,
				headers,
				data: body
			});

			if (response.data.code === '0') {
				logger.info(`📈 Ордер размещен: ${symbol} ${side} ${size}`, response.data.data[0]);
				return response.data.data[0];
			} else {
				throw new Error(`Ошибка размещения ордера: ${response.data.msg}`);
			}
		} catch (error) {
			logger.error('Ошибка размещения ордера:', error);
			throw error;
		}
	}

	// Разместить лимитный ордер
	async placeLimitOrder(symbol, side, size, price) {
		try {
			const method = "POST";
			const requestPath = "/api/v5/trade/order";
			const timestamp = new Date().toISOString();

			const orderData = {
				instId: symbol,
				tdMode: 'cash',
				side: side,
				ordType: 'limit',
				sz: size.toString(),
				px: price.toString()
			};

			const body = JSON.stringify(orderData);
			const { signature } = this.sign({ timestamp, method, requestPath, body });

			const headers = {
				"OK-ACCESS-KEY": this.apiKey,
				"OK-ACCESS-SIGN": signature,
				"OK-ACCESS-TIMESTAMP": timestamp,
				"OK-ACCESS-PASSPHRASE": this.passphrase,
				"Content-Type": "application/json",
			};

			const response = await axios({
				method,
				url: `${this.baseUrl}${requestPath}`,
				headers,
				data: body
			});

			if (response.data.code === '0') {
				logger.info(`📊 Лимитный ордер размещен: ${symbol} ${side} ${size} @ ${price}`, response.data.data[0]);
				return response.data.data[0];
			} else {
				throw new Error(`Ошибка размещения лимитного ордера: ${response.data.msg}`);
			}
		} catch (error) {
			logger.error('Ошибка размещения лимитного ордера:', error);
			throw error;
		}
	}

	// Отменить ордер
	async cancelOrder(symbol, orderId) {
		try {
			const method = "POST";
			const requestPath = "/api/v5/trade/cancel-order";
			const timestamp = new Date().toISOString();

			const cancelData = {
				instId: symbol,
				ordId: orderId
			};

			const body = JSON.stringify(cancelData);
			const { signature } = this.sign({ timestamp, method, requestPath, body });

			const headers = {
				"OK-ACCESS-KEY": this.apiKey,
				"OK-ACCESS-SIGN": signature,
				"OK-ACCESS-TIMESTAMP": timestamp,
				"OK-ACCESS-PASSPHRASE": this.passphrase,
				"Content-Type": "application/json",
			};

			const response = await axios({
				method,
				url: `${this.baseUrl}${requestPath}`,
				headers,
				data: body
			});

			if (response.data.code === '0') {
				logger.info(`❌ Ордер отменен: ${orderId}`);
				return response.data.data[0];
			} else {
				throw new Error(`Ошибка отмены ордера: ${response.data.msg}`);
			}
		} catch (error) {
			logger.error('Ошибка отмены ордера:', error);
			throw error;
		}
	}

	// Получить информацию об ордере
	async getOrderInfo(symbol, orderId) {
		try {
			const method = "GET";
			const requestPath = `/api/v5/trade/order?instId=${symbol}&ordId=${orderId}`;
			const timestamp = new Date().toISOString();
			const { signature } = this.sign({ timestamp, method, requestPath, body: "" });

			const headers = {
				"OK-ACCESS-KEY": this.apiKey,
				"OK-ACCESS-SIGN": signature,
				"OK-ACCESS-TIMESTAMP": timestamp,
				"OK-ACCESS-PASSPHRASE": this.passphrase,
				"Content-Type": "application/json",
			};

			const response = await axios({
				method,
				url: `${this.baseUrl}${requestPath}`,
				headers
			});

			if (response.data.code === '0' && response.data.data.length > 0) {
				return response.data.data[0];
			} else {
				throw new Error(`Ордер не найден: ${orderId}`);
			}
		} catch (error) {
			logger.error('Ошибка получения информации об ордере:', error);
			throw error;
		}
	}

	// Получить открытые ордера
	async getOpenOrders(symbol = null) {
		try {
			const method = "GET";
			const requestPath = symbol
				? `/api/v5/trade/orders-pending?instId=${symbol}`
				: '/api/v5/trade/orders-pending';
			const timestamp = new Date().toISOString();
			const { signature } = this.sign({ timestamp, method, requestPath, body: "" });

			const headers = {
				"OK-ACCESS-KEY": this.apiKey,
				"OK-ACCESS-SIGN": signature,
				"OK-ACCESS-TIMESTAMP": timestamp,
				"OK-ACCESS-PASSPHRASE": this.passphrase,
				"Content-Type": "application/json",
			};

			const response = await axios({
				method,
				url: `${this.baseUrl}${requestPath}`,
				headers
			});

			if (response.data.code === '0') {
				return response.data.data;
			} else {
				throw new Error(`Ошибка получения открытых ордеров: ${response.data.msg}`);
			}
		} catch (error) {
			logger.error('Ошибка получения открытых ордеров:', error);
			throw error;
		}
	}

	// Получить историю ордеров
	async getOrderHistory(symbol = null, limit = 100) {
		try {
			const method = "GET";
			const requestPath = symbol
				? `/api/v5/trade/orders-history?instId=${symbol}&limit=${limit}`
				: `/api/v5/trade/orders-history?limit=${limit}`;
			const timestamp = new Date().toISOString();
			const { signature } = this.sign({ timestamp, method, requestPath, body: "" });

			const headers = {
				"OK-ACCESS-KEY": this.apiKey,
				"OK-ACCESS-SIGN": signature,
				"OK-ACCESS-TIMESTAMP": timestamp,
				"OK-ACCESS-PASSPHRASE": this.passphrase,
				"Content-Type": "application/json",
			};

			const response = await axios({
				method,
				url: `${this.baseUrl}${requestPath}`,
				headers
			});

			if (response.data.code === '0') {
				return response.data.data;
			} else {
				throw new Error(`Ошибка получения истории ордеров: ${response.data.msg}`);
			}
		} catch (error) {
			logger.error('Ошибка получения истории ордеров:', error);
			throw error;
		}
	}

	// Проверить подключение к API
	async checkConnection() {
		try {
			await this.getAccountInfo();
			return true;
		} catch (error) {
			logger.error('❌ Нет подключения к OKX API:', error.message);
			return false;
		}
	}
}

module.exports = new OKXService();