import axios from 'axios';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
	baseURL: process.env.REACT_APP_API_URL || 'https://etf-flow.vadimsemenko.ru/api',
	timeout: 10000,
});

// Интерцептор для добавления JWT токена к запросам
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('admin_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Интерцептор для обработки ответов
api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response?.status === 401) {
			// Токен истек или недействителен
			localStorage.removeItem('admin_token');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

export default api;
