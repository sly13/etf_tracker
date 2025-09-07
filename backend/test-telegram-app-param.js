const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Генерация уникального Device ID
function generateDeviceId() {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substr(2, 9);
	return `device_${timestamp}_${random}`;
}

async function testTelegramAppParameter() {
	console.log('🧪 Тестирование Telegram с параметром приложения\n');

	try {
		// 1. Генерируем Device ID
		const deviceId = generateDeviceId();
		const appName = 'etf.flow';
		console.log('1️⃣ Сгенерирован Device ID:', deviceId);
		console.log('📱 Приложение:', appName);
		console.log('');

		// 2. Регистрируем устройство
		console.log('2️⃣ Регистрация устройства...');
		const registerResponse = await axios.post(`${BASE_URL}/applications/register-device`, {
			token: 'test_fcm_token_app_param',
			appName: appName,
			userId: 'user_app_param_test',
			deviceId: deviceId,
			deviceInfo: {
				deviceType: 'android',
				appVersion: '1.0.0',
				firstName: 'Тест',
				lastName: 'Пользователь',
				email: 'test@example.com',
				phone: '+7900555777'
			}
		});

		console.log('✅ Регистрация успешна:', registerResponse.data);
		console.log('');

		// 3. Генерируем ссылку для Telegram с параметром приложения
		console.log('3️⃣ Генерация ссылки для Telegram с параметром приложения...');
		const telegramUrl = `https://t.me/your_bot_username?start=${appName}:${deviceId}`;
		console.log('🔗 Telegram ссылка:', telegramUrl);
		console.log('');

		// 4. Демонстрация различных форматов ссылок
		console.log('4️⃣ Различные форматы ссылок:');
		console.log('');
		console.log('📱 С параметром приложения:');
		console.log(`   https://t.me/your_bot_username?start=${appName}:${deviceId}`);
		console.log('   → Бот получит: /start etf.flow:device_1234567890_abc123def');
		console.log('');
		console.log('📱 Только с deviceId (старый формат):');
		console.log(`   https://t.me/your_bot_username?start=${deviceId}`);
		console.log('   → Бот получит: /start device_1234567890_abc123def');
		console.log('');
		console.log('📱 Без параметров:');
		console.log('   https://t.me/your_bot_username?start=');
		console.log('   → Бот получит: /start');
		console.log('');

		// 5. Симуляция обработки ботом
		console.log('5️⃣ Симуляция обработки ботом:');
		console.log('');
		console.log('🤖 Когда пользователь нажимает на ссылку с параметром приложения:');
		console.log(`   Telegram отправляет: /start ${appName}:${deviceId}`);
		console.log('   Бот парсит параметры:');
		console.log(`   - appName: ${appName}`);
		console.log(`   - deviceId: ${deviceId}`);
		console.log('   Бот ищет пользователя по deviceId и привязывает Telegram');
		console.log('');

		// 6. Проверка информации о пользователе
		console.log('6️⃣ Проверка информации о пользователе...');
		const userResponse = await axios.get(`${BASE_URL}/applications/user/test_fcm_token_app_param`);
		console.log('👤 Информация о пользователе:', JSON.stringify(userResponse.data, null, 2));
		console.log('');

		// 7. Ручная привязка для тестирования
		console.log('7️⃣ Ручная привязка для тестирования...');
		const linkResponse = await axios.post(`${BASE_URL}/applications/link-telegram-by-device-id`, {
			deviceId: deviceId,
			telegramChatId: '999888777'
		});

		console.log('🔗 Результат привязки:', linkResponse.data);
		console.log('');

		// 8. Проверка обновленного статуса
		console.log('8️⃣ Проверка обновленного статуса...');
		const updatedUserResponse = await axios.get(`${BASE_URL}/applications/user/test_fcm_token_app_param`);
		console.log('👤 Обновленная информация:', JSON.stringify(updatedUserResponse.data, null, 2));
		console.log('');

		// 9. Инструкции для интеграции в мобильное приложение
		console.log('9️⃣ Инструкции для интеграции в мобильное приложение:');
		console.log('');
		console.log('📱 В мобильном приложении при создании ссылки Telegram:');
		console.log('');
		console.log('```javascript');
		console.log('function createTelegramLink(deviceId, appName) {');
		console.log('  // Новый формат с параметром приложения');
		console.log('  return `https://t.me/your_bot_username?start=${appName}:${deviceId}`;');
		console.log('}');
		console.log('');
		console.log('// Пример использования:');
		console.log('const telegramUrl = createTelegramLink("device_123", "etf.flow");');
		console.log('// Результат: https://t.me/your_bot_username?start=etf.flow:device_123');
		console.log('```');
		console.log('');

		// 10. Преимущества нового подхода
		console.log('🔟 Преимущества нового подхода:');
		console.log('');
		console.log('✅ Мультиприложенность:');
		console.log('   - Один бот может обслуживать несколько приложений');
		console.log('   - Каждое приложение имеет свои настройки и уведомления');
		console.log('');
		console.log('✅ Лучшая идентификация:');
		console.log('   - Бот знает, из какого приложения пришел пользователь');
		console.log('   - Можно показывать правильное название приложения');
		console.log('');
		console.log('✅ Обратная совместимость:');
		console.log('   - Старые ссылки без параметра приложения продолжают работать');
		console.log('   - По умолчанию используется "etf.flow"');
		console.log('');

		console.log('✅ Тестирование завершено успешно!');

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

// Запуск теста
testTelegramAppParameter().then(() => {
	console.log('\n🎉 Тестирование параметра приложения завершено!');
	console.log('\n📋 Следующие шаги:');
	console.log('1. Обновите мобильное приложение для использования нового формата ссылок');
	console.log('2. Протестируйте реальную интеграцию с Telegram ботом');
	console.log('3. Убедитесь, что все приложения правильно регистрируются');
}).catch(error => {
	console.error('💥 Критическая ошибка:', error.message);
});
