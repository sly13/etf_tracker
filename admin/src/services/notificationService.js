import api from '../utils/api';

const notificationService = {
	/**
	 * Отправка тестового уведомления на телефон пользователя
	 */
	sendTestPhoneNotification: async (userId, message) => {
		try {
			const response = await api.post('/notifications/send-test-phone', {
				userId,
				message: message || 'Тестовое уведомление из админской панели'
			});
			return response.data;
		} catch (error) {
			console.error('Ошибка отправки тестового уведомления на телефон:', error);
			throw error;
		}
	},

	/**
	 * Отправка тестового уведомления через Telegram
	 */
	sendTestTelegramNotification: async (userId, message) => {
		try {
			const response = await api.post('/notifications/send-test-telegram', {
				userId,
				message: message || 'Тестовое уведомление из админской панели'
			});
			return response.data;
		} catch (error) {
			console.error('Ошибка отправки тестового Telegram уведомления:', error);
			throw error;
		}
	},

	/**
	 * Отправка тестового уведомления всем пользователям
	 */
	sendTestNotificationToAll: async () => {
		try {
			const response = await api.post('/notifications/test');
			return response.data;
		} catch (error) {
			console.error('Ошибка отправки тестового уведомления всем пользователям:', error);
			throw error;
		}
	}
};

export default notificationService;
