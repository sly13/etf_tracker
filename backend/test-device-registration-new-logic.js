const axios = require('axios');

const BASE_URL = 'http://localhost:3066';

async function testDeviceRegistration() {
	console.log('🧪 Тестируем регистрацию устройства с новой логикой\n');

	const deviceId = 'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';
	const appName = 'etf.flow';

	try {
		console.log('📱 Регистрируем устройство...');
		console.log('   Device ID (с префиксом):', deviceId);
		console.log('   App Name:', appName);
		console.log('');

		const response = await axios.post(`${BASE_URL}/notifications/register-device`, {
			token: 'test_telegram_token',
			appName: appName,
			userId: 'user_test_123',
			deviceId: deviceId,
			deviceType: 'ios',
			appVersion: '1.0.0',
			firstName: 'Тест',
			lastName: 'Пользователь',
			email: 'test@example.com',
		});

		console.log('📊 Ответ сервера:');
		console.log('   Success:', response.data.success);
		console.log('   Message:', response.data.message);
		console.log('');

		if (response.data.success) {
			console.log('✅ Устройство зарегистрировано успешно!');
			console.log('');

			// Проверяем, что сохранилось в БД
			console.log('🔍 Проверяем данные в БД...');
			const dbCheck = await axios.get(`${BASE_URL}/admin/users`);

			if (dbCheck.data.success && dbCheck.data.users.length > 0) {
				const user = dbCheck.data.users[0];
				console.log('📋 Данные пользователя в БД:');
				console.log('   ID:', user.id);
				console.log('   Device ID:', user.deviceId || 'НЕ СОХРАНЕН');
				console.log('   OS:', user.os || 'НЕ СОХРАНЕН');
				console.log('   Device Token:', user.deviceToken ? 'СОХРАНЕН' : 'НЕ СОХРАНЕН');
				console.log('   Application:', user.application?.name || 'НЕ СОХРАНЕН');
				console.log('');

				// Проверяем логику очистки deviceId
				const expectedCleanDeviceId = 'B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';
				const expectedOs = 'ios';

				console.log('🎯 Ожидаемые значения:');
				console.log('   Clean Device ID:', expectedCleanDeviceId);
				console.log('   OS:', expectedOs);
				console.log('');

				if (user.deviceId === expectedCleanDeviceId) {
					console.log('✅ Device ID очищен правильно!');
				} else {
					console.log('❌ Device ID НЕ очищен правильно!');
					console.log('   Ожидалось:', expectedCleanDeviceId);
					console.log('   Получено:', user.deviceId);
				}

				if (user.os === expectedOs) {
					console.log('✅ OS сохранен правильно!');
				} else {
					console.log('❌ OS НЕ сохранен правильно!');
					console.log('   Ожидалось:', expectedOs);
					console.log('   Получено:', user.os);
				}
			} else {
				console.log('❌ Не удалось получить данные пользователя из БД');
			}
		} else {
			console.log('❌ Ошибка регистрации устройства');
		}

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testDeviceRegistration();
