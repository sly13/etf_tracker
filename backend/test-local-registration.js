const axios = require('axios');

const BASE_URL = 'http://localhost:3066'; // Локальный сервер

async function testLocalRegistration() {
	console.log('🧪 Тестирование регистрации на локальном сервере\n');

	const deviceId = 'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';
	const appName = 'etf.flow';

	try {
		console.log('1️⃣ Регистрируем устройство на локальном сервере...');
		const registerResponse = await axios.post(`${BASE_URL}/notifications/register-device`, {
			token: 'test_telegram_token',
			appName: appName,
			deviceId: deviceId,
			deviceType: 'ios',
			appVersion: '1.0.0',
			firstName: 'Тест',
			lastName: 'Пользователь',
			email: 'test@example.com',
		});

		console.log('✅ Регистрация успешна:', registerResponse.data);
		console.log('');

		// 2. Проверяем, что пользователь создался в БД
		console.log('2️⃣ Проверяем пользователя в базе данных...');
		const checkUserResponse = await axios.get(`${BASE_URL}/admin/users/by-device-id/${deviceId}`);

		if (checkUserResponse.data.success) {
			console.log('✅ Пользователь найден в базе:');
			console.log('   ID:', checkUserResponse.data.user.id);
			console.log('   Device ID:', checkUserResponse.data.user.deviceId);
			console.log('   Application:', checkUserResponse.data.user.application.name);
			console.log('   Telegram Chat ID:', checkUserResponse.data.user.telegramChatId || 'не привязан');
			console.log('   Settings:', JSON.stringify(checkUserResponse.data.user.settings, null, 2));
		} else {
			console.log('❌ Пользователь НЕ найден в базе');
		}

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);

		if (error.code === 'ECONNREFUSED') {
			console.log('\n💡 Локальный сервер не запущен. Запустите его командой:');
			console.log('   npm run start:dev');
		}
	}
}

testLocalRegistration();
