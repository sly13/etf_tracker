const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { UniversalETFFlowService } = require('./dist/etf/universal-etf-flow.service');
const { NotificationService } = require('./dist/notifications/notification.service');

async function testNotificationFlow() {
	console.log('🚀 Тестирование потока уведомлений...\n');

	try {
		const app = await NestFactory.create(AppModule);

		const etfFlowService = app.get(UniversalETFFlowService);
		const notificationService = app.get(NotificationService);

		console.log('✅ Сервисы инициализированы');

		// Тестируем парсинг данных
		console.log('\n📊 Тестирование парсинга данных...');
		const results = await etfFlowService.parseAllETFFlowData();

		console.log('📋 Результаты парсинга:');
		console.log(`Ethereum: ${results.ethereum.success ? '✅' : '❌'} ${results.ethereum.count} записей, новых: ${results.ethereum.newDataCount || 0}`);
		console.log(`Bitcoin: ${results.bitcoin.success ? '✅' : '❌'} ${results.bitcoin.count} записей, новых: ${results.bitcoin.newDataCount || 0}`);

		// Если есть новые данные, тестируем уведомления
		if (results.ethereum.hasNewData || results.bitcoin.hasNewData) {
			console.log('\n📱 Тестирование уведомлений...');

			const notificationData = {
				bitcoinFlow: results.bitcoin.newData?.total || 0,
				ethereumFlow: results.ethereum.newData?.total || 0,
				bitcoinTotal: results.bitcoin.newData?.total || 0,
				ethereumTotal: results.ethereum.newData?.total || 0,
				date: new Date().toISOString().split('T')[0],
				bitcoinData: results.bitcoin.newData,
				ethereumData: results.ethereum.newData,
			};

			const success = await notificationService.sendETFUpdateNotification(notificationData);
			console.log(`Уведомление отправлено: ${success ? '✅' : '❌'}`);
		} else {
			console.log('\n📭 Новых данных не обнаружено, уведомления не отправляются');
		}

		await app.close();

	} catch (error) {
		console.error('❌ Ошибка:', error.message);
		console.error(error.stack);
	}
}

testNotificationFlow();
