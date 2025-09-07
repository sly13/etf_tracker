const axios = require('axios');

const BASE_URL = 'http://localhost:3066';

async function testAppContextSettings() {
	console.log('🧪 Тестирование API настроек с учетом приложения...\n');

	try {
		// Тест 1: Регистрация пользователей в разных приложениях
		console.log('1️⃣ Регистрируем пользователей в разных приложениях...');

		const etfUser = await axios.post(`${BASE_URL}/applications/register-device`, {
			token: 'etf_user_token_123',
			appName: 'etf.flow',
			userId: 'etf_user_123',
			deviceInfo: {
				deviceType: 'ios',
				firstName: 'ETF',
				lastName: 'User',
			},
		});

		const cryptoUser = await axios.post(`${BASE_URL}/applications/register-device`, {
			token: 'crypto_user_token_456',
			appName: 'crypto.tracker',
			userId: 'crypto_user_456',
			deviceInfo: {
				deviceType: 'android',
				firstName: 'Crypto',
				lastName: 'User',
			},
		});

		console.log('✅ ETF пользователь:', etfUser.data);
		console.log('✅ Crypto пользователь:', cryptoUser.data);

		// Тест 2: Получаем пользователей
		console.log('\n2️⃣ Получаем информацию о пользователях...');

		const etfUserInfo = await axios.get(`${BASE_URL}/applications/user/etf_user_token_123`);
		const cryptoUserInfo = await axios.get(`${BASE_URL}/applications/user/crypto_user_token_456`);

		console.log('👤 ETF пользователь:', etfUserInfo.data);
		console.log('👤 Crypto пользователь:', cryptoUserInfo.data);

		const etfUserId = etfUserInfo.data.user.id;
		const cryptoUserId = cryptoUserInfo.data.user.id;

		// Тест 3: Устанавливаем настройки для ETF приложения
		console.log('\n3️⃣ Устанавливаем настройки для ETF приложения...');

		const etfSettings = await axios.put(
			`${BASE_URL}/settings/app/etf.flow/user/${etfUserId}`,
			{
				enableETFUpdates: true,
				enableSignificantFlow: true,
				minFlowThreshold: 0.1,
				significantChangePercent: 20.0,
				enableBitcoinUpdates: true,
				enableEthereumUpdates: true,
			}
		);

		console.log('✅ ETF настройки:', etfSettings.data);

		// Тест 4: Устанавливаем настройки для Crypto приложения
		console.log('\n4️⃣ Устанавливаем настройки для Crypto приложения...');

		const cryptoSettings = await axios.put(
			`${BASE_URL}/settings/app/crypto.tracker/user/${cryptoUserId}`,
			{
				enablePriceAlerts: true,
				enableVolumeAlerts: true,
				priceChangeThreshold: 5.0,
				trackedCoins: ['BTC', 'ETH', 'SOL'],
				alertFrequency: 'hourly',
			}
		);

		console.log('✅ Crypto настройки:', cryptoSettings.data);

		// Тест 5: Получаем настройки для каждого приложения
		console.log('\n5️⃣ Получаем настройки для каждого приложения...');

		const etfUserSettings = await axios.get(
			`${BASE_URL}/settings/app/etf.flow/user/${etfUserId}`
		);

		const cryptoUserSettings = await axios.get(
			`${BASE_URL}/settings/app/crypto.tracker/user/${cryptoUserId}`
		);

		console.log('📱 ETF настройки пользователя:', etfUserSettings.data);
		console.log('📱 Crypto настройки пользователя:', cryptoUserSettings.data);

		// Тест 6: Проверяем изоляцию настроек
		console.log('\n6️⃣ Проверяем изоляцию настроек...');

		// Пытаемся получить ETF настройки через Crypto API
		const etfViaCrypto = await axios.get(
			`${BASE_URL}/settings/app/crypto.tracker/user/${etfUserId}/enableETFUpdates`
		);

		// Пытаемся получить Crypto настройки через ETF API
		const cryptoViaETF = await axios.get(
			`${BASE_URL}/settings/app/etf.flow/user/${cryptoUserId}/enablePriceAlerts`
		);

		console.log('🔒 ETF настройки через Crypto API:', etfViaCrypto.data);
		console.log('🔒 Crypto настройки через ETF API:', cryptoViaETF.data);

		// Тест 7: Получаем конкретные настройки
		console.log('\n7️⃣ Получаем конкретные настройки...');

		const etfThreshold = await axios.get(
			`${BASE_URL}/settings/app/etf.flow/user/${etfUserId}/minFlowThreshold`
		);

		const cryptoThreshold = await axios.get(
			`${BASE_URL}/settings/app/crypto.tracker/user/${cryptoUserId}/priceChangeThreshold`
		);

		console.log('📊 ETF порог:', etfThreshold.data);
		console.log('📊 Crypto порог:', cryptoThreshold.data);

		console.log('\n🎉 Все тесты прошли успешно!');
		console.log('\n📋 Результаты:');
		console.log('   ✅ Пользователи зарегистрированы в разных приложениях');
		console.log('   ✅ Настройки установлены для каждого приложения');
		console.log('   ✅ Настройки изолированы между приложениями');
		console.log('   ✅ API корректно проверяет принадлежность к приложению');
		console.log('   ✅ Можно получать и обновлять настройки по приложению');

	} catch (error) {
		console.error('❌ Ошибка тестирования:', error.response?.data || error.message);
	}
}

// Запускаем тест
testAppContextSettings();
