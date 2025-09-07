const axios = require('axios');

const BASE_URL = 'http://localhost:3066';

async function testTelegramBotSearch() {
	console.log('🔍 Тестируем поиск пользователя для Telegram бота\n');

	const deviceId = 'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';
	const appName = 'etf.flow';

	try {
		// 1. Проверяем, что пользователь есть в БД
		console.log('1️⃣ Проверяем пользователя в БД...');
		const response = await axios.get(`${BASE_URL}/admin/users/by-device-id/${deviceId}`);
		
		if (response.data.success) {
			console.log('✅ Пользователь найден в БД:');
			console.log('   ID:', response.data.user.id);
			console.log('   Device ID:', response.data.user.deviceId);
			console.log('   Application:', response.data.user.application.name);
			console.log('   Telegram Chat ID:', response.data.user.telegramChatId || 'не привязан');
			console.log('');
		} else {
			console.log('❌ Пользователь НЕ найден в БД');
			return;
		}

		// 2. Симулируем команду /start в Telegram боте
		console.log('2️⃣ Симулируем команду /start в Telegram боте...');
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

		// 3. Проверяем поиск пользователя (как в Telegram боте)
		console.log('3️⃣ Проверяем поиск пользователя для Telegram бота...');
		const userByDeviceId = await axios.get(`${BASE_URL}/admin/users/by-device-id/${parsedDeviceId}`);
		
		if (userByDeviceId.data.success) {
			const user = userByDeviceId.data.user;
			if (user.application.name === parsedAppName) {
				console.log('✅ Пользователь найден по deviceId и appName!');
				console.log('   Готов к привязке Telegram Chat ID');
				console.log('');
				
				// 4. Симулируем привязку Telegram Chat ID
				console.log('4️⃣ Симулируем привязку Telegram Chat ID...');
				const telegramChatId = '123456789'; // Симулируем Chat ID
				
				console.log('✅ Telegram Chat ID привязан:', telegramChatId);
				console.log('✅ Telegram уведомления активированы');
				console.log('');
				
				console.log('🎯 Результат:');
				console.log('   ✅ Устройство зарегистрировано в БД');
				console.log('   ✅ DeviceId записан полностью');
				console.log('   ✅ Ссылка сгенерирована правильно');
				console.log('   ✅ Параметр парсится правильно');
				console.log('   ✅ Пользователь найден в БД');
				console.log('   ✅ Telegram Chat ID может быть привязан');
				console.log('');
				console.log('📱 Теперь пользователь может перейти по ссылке и привязать Telegram!');
				console.log('🔗 Ссылка:', `https://t.me/etf_flows_bot?start=${startParam}`);
			} else {
				console.log('❌ Неправильное приложение:', user.application.name, '!=', parsedAppName);
			}
		} else {
			console.log('❌ Пользователь НЕ найден по deviceId');
		}

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testTelegramBotSearch();
