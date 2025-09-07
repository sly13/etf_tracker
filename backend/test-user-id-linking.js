const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testUserLinking() {
	console.log('🧪 Тестирование связывания пользователей через User ID\n');

	try {
		// 1. Регистрация пользователя с User ID
		console.log('1️⃣ Регистрация пользователя с User ID...');
		const registerResponse = await axios.post(`${BASE_URL}/applications/register-device`, {
			token: 'test_fcm_token_123',
			appName: 'etf.flow',
			userId: 'user_12345', // Уникальный ID из мобильного приложения
			deviceInfo: {
				deviceType: 'android',
				appVersion: '1.0.0',
				firstName: 'Иван',
				lastName: 'Петров',
				email: 'ivan@example.com',
				phone: '+7900123456'
			}
		});

		console.log('✅ Регистрация успешна:', registerResponse.data);
		console.log('');

		// 2. Проверка информации о пользователе
		console.log('2️⃣ Получение информации о пользователе...');
		const userResponse = await axios.get(`${BASE_URL}/applications/user/test_fcm_token_123`);
		console.log('👤 Информация о пользователе:', JSON.stringify(userResponse.data, null, 2));
		console.log('');

		// 3. Привязка Telegram по User ID
		console.log('3️⃣ Привязка Telegram аккаунта по User ID...');
		const linkResponse = await axios.post(`${BASE_URL}/applications/link-telegram-by-user-id`, {
			userId: 'user_12345',
			telegramChatId: '123456789'
		});

		console.log('🔗 Результат привязки:', linkResponse.data);
		console.log('');

		// 4. Проверка обновленной информации о пользователе
		console.log('4️⃣ Проверка обновленной информации...');
		const updatedUserResponse = await axios.get(`${BASE_URL}/applications/user/test_fcm_token_123`);
		console.log('👤 Обновленная информация:', JSON.stringify(updatedUserResponse.data, null, 2));
		console.log('');

		// 5. Тест отправки уведомления
		console.log('5️⃣ Тест отправки уведомления...');
		const testNotificationResponse = await axios.post(`${BASE_URL}/applications/user/test_fcm_token_123/test-notification`);
		console.log('📱 Результат тестового уведомления:', testNotificationResponse.data);
		console.log('');

		// 6. Статистика приложения
		console.log('6️⃣ Статистика приложения...');
		const statsResponse = await axios.get(`${BASE_URL}/applications/etf.flow/stats`);
		console.log('📊 Статистика:', JSON.stringify(statsResponse.data, null, 2));

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

// Запуск теста
testUserLinking().then(() => {
	console.log('\n🎉 Тестирование завершено!');
}).catch(error => {
	console.error('💥 Критическая ошибка:', error.message);
});
