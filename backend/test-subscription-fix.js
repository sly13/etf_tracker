#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки исправления ошибки регистрации устройства
 * 
 * Этот скрипт симулирует:
 * 1. Регистрацию устройства через NotificationService
 * 2. Синхронизацию покупки через SubscriptionService
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:3000'; // Измените на ваш URL
const DEVICE_ID = 'ios_B0E7A43F-99A2-4208-A3C1-00FA74596AA1_1757260864303';

async function makeRequest(path, data) {
	return new Promise((resolve, reject) => {
		const postData = JSON.stringify(data);

		const options = {
			hostname: 'localhost',
			port: 3000,
			path: path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(postData)
			}
		};

		const req = http.request(options, (res) => {
			let responseData = '';

			res.on('data', (chunk) => {
				responseData += chunk;
			});

			res.on('end', () => {
				try {
					const parsed = JSON.parse(responseData);
					resolve({ status: res.statusCode, data: parsed });
				} catch (e) {
					resolve({ status: res.statusCode, data: responseData });
				}
			});
		});

		req.on('error', (e) => {
			reject(e);
		});

		req.write(postData);
		req.end();
	});
}

async function testDeviceRegistration() {
	console.log('🔧 === ТЕСТ РЕГИСТРАЦИИ УСТРОЙСТВА ===');

	const registrationData = {
		token: 'test_fcm_token_' + Date.now(),
		appName: 'etf.flow',
		deviceId: DEVICE_ID,
		deviceType: 'ios',
		appVersion: '1.0.0',
		osVersion: '17.0',
		language: 'ru',
		timezone: 'Europe/Moscow',
		deviceName: 'iPhone Test Device',
		firstName: 'Тест',
		lastName: 'Пользователь',
		email: 'test@example.com'
	};

	try {
		const result = await makeRequest('/notifications/register-device', registrationData);
		console.log('📱 Регистрация устройства:');
		console.log(`   Статус: ${result.status}`);
		console.log(`   Ответ: ${JSON.stringify(result.data, null, 2)}`);

		if (result.status >= 200 && result.status < 300) {
			console.log('✅ Устройство успешно зарегистрировано');
			return true;
		} else {
			console.log('❌ Ошибка регистрации устройства');
			return false;
		}
	} catch (error) {
		console.log('❌ Ошибка при регистрации устройства:', error.message);
		return false;
	}
}

async function testUserCheckOrCreate() {
	console.log('\n👤 === ТЕСТ ПРОВЕРКИ/СОЗДАНИЯ ПОЛЬЗОВАТЕЛЯ ===');

	const checkData = {
		deviceId: DEVICE_ID,
		userId: 'test_user_' + Date.now()
	};

	try {
		const result = await makeRequest('/subscription/check-or-create-user', checkData);
		console.log('👤 Проверка/создание пользователя:');
		console.log(`   Статус: ${result.status}`);
		console.log(`   Ответ: ${JSON.stringify(result.data, null, 2)}`);

		if (result.status >= 200 && result.status < 300 && result.data.success) {
			if (result.data.created) {
				console.log('✅ Пользователь создан успешно');
			} else {
				console.log('✅ Пользователь уже существует');
			}
			return true;
		} else {
			console.log('❌ Ошибка проверки/создания пользователя');
			return false;
		}
	} catch (error) {
		console.log('❌ Ошибка при проверке пользователя:', error.message);
		return false;
	}
}

