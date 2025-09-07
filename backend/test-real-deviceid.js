const axios = require('axios');

const BASE_URL = 'http://localhost:3066';

async function testRealDeviceId() {
	console.log('🔍 Тестируем с реальным deviceId из Telegram ссылки\n');

	// Это deviceId из вашей Telegram ссылки
	const deviceId = 'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';
	const appName = 'etf.flow';

	try {
		console.log('📱 Отправляем запрос с реальным deviceId...');
		console.log(`   Device ID: ${deviceId}`);
		console.log(`   App Name: ${appName}`);
		console.log('');

		const requestData = {
			token: 'test_telegram_token',
			appName: appName,
			userId: 'user_real_test',
			deviceId: deviceId, // Реальный deviceId из Telegram ссылки
			deviceType: 'ios',
			appVersion: '1.0.0',
			firstName: 'Real',
			lastName: 'User',
			email: 'real@test.com',
		};

		console.log('📋 Данные запроса:');
		console.log(JSON.stringify(requestData, null, 2));
		console.log('');

		const response = await axios.post(`${BASE_URL}/notifications/register-device`, requestData);

		console.log('📊 Ответ сервера:');
		console.log('   Success:', response.data.success);
		console.log('   Message:', response.data.message);
		console.log('');

		if (response.data.success) {
			console.log('✅ Запрос успешен!');
			console.log('');
			console.log('📋 Теперь проверьте логи сервера - должны быть видны:');
			console.log(`   Device ID: ${deviceId}`);
			console.log('   OS: ios');
			console.log('   Clean Device ID: B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765');
			console.log('');
			console.log('🔗 После этого Telegram ссылка должна работать:');
			console.log(`   https://t.me/etf_flows_bot?start=${appName}:${deviceId}`);
		} else {
			console.log('❌ Запрос неуспешен');
		}

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testRealDeviceId();
