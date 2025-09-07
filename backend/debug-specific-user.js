const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSpecificUser() {
	console.log('🔍 Отладка конкретного пользователя\n');

	const deviceId = 'ios_B8CD09A5-8617-4F7E-BEAA-45DDA503DADD_1757187698765';
	const appName = 'etf.flow';

	try {
		// 1. Проверяем, есть ли пользователь с таким deviceId
		console.log('1️⃣ Поиск пользователя по deviceId:', deviceId);
		const userByDeviceId = await prisma.user.findFirst({
			where: {
				deviceId: deviceId,
				application: { name: appName },
			},
			include: { application: true },
		});

		if (userByDeviceId) {
			console.log('✅ Пользователь найден:');
			console.log('   ID:', userByDeviceId.id);
			console.log('   Device ID:', userByDeviceId.deviceId);
			console.log('   Application:', userByDeviceId.application.name);
			console.log('   Application Display Name:', userByDeviceId.application.displayName);
			console.log('   Telegram Chat ID:', userByDeviceId.telegramChatId);
			console.log('   Settings:', JSON.stringify(userByDeviceId.settings, null, 2));
		} else {
			console.log('❌ Пользователь НЕ найден');
		}

		console.log('\n2️⃣ Поиск всех пользователей с похожим deviceId...');
		const similarUsers = await prisma.user.findMany({
			where: {
				deviceId: {
					contains: 'B8CD09A5-8617-4F7E-BEAA-45DDA503DADD',
				},
			},
			include: { application: true },
		});

		console.log(`Найдено ${similarUsers.length} похожих пользователей:`);
		similarUsers.forEach((user, index) => {
			console.log(`   ${index + 1}. Device ID: ${user.deviceId}`);
			console.log(`      App: ${user.application.name} (${user.application.displayName})`);
			console.log(`      Telegram: ${user.telegramChatId || 'не привязан'}`);
		});

		console.log('\n3️⃣ Проверяем все приложения...');
		const applications = await prisma.application.findMany();
		console.log('Доступные приложения:');
		applications.forEach((app, index) => {
			console.log(`   ${index + 1}. ${app.name} - ${app.displayName}`);
		});

		console.log('\n4️⃣ Проверяем всех пользователей приложения etf.flow...');
		const etfFlowUsers = await prisma.user.findMany({
			where: {
				application: { name: 'etf.flow' },
			},
			include: { application: true },
			take: 10, // Ограничиваем вывод
		});

		console.log(`Найдено ${etfFlowUsers.length} пользователей etf.flow:`);
		etfFlowUsers.forEach((user, index) => {
			console.log(`   ${index + 1}. Device ID: ${user.deviceId}`);
			console.log(`      Telegram: ${user.telegramChatId || 'не привязан'}`);
			console.log(`      Created: ${user.createdAt}`);
		});

	} catch (error) {
		console.error('❌ Ошибка:', error);
	} finally {
		await prisma.$disconnect();
	}
}

debugSpecificUser();
