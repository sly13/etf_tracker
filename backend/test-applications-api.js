const axios = require('axios');

const BASE_URL = 'http://localhost:3066';

// Тестовые данные
const testApplication = {
	name: 'test-app-' + Date.now(),
	displayName: 'Test Application',
	description: 'Тестовое приложение для проверки API',
	isActive: true
};

async function testApplicationsAPI() {
	console.log('🧪 Тестирование API приложений...\n');

	try {
		// 1. Создание приложения (без аутентификации - должно вернуть 401)
		console.log('1️⃣ Тестирование создания приложения без аутентификации...');
		try {
			await axios.post(`${BASE_URL}/applications/admin/create`, testApplication);
			console.log('❌ Ошибка: создание прошло без аутентификации');
		} catch (error) {
			if (error.response?.status === 401) {
				console.log('✅ Корректно: требуется аутентификация');
			} else {
				console.log('❌ Неожиданная ошибка:', error.response?.status);
			}
		}

		// 2. Получение списка приложений (публичный роут)
		console.log('\n2️⃣ Тестирование получения списка приложений...');
		try {
			const response = await axios.get(`${BASE_URL}/applications`);
			console.log('✅ Список приложений получен:', response.data);
		} catch (error) {
			console.log('❌ Ошибка получения списка:', error.response?.data || error.message);
		}

		// 3. Тестирование регистрации устройства
		console.log('\n3️⃣ Тестирование регистрации устройства...');
		try {
			const deviceData = {
				token: 'test_fcm_token_' + Date.now(),
				appName: 'etf-tracker', // Используем существующее приложение
				userId: 'test_user_' + Date.now(),
				deviceId: 'test_device_' + Date.now(),
				deviceInfo: {
					deviceType: 'android',
					appVersion: '1.0.0',
					osVersion: '13',
					language: 'ru',
					timezone: 'Europe/Moscow',
					deviceName: 'Test Device',
					firstName: 'Тест',
					lastName: 'Пользователь',
					email: 'test@example.com'
				}
			};

			const response = await axios.post(`${BASE_URL}/applications/register-device`, deviceData);
			console.log('✅ Устройство зарегистрировано:', response.data);
		} catch (error) {
			console.log('❌ Ошибка регистрации устройства:', error.response?.data || error.message);
		}

		// 4. Тестирование получения статистики
		console.log('\n4️⃣ Тестирование получения статистики...');
		try {
			const response = await axios.get(`${BASE_URL}/applications/etf-tracker/stats`);
			console.log('✅ Статистика получена:', response.data);
		} catch (error) {
			console.log('❌ Ошибка получения статистики:', error.response?.data || error.message);
		}

		console.log('\n🎉 Тестирование завершено!');
		console.log('\n📝 Для полного тестирования админских функций:');
		console.log('1. Получите JWT токен через POST /api/admin/login');
		console.log('2. Используйте токен в заголовке Authorization: Bearer <token>');
		console.log('3. Протестируйте создание, обновление и удаление приложений');

	} catch (error) {
		console.error('💥 Критическая ошибка:', error.message);
	}
}

// Запуск тестов
if (require.main === module) {
	testApplicationsAPI();
}

module.exports = { testApplicationsAPI };
