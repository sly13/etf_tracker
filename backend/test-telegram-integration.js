const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Генерация уникального Device ID
function generateDeviceId() {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substr(2, 9);
	return `device_${timestamp}_${random}`;
}

async function testTelegramIntegration() {
	console.log('🧪 Тестирование интеграции Telegram настроек\n');

	try {
		// 1. Генерируем Device ID
		const deviceId = generateDeviceId();
		console.log('1️⃣ Сгенерирован Device ID:', deviceId);
		console.log('');

		// 2. Регистрируем устройство
		console.log('2️⃣ Регистрация устройства...');
		const registerResponse = await axios.post(`${BASE_URL}/applications/register-device`, {
			token: 'test_fcm_token_789',
			appName: 'etf.flow',
			userId: 'user_99999',
			deviceId: deviceId,
			deviceInfo: {
				deviceType: 'android',
				appVersion: '1.0.0',
				firstName: 'Алексей',
				lastName: 'Иванов',
				email: 'alexey@example.com',
				phone: '+7900555666'
			}
		});

		console.log('✅ Регистрация успешна:', registerResponse.data);
		console.log('');

		// 3. Проверяем информацию о пользователе
		console.log('3️⃣ Проверка информации о пользователе...');
		const userResponse = await axios.get(`${BASE_URL}/applications/user/test_fcm_token_789`);
		console.log('👤 Информация о пользователе:', JSON.stringify(userResponse.data, null, 2));
		console.log('');

		// 4. Генерируем ссылку для Telegram
		console.log('4️⃣ Генерация ссылки для Telegram...');
		const telegramUrl = `https://t.me/your_bot_username?start=${deviceId}`;
		console.log('🔗 Telegram ссылка:', telegramUrl);
		console.log('');

		// 5. Симуляция клика по кнопке "Connect Telegram"
		console.log('5️⃣ Симуляция клика по кнопке "Connect Telegram":');
		console.log('📱 Пользователь нажимает кнопку в приложении');
		console.log('🔗 Открывается ссылка:', telegramUrl);
		console.log('🤖 Telegram автоматически отправляет команду: /start', deviceId);
		console.log('');

		// 6. Ручная привязка для тестирования (имитация работы бота)
		console.log('6️⃣ Ручная привязка для тестирования...');
		const linkResponse = await axios.post(`${BASE_URL}/applications/link-telegram-by-device-id`, {
			deviceId: deviceId,
			telegramChatId: '111222333'
		});

		console.log('🔗 Результат привязки:', linkResponse.data);
		console.log('');

		// 7. Проверка обновленного статуса
		console.log('7️⃣ Проверка обновленного статуса...');
		const updatedUserResponse = await axios.get(`${BASE_URL}/applications/user/test_fcm_token_789`);
		console.log('👤 Обновленная информация:', JSON.stringify(updatedUserResponse.data, null, 2));
		console.log('');

		// 8. Тест отправки уведомления
		console.log('8️⃣ Тест отправки уведомления...');
		const testNotificationResponse = await axios.post(`${BASE_URL}/applications/user/test_fcm_token_789/test-notification`);
		console.log('📱 Результат тестового уведомления:', testNotificationResponse.data);
		console.log('');

		// 9. Демонстрация UI компонента
		console.log('9️⃣ Демонстрация UI компонента:');
		console.log('📱 В настройках приложения:');
		console.log('   ┌─────────────────────────────────────┐');
		console.log('   │ Subscription Status                 │');
		console.log('   │                                     │');
		console.log('   │ Telegram Notifications    [Connected]│');
		console.log('   │ Get real-time ETF flow updates      │');
		console.log('   │ directly in Telegram                 │');
		console.log('   │                                     │');
		console.log('   │ [Disconnect Telegram]               │');
		console.log('   │                                     │');
		console.log('   │ Device ID: ' + deviceId.substring(0, 20) + '... │');
		console.log('   └─────────────────────────────────────┘');
		console.log('');

		// 10. Инструкции для интеграции
		console.log('🔟 Инструкции для интеграции в мобильное приложение:');
		console.log('');
		console.log('1. Добавьте компонент TelegramSettings в раздел "Subscription Status"');
		console.log('2. При первом запуске генерируйте Device ID и регистрируйте устройство');
		console.log('3. Сохраняйте Device ID локально для последующих запусков');
		console.log('4. При нажатии "Connect Telegram" открывайте ссылку с Device ID');
		console.log('5. Проверяйте статус подключения через API');
		console.log('6. Показывайте соответствующий UI (Connected/Disconnect)');
		console.log('');

		console.log('✅ Интеграция готова к использованию!');

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

// Запуск теста
testTelegramIntegration().then(() => {
	console.log('\n🎉 Тестирование интеграции завершено!');
	console.log('\n📋 Следующие шаги:');
	console.log('1. Скопируйте код компонента в ваше мобильное приложение');
	console.log('2. Обновите URL бота в коде');
	console.log('3. Протестируйте реальную интеграцию');
	console.log('4. Добавьте компонент в раздел настроек');
}).catch(error => {
	console.error('💥 Критическая ошибка:', error.message);
});
