#!/usr/bin/env node

/**
 * Скрипт для удаления seed данных из базы данных
 * Seed данные - это начальные капиталы фондов, которые не являются реальными дневными потоками
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedDates = {
	ethereum: '2024-07-22',
	solana: '2025-10-27',
};

async function removeSeedData() {
	try {
		console.log('🗑️  Удаление seed данных из базы...');

		// Удаляем seed данные Ethereum
		const ethResult = await prisma.eTFFlow.deleteMany({
			where: {
				date: new Date(seedDates.ethereum),
			},
		});
		console.log(
			`✅ Ethereum: удалено ${ethResult.count} записей с датой ${seedDates.ethereum}`,
		);

		// Удаляем seed данные Solana
		const solResult = await prisma.solFlow.deleteMany({
			where: {
				date: new Date(seedDates.solana),
			},
		});
		console.log(
			`✅ Solana: удалено ${solResult.count} записей с датой ${seedDates.solana}`,
		);

		console.log('✅ Seed данные успешно удалены из базы');
		console.log(
			'💡 Теперь можно убрать фильтрацию по датам из кода, так как seed данные больше не сохраняются',
		);
	} catch (error) {
		console.error('❌ Ошибка при удалении seed данных:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

removeSeedData();




