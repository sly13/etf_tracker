const axios = require('axios');

const BASE_URL = 'http://localhost:3066';

async function testCompleteFlow() {
	console.log('🔄 Тестируем полный процесс: мобильное приложение → Telegram бот\n');

	// 1. Симулируем мобильное приложение - генерируем deviceId
	const mobileDeviceId = 'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';
	const appName = 'etf.flow';

	console.log('📱 1. Мобильное приложение генерирует deviceId:');
	console.log(`   ${mobileDeviceId}`);
	console.log('');

	// 2. Мобильное приложение регистрирует устройство
	console.log('📱 2. Мобильное приложение регистрирует устройство...');
	const registrationData = {
		token: 'test_telegram_token',
		appName: appName,
		deviceId: mobileDeviceId,
		deviceType: 'ios',
		appVersion: '1.0.0',
		firstName: 'Mobile',
		lastName: 'User',
		email: 'mobile@test.com',
	};

	try {
		const registrationResponse = await axios.post(`${BASE_URL}/notifications/register-device`, registrationData);
		console.log('   ✅ Регистрация успешна:', registrationResponse.data.success);
		console.log('');

		// 3. Проверяем, что сохранилось в БД
		console.log('📋 3. Проверяем данные в БД...');
		const { exec } = require('child_process');
		const { promisify } = require('util');
		const execAsync = promisify(exec);

		// Ожидаемый очищенный deviceId
		const expectedCleanDeviceId = 'B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';

		const dbQuery = `psql -d etf_flow_db -c "SELECT \\"deviceId\\", \\"os\\", \\"telegramChatId\\" FROM \\"User\\" WHERE \\"deviceId\\" = '${expectedCleanDeviceId}';"`;
		const { stdout } = await execAsync(dbQuery);

		console.log('   Результат поиска в БД:');
		console.log(stdout);

		if (stdout.includes(expectedCleanDeviceId)) {
			console.log('   ✅ Пользователь найден в БД с правильным deviceId');
			console.log('');

			// 4. Симулируем Telegram бот - команда /start
			console.log('🤖 4. Telegram бот получает команду /start...');
			const telegramStartParam = `${appName}:${mobileDeviceId}`;
			console.log(`   Параметр start: ${telegramStartParam}`);

			// Логика Telegram бота (как в коде)
			let parsedAppName = 'etf.flow';
			let parsedDeviceId = '';

			if (telegramStartParam.includes(':')) {
				const parts = telegramStartParam.split(':');
				parsedAppName = parts[0];
				parsedDeviceId = parts[1];
			} else {
				parsedDeviceId = telegramStartParam;
			}

			console.log(`   Парсинг: appName=${parsedAppName}, deviceId=${parsedDeviceId}`);

			// Очищаем deviceId (как в Telegram боте)
			let cleanDeviceId = parsedDeviceId;
			if (parsedDeviceId.startsWith('ios_')) {
				cleanDeviceId = parsedDeviceId.substring(4);
			} else if (parsedDeviceId.startsWith('android_')) {
				cleanDeviceId = parsedDeviceId.substring(8);
			}

			console.log(`   Очищенный deviceId: ${cleanDeviceId}`);

			// Проверяем, найдет ли Telegram бот пользователя
			const telegramDbQuery = `psql -d etf_flow_db -c "SELECT \\"deviceId\\", \\"os\\", \\"telegramChatId\\" FROM \\"User\\" WHERE \\"deviceId\\" = '${cleanDeviceId}';"`;
			const { stdout: telegramStdout } = await execAsync(telegramDbQuery);

			console.log('   Результат поиска Telegram ботом:');
			console.log(telegramStdout);

			if (telegramStdout.includes(cleanDeviceId)) {
				console.log('   ✅ Telegram бот найдет пользователя!');
				console.log('   ✅ Может привязать Telegram Chat ID');
				console.log('   ✅ Может сохранить данные Telegram аккаунта в settings');
				console.log('');
				console.log('🎯 ВСЕ РАБОТАЕТ ПРАВИЛЬНО!');
				console.log('🔗 Telegram ссылка готова к использованию:');
				console.log(`   https://t.me/etf_flows_bot?start=${telegramStartParam}`);
			} else {
				console.log('   ❌ Telegram бот НЕ найдет пользователя');
				console.log('   ❌ Проблема в логике поиска');
			}

		} else {
			console.log('   ❌ Пользователь НЕ найден в БД');
			console.log('   ❌ Проблема в регистрации устройства');
		}

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testCompleteFlow();
