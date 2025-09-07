import api from '../utils/api';

class DashboardService {
	// Получение статистики для дашборда
	async getDashboardStats() {
		try {
			const response = await api.get('/admin/dashboard/stats');
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// Обработка ошибок
	handleError(error) {
		if (error.response) {
			// Сервер ответил с кодом ошибки
			const { status, data } = error.response;

			switch (status) {
				case 400:
					return new Error(data.message || 'Неверные данные запроса');
				case 401:
					return new Error('Необходима авторизация');
				case 403:
					return new Error('Доступ запрещен');
				case 404:
					return new Error('Данные не найдены');
				case 500:
					return new Error('Внутренняя ошибка сервера');
				default:
					return new Error(data.message || 'Произошла ошибка');
			}
		} else if (error.request) {
			// Запрос был отправлен, но ответ не получен
			return new Error('Сервер недоступен. Проверьте подключение к интернету.');
		} else {
			// Что-то пошло не так при настройке запроса
			return new Error('Ошибка настройки запроса');
		}
	}
}

const dashboardService = new DashboardService();
export default dashboardService;
