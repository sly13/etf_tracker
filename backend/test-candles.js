const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCandles() {
	try {
		console.log('Testing BTC candles...');

		const candles = await prisma.bTCandle.findMany({
			where: {
				symbol: 'BTCUSDT',
				interval: '5m',
			},
			orderBy: {
				openTime: 'desc',
			},
			take: 5,
		});

		console.log(`Found ${candles.length} candles:`);
		candles.forEach((candle, index) => {
			console.log(`${index + 1}. ${candle.openTime} - O:${candle.open} H:${candle.high} L:${candle.low} C:${candle.close}`);
		});

	} catch (error) {
		console.error('Error:', error);
	} finally {
		await prisma.$disconnect();
	}
}

testCandles();
