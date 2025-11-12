#!/usr/bin/env node

/**
 * Скрипт для исправления последовательности автоинкремента для таблицы btc_candles
 * Используется для решения проблемы "Unique constraint failed on the fields: (`id`)"
 * 
 * Запуск: node scripts/fix_btc_candles_sequence.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSequence() {
	try {
		console.log('🔧 Начинаю исправление последовательности автоинкремента для btc_candles...');

		// Получаем максимальный id из таблицы
		const result = await prisma.$queryRaw`
			SELECT COALESCE(MAX(id), 0) as max_id FROM btc_candles;
		`;

		const maxId = result[0]?.max_id || 0;
		console.log(`📊 Максимальный id в таблице: ${maxId}`);

		// Получаем текущее значение последовательности
		const currentSeq = await prisma.$queryRaw`
			SELECT last_value FROM btc_candles_id_seq;
		`;

		const currentSeqValue = currentSeq[0]?.last_value || 0;
		console.log(`📊 Текущее значение последовательности: ${currentSeqValue}`);

		if (currentSeqValue <= maxId) {
			// Устанавливаем последовательность на значение больше максимального id
			const newSeqValue = BigInt(maxId) + BigInt(1);
			console.log(`🔧 Устанавливаю последовательность на: ${newSeqValue}`);

			await prisma.$executeRaw`
				SELECT setval('btc_candles_id_seq', ${newSeqValue}, false);
			`;

			// Проверяем новое значение
			const newSeq = await prisma.$queryRaw`
				SELECT last_value FROM btc_candles_id_seq;
			`;

			console.log(`✅ Последовательность установлена на: ${newSeq[0]?.last_value}`);
			console.log('✅ Исправление последовательности завершено успешно!');
		} else {
			console.log('ℹ️ Последовательность уже корректна, исправление не требуется');
		}

	} catch (error) {
		console.error('❌ Ошибка при исправлении последовательности:', error.message);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Запуск скрипта
if (import.meta.url === `file://${process.argv[1]}`) {
	fixSequence()
		.then(() => {
			console.log('✅ Скрипт выполнен успешно');
			process.exit(0);
		})
		.catch((error) => {
			console.error('💥 Фатальная ошибка:', error.message);
			process.exit(1);
		});
}