async function testSubscriptionStatus() {
	console.log('\n📊 === ТЕСТ ПОЛУЧЕНИЯ СТАТУСА ПОДПИСКИ (С СИНХРОНИЗАЦИЕЙ REVENUECAT) ===');

	const statusData = {
		deviceId: DEVICE_ID
	};

	try {
		const result = await makeRequest('/subscription/status', statusData);
		console.log('📊 Получение статуса подписки:');
		console.log(`   Статус: ${result.status}`);
		console.log(`   Ответ: ${JSON.stringify(result.data, null, 2)}`);

		if (result.status >= 200 && result.status < 300 && result.data.success) {
			console.log('✅ Статус подписки получен успешно');

			// Проверяем, есть ли информация о синхронизации с RevenueCat
			if (result.data.subscription && result.data.subscription.lastSyncWithRevenueCat) {
				console.log('✅ Синхронизация с RevenueCat выполнена');
				console.log(`   Время синхронизации: ${result.data.subscription.lastSyncWithRevenueCat}`);
			} else {
				console.log('⚠️ Информация о синхронизации с RevenueCat отсутствует');
			}

			return true;
		} else {
			console.log('❌ Ошибка получения статуса подписки');
			return false;
		}
	} catch (error) {
		console.log('❌ Ошибка при получении статуса подписки:', error.message);
		return false;
	}
}

async function testSubscriptionSync() {
	console.log('\n💳 === ТЕСТ СИНХРОНИЗАЦИИ ПОКУПКИ ===');

	const subscriptionData = {
		userId: 'test_user_' + Date.now(),
		deviceId: DEVICE_ID,
		customerInfo: {
			originalAppUserId: 'test_user_' + Date.now()
		},
		productId: 'premium_monthly',
		transactionId: 'test_transaction_' + Date.now(),
		originalTransactionId: 'test_original_transaction_' + Date.now(),
		purchaseDate: new Date().toISOString(),
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 дней
		isActive: true,
		isPremium: true,
		autoRenew: true,
		environment: 'Production',
		platform: 'ios',
		price: 9.99,
		currency: 'USD'
	};

	try {
		const result = await makeRequest('/subscription/sync-purchase', subscriptionData);
		console.log('💳 Синхронизация покупки:');
		console.log(`   Статус: ${result.status}`);
		console.log(`   Ответ: ${JSON.stringify(result.data, null, 2)}`);

		if (result.status >= 200 && result.status < 300 && result.data.success) {
			console.log('✅ Покупка успешно синхронизирована');
			return true;
		} else {
			console.log('❌ Ошибка синхронизации покупки');
			return false;
		}
	} catch (error) {
		console.log('❌ Ошибка при синхронизации покупки:', error.message);
		return false;
	}
}

async function runTests() {
	console.log('🚀 Запуск тестов исправления ошибки регистрации устройства\n');

	// Тест 1: Регистрация устройства
	const registrationSuccess = await testDeviceRegistration();

	// Тест 2: Проверка/создание пользователя
	const userCheckSuccess = await testUserCheckOrCreate();

	// Тест 3: Получение статуса подписки
	const statusSuccess = await testSubscriptionStatus();

	// Тест 4: Синхронизация покупки
	const subscriptionSuccess = await testSubscriptionSync();

	// Результаты
	console.log('\n📊 === РЕЗУЛЬТАТЫ ТЕСТОВ ===');
	console.log(`Регистрация устройства: ${registrationSuccess ? '✅ УСПЕХ' : '❌ ОШИБКА'}`);
	console.log(`Проверка/создание пользователя: ${userCheckSuccess ? '✅ УСПЕХ' : '❌ ОШИБКА'}`);
	console.log(`Получение статуса подписки: ${statusSuccess ? '✅ УСПЕХ' : '❌ ОШИБКА'}`);
	console.log(`Синхронизация покупки: ${subscriptionSuccess ? '✅ УСПЕХ' : '❌ ОШИБКА'}`);

	if (registrationSuccess && userCheckSuccess && statusSuccess && subscriptionSuccess) {
		console.log('\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!');
		console.log('✅ Ошибка "Пользователь не найден" исправлена');
	} else {
		console.log('\n⚠️ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ');
		console.log('🔧 Проверьте логи сервера для детальной информации');
	}
}

// Запускаем тесты
runTests().catch(console.error);
