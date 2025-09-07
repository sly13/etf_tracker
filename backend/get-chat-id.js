const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
	console.log('❌ Ошибка: TELEGRAM_BOT_TOKEN не найден в переменных окружения');
	console.log('📝 Добавьте токен в .env файл:');
	console.log('TELEGRAM_BOT_TOKEN=your_bot_token');
	process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Бот запущен для получения Chat ID...');
console.log('📱 Отправьте любое сообщение боту, и я покажу ваш Chat ID');
console.log('⏹️  Для остановки нажмите Ctrl+C\n');

bot.on('message', (msg) => {
	const chatId = msg.chat.id;
	const chatType = msg.chat.type;
	const userName = msg.from.first_name || msg.from.username || 'Unknown';

	console.log('📨 Получено сообщение:');
	console.log(`👤 От: ${userName}`);
	console.log(`💬 Текст: ${msg.text}`);
	console.log(`🆔 Chat ID: ${chatId}`);
	console.log(`📋 Тип чата: ${chatType}`);
	console.log('─'.repeat(50));

	// Отправляем ответ с Chat ID
	bot.sendMessage(chatId, `Ваш Chat ID: ${chatId}`);
});

bot.on('error', (error) => {
	console.error('❌ Ошибка бота:', error.message);
});

// Обработка остановки
process.on('SIGINT', () => {
	console.log('\n👋 Остановка бота...');
	bot.stopPolling();
	process.exit(0);
});
