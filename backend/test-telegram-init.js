const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function testTelegramInit() {
	console.log('🤖 Тестируем инициализацию Telegram бота...\n');

	try {
		// Создаем приложение
		const app = await NestFactory.create(AppModule);

		// Получаем TelegramBotService
		const telegramBotService = app.get('TelegramBotService');

		console.log('✅ TelegramBotService получен из DI контейнера');
		console.log('🔍 Проверяем инициализацию бота...');

		const isInitialized = telegramBotService.isBotInitialized();
		console.log(`📊 Бот инициализирован: ${isInitialized ? '✅ Да' : '❌ Нет'}`);

		if (isInitialized) {
			console.log('🎯 Telegram бот готов к работе!');
		} else {
			console.log('⚠️ Telegram бот не инициализирован');
			console.log('🔧 Возможные причины:');
			console.log('   1. TELEGRAM_BOT_TOKEN не установлен');
			console.log('   2. Ошибка при создании бота');
			console.log('   3. Проблемы с подключением к Telegram API');
		}

		await app.close();

	} catch (error) {
		console.error('❌ Ошибка при тестировании:', error.message);
		console.error('Stack trace:', error.stack);
	}
}

testTelegramInit();
