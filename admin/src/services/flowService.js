import api from '../utils/api';

const flowService = {
	// Получение данных ETF Flow (Ethereum)
	getETFFlowData: async (limit = null) => {
		try {
			const url = limit ? `/etf-flow/eth?limit=${limit}` : '/etf-flow/eth';
			const response = await api.get(url);
			return {
				success: true,
				data: response.data || []
			};
		} catch (error) {
			console.error('Error fetching ETF Flow data:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка загрузки данных ETF Flow'
			};
		}
	},

	// Получение данных BTC Flow (Bitcoin)
	getBTCFlowData: async (limit = null) => {
		try {
			const url = limit ? `/etf-flow/bitcoin?limit=${limit}` : '/etf-flow/bitcoin';
			const response = await api.get(url);
			return {
				success: true,
				data: response.data || []
			};
		} catch (error) {
			console.error('Error fetching BTC Flow data:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка загрузки данных BTC Flow'
			};
		}
	},

	// Получение сводки данных
	getFlowSummary: async () => {
		try {
			const response = await api.get('/summary');
			return {
				success: true,
				data: response.data
			};
		} catch (error) {
			console.error('Error fetching flow summary:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка загрузки сводки'
			};
		}
	},

	// Получение данных за конкретную дату
	getDailyFlowData: async (date) => {
		try {
			const response = await api.get(`/etf-flow/daily/${date}`);
			return {
				success: true,
				data: response.data
			};
		} catch (error) {
			console.error('Error fetching daily flow data:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка загрузки данных за день'
			};
		}
	}
};

export default flowService;
