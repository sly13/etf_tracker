import api from '../utils/api';

const fundsService = {
	// Получить все фонды
	getAllFunds: async () => {
		try {
			const response = await api.get('/funds');
			return {
				success: true,
				funds: response.data || []
			};
		} catch (error) {
			console.error('Ошибка загрузки фондов:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка загрузки фондов'
			};
		}
	},

	// Получить детали фонда
	getFundDetails: async (fundKey, language) => {
		try {
			const params = language ? { lang: language } : {};
			const response = await api.get(`/funds/${fundKey}`, { params });
			return {
				success: true,
				fund: response.data
			};
		} catch (error) {
			console.error(`Ошибка загрузки фонда ${fundKey}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка загрузки фонда'
			};
		}
	},

	// Создать фонд
	createFund: async (data) => {
		try {
			const response = await api.post('/funds', data);
			return {
				success: true,
				fund: response.data
			};
		} catch (error) {
			console.error('Ошибка создания фонда:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка создания фонда'
			};
		}
	},

	// Обновить фонд
	updateFund: async (fundKey, data) => {
		try {
			const response = await api.put(`/funds/${fundKey}`, data);
			return {
				success: true,
				fund: response.data
			};
		} catch (error) {
			console.error(`Ошибка обновления фонда ${fundKey}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка обновления фонда'
			};
		}
	},

	// Удалить фонд
	deleteFund: async (fundKey) => {
		try {
			await api.delete(`/funds/${fundKey}`);
			return {
				success: true
			};
		} catch (error) {
			console.error(`Ошибка удаления фонда ${fundKey}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка удаления фонда'
			};
		}
	},

	// Получить переводы фонда
	getTranslations: async (fundKey) => {
		try {
			const response = await api.get(`/funds/${fundKey}/translations`);
			return {
				success: true,
				translations: response.data || []
			};
		} catch (error) {
			console.error(`Ошибка загрузки переводов для ${fundKey}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка загрузки переводов'
			};
		}
	},

	// Создать или обновить перевод
	createOrUpdateTranslation: async (fundKey, language, data) => {
		try {
			const response = await api.post(`/funds/${fundKey}/translations`, {
				language,
				...data
			});
			return {
				success: true,
				translation: response.data
			};
		} catch (error) {
			console.error(`Ошибка сохранения перевода для ${fundKey}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка сохранения перевода'
			};
		}
	},

	// Удалить перевод
	deleteTranslation: async (fundKey, language) => {
		try {
			await api.delete(`/funds/${fundKey}/translations/${language}`);
			return {
				success: true
			};
		} catch (error) {
			console.error(`Ошибка удаления перевода для ${fundKey}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка удаления перевода'
			};
		}
	},

	// Загрузить логотип
	uploadLogo: async (file) => {
		try {
			const formData = new FormData();
			formData.append('logo', file);

			const response = await api.post('/funds/logos/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return {
				success: true,
				url: response.data.url,
				filename: response.data.filename,
			};
		} catch (error) {
			console.error('Ошибка загрузки логотипа:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка загрузки логотипа'
			};
		}
	},

	// Удалить логотип
	deleteLogo: async (filename) => {
		try {
			await api.delete(`/funds/logos/${filename}`);
			return {
				success: true
			};
		} catch (error) {
			console.error(`Ошибка удаления логотипа ${filename}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Ошибка удаления логотипа'
			};
		}
	}
};

export default fundsService;

