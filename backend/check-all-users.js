const axios = require('axios');

const BASE_URL = 'http://localhost:3066';

async function checkAllUsers() {
	console.log('🔍 Проверяем всех пользователей в БД\n');

	try {
		// Получаем всех пользователей приложения etf.flow
		const response = await axios.get(`${BASE_URL}/admin/applications/etf.flow`);

		if (response.data.success) {
			const users = response.data.application.users || [];
			console.log(`Найдено ${users.length} пользователей etf.flow:`);

			users.forEach((user, index) => {
				console.log(`   ${index + 1}. ID: ${user.id}`);
				console.log(`      Device ID: ${user.deviceId || 'null'}`);
				console.log(`      Device Token: ${user.deviceToken.substring(0, 20)}...`);
				console.log(`      Telegram Chat ID: ${user.telegramChatId || 'не привязан'}`);
				console.log(`      Created: ${user.createdAt}`);
				console.log(`      Settings: ${JSON.stringify(user.settings, null, 2)}`);
				console.log('');
			});
		} else {
			console.log('❌ Не удалось получить пользователей приложения');
		}

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

checkAllUsers();
