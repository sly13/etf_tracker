#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки работы sync_btc_klines_5m.mjs
 * Проверяет подключение к БД и базовую функциональность
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
	try {
		console.log('🔍 Тестирование подключения к базе данных...');

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
			// Проверяем количество записей
			const count = await prisma.bTCandle.count();
			console.log(`📈 Количество записей в таблице: ${count}`);

			if (count > 0) {
				// Показываем последнюю запись
				const lastRecord = await prisma.bTCandle.findFirst({
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
						source: true,
					},
				});

				console.log('📅 Последняя запись:', lastRecord);
			}
		}

		console.log('✅ Тест завершен успешно');

	} catch (error) {
		console.error('❌ Ошибка тестирования:', error.message);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

async function main() {
	try {
		await testDatabaseConnection();
		process.exit(0);
	} catch (error) {
		console.error('💥 Фатальная ошибка:', error.message);
		process.exit(1);
	}
}

main();
