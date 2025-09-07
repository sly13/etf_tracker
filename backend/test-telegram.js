const TelegramBot = require('node-telegram-bot-api');

// Загружаем переменные окружения
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
	console.log('❌ Ошибка: Не найдены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID в переменных окружения');
	console.log('📝 Убедитесь, что файл .env содержит:');
	console.log('TELEGRAM_BOT_TOKEN=your_bot_token');
	console.log('TELEGRAM_CHAT_ID=your_chat_id');
	process.exit(1);
}

const bot = new TelegramBot(token, { polling: false });

async function testTelegramBot() {
	try {
		console.log('🤖 Тестирование Telegram бота...');
		console.log(`📱 Отправка сообщения в чат: ${chatId}`);

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
	} catch (error) {
		console.error('❌ Ошибка отправки сообщения:', error.message);

		if (error.response) {
			console.error('📋 Детали ошибки:', error.response.body);
		}
	}
}

testTelegramBot();
