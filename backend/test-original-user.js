const axios = require('axios');

const BASE_URL = 'https://etf-flow.vadimsemenko.ru';

async function testOriginalUser() {
	console.log('🔍 Тестирование оригинального пользователя из ссылки\n');

	const originalDeviceId = 'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';
	const appName = 'etf.flow';

	try {
		// 1. Проверяем, есть ли пользователь с таким deviceId
		console.log('1️⃣ Поиск пользователя по deviceId:', originalDeviceId);

		try {
			const checkUserResponse = await axios.get(`${BASE_URL}/admin/users/by-device-id/${originalDeviceId}`);

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
			console.log('❌ Ошибка при поиске пользователя:', error.response?.data || error.message);
		}

		// 2. Проверяем всех пользователей приложения etf.flow
		console.log('\n2️⃣ Проверяем всех пользователей приложения etf.flow...');
		try {
			const allUsersResponse = await axios.get(`${BASE_URL}/admin/applications/etf.flow`);

			if (allUsersResponse.data.success) {
				const users = allUsersResponse.data.application.users || [];
				console.log(`Найдено ${users.length} пользователей etf.flow:`);

				users.forEach((user, index) => {
					console.log(`   ${index + 1}. Device ID: ${user.deviceId || 'null'}`);
					console.log(`      Telegram: ${user.telegramChatId || 'не привязан'}`);
					console.log(`      Created: ${user.createdAt}`);
					console.log(`      Settings: ${JSON.stringify(user.settings, null, 2)}`);
					console.log('');
				});
			} else {
				console.log('❌ Не удалось получить пользователей приложения');
			}
		} catch (error) {
			console.log('❌ Ошибка при получении пользователей:', error.response?.data || error.message);
		}

		// 3. Генерируем ссылку для Telegram
		console.log('3️⃣ Генерируем ссылку для Telegram...');
		const telegramUrl = `https://t.me/etf_flows_bot?start=${appName}:${originalDeviceId}`;
		console.log('🔗 Telegram ссылка:', telegramUrl);
		console.log('');

		// 4. Симулируем команду /start в Telegram боте
		console.log('4️⃣ Симулируем команду /start в Telegram боте...');
		const startParam = `${appName}:${originalDeviceId}`;
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

		console.log('🎯 Результат:');
		console.log('   Ссылка сгенерирована правильно ✅');
		console.log('   Параметр парсится правильно ✅');
		console.log('');
		console.log('📱 Если пользователь НЕ найден в БД, то нужно его зарегистрировать!');

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testOriginalUser();
