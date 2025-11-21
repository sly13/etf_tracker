import api from '../utils/api';

const etfNewRecordsService = {
	getNewRecords: async (page = 1, limit = 50, search = '') => {
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			});

			if (search) {
				params.append('search', search);
			}

			const response = await api.get(`/etf-flow/new-records?${params.toString()}`);
			return response.data;
		} catch (error) {
			console.error('Error fetching ETF new records:', error);
			throw error;
		}
	},
	deleteRecord: async (id) => {
		try {
			const response = await api.delete(`/etf-flow/new-records/${id}`);
			return response.data;
		} catch (error) {
			console.error('Error deleting ETF new record:', error);
			throw error;
		}
	},
};

export default etfNewRecordsService;

