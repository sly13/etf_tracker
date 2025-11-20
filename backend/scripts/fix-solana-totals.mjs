#!/usr/bin/env node

// Скрипт для пересчета total в таблице sol_flow
// Исправляет записи, где total не равен сумме всех фондов

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSolanaTotals() {
	try {
		console.log('🔧 Пересчет total для всех записей sol_flow...');

		const allRecords = await prisma.solFlow.findMany({
			orderBy: { date: 'desc' },
		});

		console.log(`Найдено ${allRecords.length} записей`);

		let updated = 0;
		for (const record of allRecords) {
			// Считаем правильный total как сумму всех фондов
			const correctTotal =
				(record.bitwise || 0) +
				(record.vanEck || 0) +
				(record.fidelity || 0) +
				(record.twentyOneShares || 0) +
				(record.grayscale || 0);

			// Округляем до 2 знаков после запятой
			const roundedTotal = Math.round(correctTotal * 100) / 100;
			const currentTotal = record.total ? Math.round(record.total * 100) / 100 : 0;

			// Обновляем только если total не совпадает
			if (roundedTotal !== currentTotal) {
				await prisma.solFlow.update({
					where: { id: record.id },
					data: { total: roundedTotal },
				});
				updated++;
				console.log(
					`  ✅ ${record.date.toISOString().split('T')[0]}: ${currentTotal} → ${roundedTotal}`,
				);
			}
		}

		console.log(`\n✅ Обновлено ${updated} записей из ${allRecords.length}`);
	} catch (error) {
		console.error('❌ Ошибка:', error.message);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

fixSolanaTotals();

