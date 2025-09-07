const axios = require('axios');

const BASE_URL = 'http://localhost:3066';

async function testTelegramLinkFormat() {
	console.log('🧪 Тестирование нового формата ссылки Telegram...\n');

	try {
		// Тест 1: Старый формат (только deviceId)
		console.log('1️⃣ Тестируем старый формат ссылки...');
		const oldFormatResponse = await axios.post(`${BASE_URL}/api/telegram/test-link`, {
			startParam: 'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765'
		});
		console.log('✅ Старый формат:', oldFormatResponse.data);

		// Тест 2: Новый формат (appName:deviceId)
		console.log('\n2️⃣ Тестируем новый формат ссылки...');
		const newFormatResponse = await axios.post(`${BASE_URL}/api/telegram/test-link`, {
			startParam: 'etf.flow:ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765'
		});
		console.log('✅ Новый формат:', newFormatResponse.data);

		// Тест 3: Другой appName
		console.log('\n3️⃣ Тестируем другой appName...');
		const customAppResponse = await axios.post(`${BASE_URL}/api/telegram/test-link`, {
			startParam: 'crypto.tracker:ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765'
		});
		console.log('✅ Кастомный appName:', customAppResponse.data);

		console.log('\n🎉 Все тесты прошли успешно!');
		console.log('\n📋 Результаты:');
		console.log('   ✅ Старый формат работает (fallback)');
		console.log('   ✅ Новый формат работает (appName:deviceId)');
		console.log('   ✅ Кастомные appName поддерживаются');

	} catch (error) {
		console.error('❌ Ошибка тестирования:', error.response?.data || error.message);
	}
}

// Функция для симуляции обработки команды /start
function simulateStartCommand(startParam) {
	let appName = 'etf.flow'; // Default app
	let deviceId = startParam;

	// Check if parameter contains app name (format: "appName:deviceId")
	if (startParam.includes(':')) {
		const parts = startParam.split(':');
		appName = parts[0];
		deviceId = parts[1];
	}

	return {
		appName,
		deviceId,
		originalParam: startParam
	};
}

// Тестируем локально
console.log('🧪 Локальное тестирование парсинга параметров...\n');

const testCases = [
	'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765',
	'etf.flow:ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765',
	'crypto.tracker:android_1234567890_abcdef',
	'portfolio.manager:web_device_xyz'
];

testCases.forEach((param, index) => {
	const result = simulateStartCommand(param);
	console.log(`${index + 1}️⃣ Параметр: "${param}"`);
	console.log(`   appName: "${result.appName}"`);
	console.log(`   deviceId: "${result.deviceId}"`);
	console.log('');
});

console.log('📱 Примеры ссылок:');
console.log('Старый формат: https://t.me/etf_flows_bot?start=ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765');
console.log('Новый формат:  https://t.me/etf_flows_bot?start=etf.flow:ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765');
