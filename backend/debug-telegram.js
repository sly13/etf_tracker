const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

console.log('🔍 Диагностика Telegram бота...\n');

// Проверяем переменные окружения
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log('📋 Переменные окружения:');
console.log(`TELEGRAM_BOT_TOKEN: ${token ? '✅ Найден' : '❌ Не найден'}`);
console.log(`TELEGRAM_CHAT_ID: ${chatId ? '✅ Найден' : '❌ Не найден'}`);

if (!token) {
	console.log('\n❌ Ошибка: TELEGRAM_BOT_TOKEN не найден в переменных окружения');
	console.log('📝 Убедитесь, что файл .env содержит:');
	console.log('TELEGRAM_BOT_TOKEN=your_bot_token');
	process.exit(1);
}

if (!chatId) {
	console.log('\n❌ Ошибка: TELEGRAM_CHAT_ID не найден в переменных окружения');
	console.log('📝 Убедитесь, что файл .env содержит:');
	console.log('TELEGRAM_CHAT_ID=your_chat_id');
	process.exit(1);
}

// Проверяем формат токена
if (!token.match(/^\d+:[A-Za-z0-9_-]+$/)) {
	console.log('\n❌ Ошибка: Неверный формат TELEGRAM_BOT_TOKEN');
	console.log('📝 Токен должен быть в формате: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
	process.exit(1);
}

// Проверяем формат Chat ID
if (!chatId.match(/^-?\d+$/)) {
	console.log('\n❌ Ошибка: Неверный формат TELEGRAM_CHAT_ID');
	console.log('📝 Chat ID должен быть числом, например: 123456789');
	process.exit(1);
}

console.log('\n✅ Формат переменных корректный');

// Создаем бота
const bot = new TelegramBot(token, { polling: false });

async function testBot() {
	try {
		console.log('\n🤖 Тестирование бота...');

		// Получаем информацию о боте
		const botInfo = await bot.getMe();
		console.log(`✅ Бот найден: @${botInfo.username} (${botInfo.first_name})`);

		// Проверяем, можем ли мы отправить сообщение
		console.log(`📱 Отправка тестового сообщения в чат: ${chatId}`);

		const message = `
🧪 <b>Тестовое уведомление</b>

ETF Tracker работает корректно!

<i>${new Date().toLocaleString('ru-RU')}</i>
    `.trim();

		await bot.sendMessage(chatId, message, {
			parse_mode: 'HTML',
			disable_web_page_preview: true,
		});

		console.log('✅ Тестовое сообщение успешно отправлено!');
		console.log('\n🎉 Все проверки пройдены успешно!');

	} catch (error) {
		console.error('\n❌ Ошибка при тестировании бота:', error.message);

		if (error.response) {
			console.error('📋 Детали ошибки:', error.response.body);

			if (error.response.body.error_code === 400) {
				console.log('\n💡 Возможные причины:');
				console.log('- Неверный Chat ID');
				console.log('- Бот заблокирован пользователем');
				console.log('- Бот не добавлен в чат');
			} else if (error.response.body.error_code === 401) {
				console.log('\n💡 Возможные причины:');
				console.log('- Неверный токен бота');
				console.log('- Токен был отозван');
			}
		}
	}
}

testBot();
