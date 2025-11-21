import api from '../utils/api';

const notificationDeliveriesService = {
	getNotificationDeliveries: async (page = 1, limit = 50, search = '', sent = '', channel = '') => {
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			});

			if (search) {
				params.append('search', search);
			}

			if (sent) {
				params.append('sent', sent);
			}

			if (channel) {
				params.append('channel', channel);
			}

			const response = await api.get(`/etf-flow/notification-deliveries?${params.toString()}`);
			return response.data;
		} catch (error) {
			console.error('Error fetching notification deliveries:', error);
			throw error;
		}
	},
};

export default notificationDeliveriesService;

