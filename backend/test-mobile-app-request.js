const axios = require('axios');

const BASE_URL = 'http://localhost:3066';

async function testMobileAppRequest() {
	console.log('📱 Тестируем запрос как от мобильного приложения\n');

	// Имитируем данные, которые отправляет мобильное приложение
	const deviceId = 'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';
	const appName = 'etf.flow';

	try {
		console.log('📋 Имитируем запрос мобильного приложения...');
		console.log(`   Device ID: ${deviceId}`);
		console.log(`   App Name: ${appName}`);
		console.log('');

		// Точно такой же запрос, как в мобильном приложении
		const requestData = {
			token: 'test_telegram_token', // Как в мобильном приложении
			appName: appName, // AppConfig.appName
			userId: `user_${Date.now()}`, // Как в мобильном приложении
			deviceId: deviceId, // Передается напрямую
			deviceType: 'ios', // Platform.operatingSystem
			appVersion: '1.0.0',
			firstName: 'Тест',
			lastName: 'Пользователь',
			email: 'test@example.com',
		};

		console.log('📋 Данные запроса (как в мобильном приложении):');
		console.log(JSON.stringify(requestData, null, 2));
		console.log('');

		console.log('🔄 Отправляем запрос...');
		const response = await axios.post(`${BASE_URL}/notifications/register-device`, requestData);

		console.log('📊 Ответ сервера:');
		console.log('   Success:', response.data.success);
		console.log('   Message:', response.data.message);
		console.log('');

		if (response.data.success) {
			console.log('✅ Запрос успешен!');
			console.log('');
			console.log('📋 Проверьте логи сервера - должны быть видны:');
			console.log('   📥 === ВХОДЯЩИЕ ДАННЫЕ РЕГИСТРАЦИИ ===');
			console.log(`   Device ID: ${deviceId}`);
			console.log('   🔍 === ОБРАБОТКА DEVICE ID ===');
			console.log(`   Исходный deviceId: ${deviceId}`);
			console.log('   Обнаружен iOS префикс, убираем \'ios_\'');
			console.log('   Результат - OS: ios, Clean Device ID: B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765');
			console.log('');
			console.log('🎯 Если в логах НЕ видно deviceId, то проблема в мобильном приложении');
			console.log('🎯 Если в логах ВИДНО deviceId, то все работает правильно');
		} else {
			console.log('❌ Запрос неуспешен');
		}

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testMobileAppRequest();
