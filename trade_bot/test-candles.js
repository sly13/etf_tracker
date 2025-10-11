const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCandles() {
	try {
		console.log('Testing BTC candles...');

		// Проверяем все доступные интервалы
		const intervals = await prisma.btc_candles.groupBy({
			by: ['interval'],
			_count: {
				interval: true
			}
		});

		console.log('Available intervals:', intervals);

		// Проверяем все доступные символы
		const symbols = await prisma.btc_candles.groupBy({
			by: ['symbol'],
			_count: {
				symbol: true
			}
		});

		console.log('Available symbols:', symbols);

		// Получаем последние 5 свечей
		const candles = await prisma.btc_candles.findMany({
			orderBy: {
				open_time: 'desc',
			},
			take: 5,
		});

		console.log(`Found ${candles.length} recent candles:`);
		candles.forEach((candle, index) => {
			console.log(`${index + 1}. ${candle.symbol} ${candle.interval} ${candle.open_time} - O:${candle.open} H:${candle.high} L:${candle.low} C:${candle.close}`);
		});

	} catch (error) {
		console.error('Error:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testCandles();
