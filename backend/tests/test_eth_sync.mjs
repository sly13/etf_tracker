#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки работы sync_eth_klines_5m.mjs
 * Проверяет подключение к БД и статистику по ETH свечам
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEthDatabaseConnection() {
	try {
		console.log('🔍 Тестирование подключения к базе данных для ETH...');

		// Проверяем подключение
		await prisma.$connect();
		console.log('✅ Подключение к БД успешно');

		// Проверяем существование таблицы btc_candles
		const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'btc_candles'
      );
    `;

		console.log('📊 Таблица btc_candles:', tableExists[0].exists ? 'существует' : 'не найдена');

		if (tableExists[0].exists) {
			// Общая статистика
			const totalCount = await prisma.bTCandle.count();
			console.log(`📈 Общее количество записей в таблице: ${totalCount}`);

			// Статистика по BTC
			const btcCount = await prisma.bTCandle.count({
				where: { symbol: 'BTCUSDT' }
			});
			console.log(`₿ Количество BTC записей: ${btcCount}`);

			// Статистика по ETH
			const ethCount = await prisma.bTCandle.count({
				where: { symbol: 'ETHUSDT' }
			});
			console.log(`Ξ Количество ETH записей: ${ethCount}`);

			// Последние записи по каждому символу
			const symbols = ['BTCUSDT', 'ETHUSDT'];

			for (const symbol of symbols) {
				const lastRecord = await prisma.bTCandle.findFirst({
					where: { symbol },
					orderBy: { openTime: 'desc' },
					select: {
						symbol: true,
						interval: true,
						openTime: true,
						closeTime: true,
						open: true,
						high: true,
						low: true,
						close: true,
						volume: true,
						source: true,
					},
				});

				if (lastRecord) {
					console.log(`📅 Последняя запись ${symbol}:`, {
						время: lastRecord.openTime.toISOString(),
						цена: lastRecord.close,
						объем: lastRecord.volume,
						источник: lastRecord.source
					});
				} else {
					console.log(`📭 Нет записей для ${symbol}`);
				}
			}

			// Статистика по интервалам
			const intervals = await prisma.bTCandle.groupBy({
				by: ['symbol', 'interval'],
				_count: { symbol: true },
				orderBy: [
					{ symbol: 'asc' },
					{ interval: 'asc' }
				]
			});

			console.log('📊 Статистика по символам и интервалам:');
			intervals.forEach(item => {
				console.log(`   ${item.symbol} ${item.interval}: ${item._count.symbol} записей`);
			});
		}

		console.log('✅ Тест ETH завершен успешно');

	} catch (error) {
		console.error('❌ Ошибка тестирования ETH:', error.message);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

async function main() {
	try {
		await testEthDatabaseConnection();
		process.exit(0);
	} catch (error) {
		console.error('💥 Фатальная ошибка ETH:', error.message);
		process.exit(1);
	}
}

main();
