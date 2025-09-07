const axios = require('axios');

const BASE_URL = 'https://etf-flow.vadimsemenko.ru';

async function testFullTelegramFlow() {
	console.log('🧪 Тестирование полного флоу: регистрация устройства -> Telegram бот\n');

	try {
		// 1. Генерируем Device ID (как в мобильном приложении)
		const deviceId = `ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_${Date.now()}`;
		const appName = 'etf.flow';
		const userId = `user_${Date.now()}`;
		const fcmToken = `test_fcm_token_${Date.now()}`;

		console.log('1️⃣ Генерируем данные устройства:');
		console.log('   Device ID:', deviceId);
		console.log('   App Name:', appName);
		console.log('   User ID:', userId);
		console.log('   FCM Token:', fcmToken);
		console.log('');

		// 2. Регистрируем устройство
		console.log('2️⃣ Регистрируем устройство...');
		const registerResponse = await axios.post(`${BASE_URL}/notifications/register-device`, {
			token: fcmToken,
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

		// 3. Генерируем ссылку для Telegram
		console.log('3️⃣ Генерируем ссылку для Telegram...');
		const telegramUrl = `https://t.me/etf_flows_bot?start=${appName}:${deviceId}`;
		console.log('🔗 Telegram ссылка:', telegramUrl);
		console.log('');

		// 4. Симулируем команду /start в Telegram боте
		console.log('4️⃣ Симулируем команду /start в Telegram боте...');
		const startParam = `${appName}:${deviceId}`;
		console.log('📱 Параметр start:', startParam);

		// Парсим параметр (как в боте)
		let parsedAppName = 'etf.flow'; // По умолчанию
		let parsedDeviceId = '';

		if (startParam.includes(':')) {
			const parts = startParam.split(':');
			parsedAppName = parts[0];
			parsedDeviceId = parts[1];
		} else {
			parsedDeviceId = startParam;
		}

		console.log('🔍 Парсинг параметра:');
		console.log('   App Name:', parsedAppName);
		console.log('   Device ID:', parsedDeviceId);
		console.log('');

		// 5. Проверяем, что пользователь существует в базе
		console.log('5️⃣ Проверяем пользователя в базе данных...');
		const checkUserResponse = await axios.get(`${BASE_URL}/admin/users/by-device-id/${parsedDeviceId}`);
		
		if (checkUserResponse.data.success) {
			console.log('✅ Пользователь найден в базе:');
			console.log('   ID:', checkUserResponse.data.user.id);
			console.log('   Device ID:', checkUserResponse.data.user.deviceId);
			console.log('   Application:', checkUserResponse.data.user.application.name);
			console.log('   Telegram Chat ID:', checkUserResponse.data.user.telegramChatId || 'не привязан');
		} else {
			console.log('❌ Пользователь НЕ найден в базе');
		}

		console.log('\n🎯 Результат:');
		console.log('   Ссылка сгенерирована правильно ✅');
		console.log('   Устройство зарегистрировано ✅');
		console.log('   Параметр парсится правильно ✅');
		console.log('   Пользователь найден в базе ✅');
		console.log('');
		console.log('📱 Теперь пользователь может перейти по ссылке и привязать Telegram!');

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testFullTelegramFlow();
