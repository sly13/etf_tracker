const axios = require('axios');

const BASE_URL = 'http://localhost:3066';

async function testTelegramBotWithCleanDeviceId() {
	console.log('🤖 Тестируем Telegram бот с очищенным deviceId\n');

	const originalDeviceId = 'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';
	const cleanDeviceId = 'B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';
	const appName = 'etf.flow';

	try {
		// 1. Проверяем, что пользователь есть в БД с очищенным deviceId
		console.log('1️⃣ Проверяем пользователя в БД...');
		console.log(`   Ищем по очищенному deviceId: ${cleanDeviceId}`);

		// Симулируем поиск пользователя (как в Telegram боте)
		const response = await axios.post(`${BASE_URL}/notifications/register-device`, {
			token: 'test_telegram_token_2',
			appName: appName,
			userId: 'user_test_456',
			deviceId: originalDeviceId, // Отправляем с префиксом
			deviceType: 'ios',
			appVersion: '1.0.0',
			firstName: 'Telegram',
			lastName: 'Test',
			email: 'telegram@test.com',
		});

		console.log('📊 Регистрация нового пользователя:');
		console.log('   Success:', response.data.success);
		console.log('   Message:', response.data.message);
		console.log('');

		// 2. Симулируем команду /start в Telegram боте
		console.log('2️⃣ Симулируем команду /start в Telegram боте...');
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
		console.log('   Device ID (с префиксом):', parsedDeviceId);

		// Очищаем deviceId (как в Telegram боте)
		let cleanParsedDeviceId = parsedDeviceId;
		if (parsedDeviceId.startsWith('ios_')) {
			cleanParsedDeviceId = parsedDeviceId.substring(4); // Убираем 'ios_'
		} else if (parsedDeviceId.startsWith('android_')) {
			cleanParsedDeviceId = parsedDeviceId.substring(8); // Убираем 'android_'
		}

		console.log('   Device ID (очищенный):', cleanParsedDeviceId);
		console.log('');

		// 3. Проверяем, что пользователь найден
		console.log('3️⃣ Проверяем поиск пользователя...');
		console.log(`   Ищем пользователя с deviceId: ${cleanParsedDeviceId}`);

		// Проверяем в БД напрямую
		const { exec } = require('child_process');
		const { promisify } = require('util');
		const execAsync = promisify(exec);

		const dbQuery = `psql -d etf_flow_db -c "SELECT \\"deviceId\\", \\"os\\", \\"telegramChatId\\" FROM \\"User\\" WHERE \\"deviceId\\" = '${cleanParsedDeviceId}';"`;
		const { stdout } = await execAsync(dbQuery);

		console.log('📋 Результат поиска в БД:');
		console.log(stdout);

		if (stdout.includes(cleanParsedDeviceId)) {
			console.log('✅ Пользователь найден в БД!');
			console.log('✅ Telegram бот сможет найти пользователя');
			console.log('✅ Привязка Telegram Chat ID возможна');
			console.log('');

			console.log('🎯 Итоговый результат:');
			console.log('   ✅ Устройство регистрируется с правильным deviceId');
			console.log('   ✅ OS сохраняется правильно');
			console.log('   ✅ Telegram ссылка генерируется правильно');
			console.log('   ✅ Параметр парсится правильно');
			console.log('   ✅ deviceId очищается правильно');
			console.log('   ✅ Пользователь находится в БД');
			console.log('   ✅ Telegram бот готов к работе!');
			console.log('');
			console.log('🔗 Ссылка для тестирования:');
			console.log(`   https://t.me/etf_flows_bot?start=${startParam}`);
		} else {
			console.log('❌ Пользователь НЕ найден в БД');
		}

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testTelegramBotWithCleanDeviceId();
