const axios = require('axios');

const TELEGRAM_BOT_TOKEN = '8175637503:AAFxcL228TDvio-ftIgdMhEF2ZoG0ji7v9k';
const BOT_USERNAME = 'etf_flows_bot';

async function testTelegramBotDirectly() {
	console.log('🤖 Тестируем Telegram бота напрямую...\n');

	try {
		// 1. Проверяем информацию о боте
		console.log('1️⃣ Проверяем информацию о боте...');
		const botInfo = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
		console.log('   ✅ Бот найден:', botInfo.data.result.first_name);
		console.log('   📱 Username:', botInfo.data.result.username);
		console.log('');

		// 2. Проверяем webhook (должен быть пустым для polling)
		console.log('2️⃣ Проверяем webhook...');
		const webhookInfo = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
		console.log('   Webhook URL:', webhookInfo.data.result.url || 'Не установлен (используется polling)');
		console.log('   Pending updates:', webhookInfo.data.result.pending_update_count);
		console.log('');

		// 3. Получаем последние обновления
		console.log('3️⃣ Получаем последние обновления...');
		const updates = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=5`);

		if (updates.data.result.length > 0) {
			console.log(`   📨 Найдено ${updates.data.result.length} обновлений:`);
			updates.data.result.forEach((update, index) => {
				console.log(`   ${index + 1}. От ${update.message?.from?.first_name} (${update.message?.chat?.id}): ${update.message?.text || '[не текстовое]'}`);
			});
		} else {
			console.log('   📭 Нет новых обновлений');
		}
		console.log('');

		// 4. Отправляем тестовое сообщение боту
		console.log('4️⃣ Инструкции для тестирования:');
		console.log(`   📱 Найдите бота @${BOT_USERNAME} в Telegram`);
		console.log('   💬 Отправьте команду /start');
		console.log('   🔍 Проверьте логи сервера на наличие сообщений');
		console.log('');

		console.log('🎯 Если бот не отвечает, возможные причины:');
		console.log('   1. Сервер не запущен');
		console.log('   2. TelegramBotService не инициализирован');
		console.log('   3. Ошибка в обработчиках команд');
		console.log('   4. Проблемы с polling');

	} catch (error) {
		console.error('❌ Ошибка:', error.response?.data || error.message);
	}
}

testTelegramBotDirectly();