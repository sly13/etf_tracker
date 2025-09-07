const axios = require('axios');

const BASE_URL = 'http://localhost:3066';

async function testTelegramBotStatus() {
	console.log('🤖 Проверяем статус Telegram бота\n');

	try {
		// 1. Проверяем, что сервер работает
		console.log('1️⃣ Проверяем сервер...');
		const serverResponse = await axios.get(`${BASE_URL}/`);
		console.log('   ✅ Сервер работает:', serverResponse.data);
		console.log('');

		// 2. Проверяем Telegram API напрямую
		console.log('2️⃣ Проверяем Telegram API...');
		const telegramResponse = await axios.get('https://api.telegram.org/bot8175637503:AAFxcL228TDvio-ftIgdMhEF2ZoG0ji7v9k/getMe');
		console.log('   ✅ Telegram API работает:');
		console.log('   Bot ID:', telegramResponse.data.result.id);
		console.log('   Bot Username:', telegramResponse.data.result.username);
		console.log('   Bot Name:', telegramResponse.data.result.first_name);
		console.log('');

		// 3. Проверяем, есть ли пользователи в БД
		console.log('3️⃣ Проверяем пользователей в БД...');
		const { exec } = require('child_process');
		const { promisify } = require('util');
		const execAsync = promisify(exec);

		const dbQuery = `psql -d etf_flow_db -c "SELECT COUNT(*) as user_count FROM \\"User\\";"`;
		const { stdout } = await execAsync(dbQuery);

		console.log('   Результат:');
		console.log(stdout);
		console.log('');

		// 4. Проверяем, есть ли пользователи с deviceId
		console.log('4️⃣ Проверяем пользователей с deviceId...');
		const deviceIdQuery = `psql -d etf_flow_db -c "SELECT \\"deviceId\\", \\"os\\" FROM \\"User\\" WHERE \\"deviceId\\" IS NOT NULL;"`;
		const { stdout: deviceIdStdout } = await execAsync(deviceIdQuery);

		console.log('   Пользователи с deviceId:');
		console.log(deviceIdStdout);
		console.log('');

		console.log('🎯 Диагностика завершена');
		console.log('');
		console.log('📋 Возможные причины, почему Telegram бот не отвечает:');
		console.log('   1. Telegram бот не инициализирован в приложении');
		console.log('   2. Ошибка в коде Telegram бота');
		console.log('   3. Проблемы с подключением к Telegram API');
		console.log('   4. Telegram бот не зарегистрирован в модуле');
		console.log('');
		console.log('🔧 Рекомендации:');
		console.log('   1. Проверьте логи сервера при запуске');
		console.log('   2. Убедитесь, что TelegramBotService зарегистрирован в модуле');
		console.log('   3. Проверьте, что TELEGRAM_BOT_TOKEN правильный');
		console.log('   4. Попробуйте отправить команду /start напрямую боту');

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testTelegramBotStatus();
