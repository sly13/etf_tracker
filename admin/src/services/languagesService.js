import api from '../utils/api';

const languagesService = {
	// Получить все языки
	getAllLanguages: async () => {
		try {
			const response = await api.get('/languages');
			return {
				success: true,
				languages: response.data.languages || []
			};
		} catch (error) {
			console.error('Ошибка загрузки языков:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка загрузки языков'
			};
		}
	},

	// Получить язык по ID
	getLanguageById: async (id) => {
		try {
			const response = await api.get(`/languages/${id}`);
			return {
				success: true,
				language: response.data.language
			};
		} catch (error) {
			console.error(`Ошибка загрузки языка ${id}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка загрузки языка'
			};
		}
	},

	// Создать язык
	createLanguage: async (data) => {
		try {
			const response = await api.post('/languages', data);
			return {
				success: true,
				language: response.data.language
			};
		} catch (error) {
			console.error('Ошибка создания языка:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка создания языка'
			};
		}
	},

	// Обновить язык
	updateLanguage: async (id, data) => {
		try {
			const response = await api.put(`/languages/${id}`, data);
			return {
				success: true,
				language: response.data.language
			};
		} catch (error) {
			console.error(`Ошибка обновления языка ${id}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка обновления языка'
			};
		}
	},

	// Удалить язык
	deleteLanguage: async (id) => {
		try {
			await api.delete(`/languages/${id}`);
			return {
				success: true
			};
		} catch (error) {
			console.error(`Ошибка удаления языка ${id}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка удаления языка'
			};
		}
	}
};

export default languagesService;

