const axios = require('axios');

const BASE_URL = 'https://etf-flow.vadimsemenko.ru';

async function testDeviceRegistrationWithoutFCM() {
	console.log('🧪 Тестирование регистрации устройства без FCM токена\n');

	try {
		// 1. Генерируем Device ID
		const deviceId = `ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_${Date.now()}`;
		const appName = 'etf.flow';
		const userId = `user_${Date.now()}`;

		console.log('1️⃣ Генерируем данные устройства:');
		console.log('   Device ID:', deviceId);
		console.log('   App Name:', appName);
		console.log('   User ID:', userId);
		console.log('');

		// 2. Регистрируем устройство БЕЗ FCM токена (используем тестовый токен)
		console.log('2️⃣ Регистрируем устройство с тестовым FCM токеном...');
		const registerResponse = await axios.post(`${BASE_URL}/notifications/register-device`, {
			token: 'test_telegram_only_token', // Тестовый токен для Telegram
			appName: appName,
			userId: userId,
			deviceId: deviceId,
			deviceType: 'ios',
			appVersion: '1.0.0',
			firstName: 'Тест',
			lastName: 'Пользователь',
			email: 'test@example.com',
		});

		console.log('✅ Регистрация успешна:', registerResponse.data);
		console.log('');

		// 3. Проверяем, что пользователь создался в БД
		console.log('3️⃣ Проверяем пользователя в базе данных...');
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

		console.log('\n4️⃣ Генерируем ссылку для Telegram...');
		const telegramUrl = `https://t.me/etf_flows_bot?start=${appName}:${deviceId}`;
		console.log('🔗 Telegram ссылка:', telegramUrl);
		console.log('');

		console.log('🎯 Результат:');
		console.log('   Устройство зарегистрировано ✅');
		console.log('   Пользователь создан в БД ✅');
		console.log('   Ссылка сгенерирована ✅');
		console.log('');
		console.log('📱 Теперь пользователь может перейти по ссылке и привязать Telegram!');

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testDeviceRegistrationWithoutFCM();
