const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testCorrectedFlow() {
	console.log('🧪 Тестирование исправленного flow для Telegram привязки\n');

	try {
		// 1. Регистрация пользователя с deviceId
		console.log('1️⃣ Регистрация пользователя с deviceId...');
		const registerResponse = await axios.post(`${BASE_URL}/applications/register-device`, {
			token: 'test_fcm_token_456',
			appName: 'etf.flow',
			userId: 'user_67890',
			deviceId: 'device_xyz789', // Уникальный ID устройства для привязки
			deviceInfo: {
				deviceType: 'android',
				appVersion: '1.0.0',
				firstName: 'Анна',
				lastName: 'Смирнова',
				email: 'anna@example.com',
				phone: '+7900987654'
			}
		});

		console.log('✅ Регистрация успешна:', registerResponse.data);
		console.log('');

		// 2. Проверка информации о пользователе
		console.log('2️⃣ Получение информации о пользователе...');
		const userResponse = await axios.get(`${BASE_URL}/applications/user/test_fcm_token_456`);
		console.log('👤 Информация о пользователе:', JSON.stringify(userResponse.data, null, 2));
		console.log('');

		// 3. Симуляция автоматической привязки через Telegram бота
		console.log('3️⃣ Симуляция автоматической привязки через Telegram бота...');
		console.log('📱 Пользователь нажимает кнопку "Привязать Telegram"');
		console.log('🔗 Открывается ссылка: https://t.me/your_bot_username?start=device_xyz789');
		console.log('🤖 Telegram автоматически отправляет команду: /start device_xyz789');
		console.log('');

		// 4. Ручная привязка для тестирования (имитация работы бота)
		console.log('4️⃣ Ручная привязка для тестирования...');
		const linkResponse = await axios.post(`${BASE_URL}/applications/link-telegram-by-device-id`, {
			deviceId: 'device_xyz789',
			telegramChatId: '987654321'
		});

		console.log('🔗 Результат привязки:', linkResponse.data);
		console.log('');

		// 5. Проверка обновленной информации о пользователе
		console.log('5️⃣ Проверка обновленной информации...');
		const updatedUserResponse = await axios.get(`${BASE_URL}/applications/user/test_fcm_token_456`);
		console.log('👤 Обновленная информация:', JSON.stringify(updatedUserResponse.data, null, 2));
		console.log('');

		// 6. Тест отправки уведомления
		console.log('6️⃣ Тест отправки уведомления...');
		const testNotificationResponse = await axios.post(`${BASE_URL}/applications/user/test_fcm_token_456/test-notification`);
		console.log('📱 Результат тестового уведомления:', testNotificationResponse.data);
		console.log('');

		// 7. Статистика приложения
		console.log('7️⃣ Статистика приложения...');
		const statsResponse = await axios.get(`${BASE_URL}/applications/etf.flow/stats`);
		console.log('📊 Статистика:', JSON.stringify(statsResponse.data, null, 2));
		console.log('');

		// 8. Демонстрация правильного flow
		console.log('8️⃣ Демонстрация правильного flow:');
		console.log('📱 Мобильное приложение:');
		console.log('   1. Пользователь регистрируется с deviceId: device_xyz789');
		console.log('   2. Нажимает "Привязать Telegram"');
		console.log('   3. Открывается: https://t.me/your_bot_username?start=device_xyz789');
		console.log('');
		console.log('🤖 Telegram бот:');
		console.log('   1. Получает команду: /start device_xyz789');
		console.log('   2. Ищет пользователя по deviceId: device_xyz789');
		console.log('   3. Автоматически привязывает Chat ID: 987654321');
		console.log('   4. Активирует уведомления');
		console.log('   5. Отправляет приветственное сообщение');
		console.log('');
		console.log('✅ Результат: Пользователь получает уведомления в Telegram!');

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

// Запуск теста
testCorrectedFlow().then(() => {
	console.log('\n🎉 Тестирование исправленного flow завершено!');
	console.log('\n📋 Следующие шаги:');
	console.log('1. Настройте Telegram бота с токеном');
	console.log('2. Обновите ссылку на бота в мобильном приложении');
	console.log('3. Протестируйте реальную привязку через Telegram');
}).catch(error => {
	console.error('💥 Критическая ошибка:', error.message);
});
