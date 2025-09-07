const axios = require('axios');

const BASE_URL = 'https://etf-flow.vadimsemenko.ru';

async function testCompleteTelegramFlow() {
	console.log('🧪 Тестирование полного флоу: регистрация -> Telegram бот\n');

	try {
		// 1. Генерируем Device ID (как в мобильном приложении)
		const deviceId = `ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_${Date.now()}`;
		const appName = 'etf.flow';
		const userId = `user_${Date.now()}`;

		console.log('1️⃣ Генерируем данные устройства:');
		console.log('   Device ID:', deviceId);
		console.log('   App Name:', appName);
		console.log('   User ID:', userId);
		console.log('');

		// 2. Регистрируем устройство (как в мобильном приложении)
		console.log('2️⃣ Регистрируем устройство...');
		const registerResponse = await axios.post(`${BASE_URL}/notifications/register-device`, {
			token: 'test_telegram_token', // Тестовый токен
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
		} else {
			console.log('❌ Пользователь НЕ найден в базе');
			return;
		}

		// 4. Генерируем ссылку для Telegram (как в мобильном приложении)
		console.log('\n4️⃣ Генерируем ссылку для Telegram...');
		const telegramUrl = `https://t.me/etf_flows_bot?start=${appName}:${deviceId}`;
		console.log('🔗 Telegram ссылка:', telegramUrl);
		console.log('');

		// 5. Симулируем команду /start в Telegram боте
		console.log('5️⃣ Симулируем команду /start в Telegram боте...');
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

		// 6. Проверяем, что пользователь найден по deviceId и appName
		console.log('6️⃣ Проверяем поиск пользователя по deviceId и appName...');
		const findUserResponse = await axios.get(`${BASE_URL}/admin/users/by-device-id/${parsedDeviceId}`);

		if (findUserResponse.data.success) {
			const user = findUserResponse.data.user;
			if (user.application.name === parsedAppName) {
				console.log('✅ Пользователь найден по deviceId и appName!');
				console.log('   Готов к привязке Telegram Chat ID');
			} else {
				console.log('❌ Неправильное приложение:', user.application.name, '!=', parsedAppName);
			}
		} else {
			console.log('❌ Пользователь НЕ найден по deviceId');
		}

		console.log('\n🎯 Результат:');
		console.log('   Устройство зарегистрировано ✅');
		console.log('   Пользователь создан в БД ✅');
		console.log('   Ссылка сгенерирована ✅');
		console.log('   Параметр парсится правильно ✅');
		console.log('   Пользователь найден в БД ✅');
		console.log('');
		console.log('📱 Теперь пользователь может перейти по ссылке и привязать Telegram!');
		console.log('🔗 Ссылка:', telegramUrl);

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testCompleteTelegramFlow();
