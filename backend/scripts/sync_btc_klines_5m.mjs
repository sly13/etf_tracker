#!/usr/bin/env node

/**
 * Скрипт синхронизации 5-минутных свечей BTCUSDT из Binance Spot API в PostgreSQL
 * Использует Prisma Client для работы с базой данных
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';

// Конфигурация из переменных окружения
const config = {
	// Binance API
	binanceBaseUrl: 'https://api.binance.com/api/v3',

	// Параметры синхронизации
	symbol: process.env.SYMBOL || 'BTCUSDT',
	interval: process.env.INTERVAL || '5m',
	source: process.env.SOURCE || 'binance_spot',
	startFrom: process.env.START_FROM || '2017-09-01T00:00:00Z',
	
	// Ограничение диапазона синхронизации (только для периодической синхронизации)
	// Если установлено, синхронизирует только последние N часов от текущего момента
	// Если не установлено или 0, синхронизирует все данные от последней даты в БД
	maxHoursBack: process.env.MAX_HOURS_BACK ? parseInt(process.env.MAX_HOURS_BACK) : 0,

	// Настройки запросов
	batchSize: 1000,
	delayBetweenBatches: 200, // мс
	maxRetries: 5,
	retryDelay: 1000, // мс
};

// Инициализация Prisma Client
const prisma = new PrismaClient();

/**
 * Задержка между запросами
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Получение данных с Binance API с повторными попытками
 */
async function fetchKlines(startTime, endTime, retryCount = 0) {
	try {
		const url = `${config.binanceBaseUrl}/klines`;
		const params = {
			symbol: config.symbol,
			interval: config.interval,
			limit: config.batchSize,
			startTime: startTime.getTime(),
			endTime: endTime.getTime(),
		};

		console.log(`📡 Запрос данных: ${startTime.toISOString()} - ${endTime.toISOString()}`);

		const response = await axios.get(url, { params });

		if (response.status !== 200) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		return response.data;
	} catch (error) {
		if (retryCount < config.maxRetries) {
			const delayMs = config.retryDelay * Math.pow(2, retryCount);
			console.log(`⚠️ Ошибка запроса (попытка ${retryCount + 1}/${config.maxRetries}): ${error.message}`);
			console.log(`⏳ Повтор через ${delayMs}мс...`);

			await delay(delayMs);
			return fetchKlines(startTime, endTime, retryCount + 1);
		}

		throw new Error(`Не удалось получить данные после ${config.maxRetries} попыток: ${error.message}`);
	}
}

/**
 * Преобразование данных свечей из Binance в формат для БД
 */
function transformKlineData(kline) {
	return {
		symbol: config.symbol,
		interval: config.interval,
		openTime: new Date(parseInt(kline[0])),
		closeTime: new Date(parseInt(kline[6])),
		open: parseFloat(kline[1]),
		high: parseFloat(kline[2]),
		low: parseFloat(kline[3]),
		close: parseFloat(kline[4]),
		volume: parseFloat(kline[5]),
		quoteVolume: parseFloat(kline[7]),
		trades: parseInt(kline[8]),
		takerBuyBase: parseFloat(kline[9]),
		takerBuyQuote: parseFloat(kline[10]),
		source: config.source,
	};
}

/**
 * Получение последней даты из БД
 */
async function getLastOpenTime() {
	try {
		console.log(`🔍 Поиск последней даты для: symbol=${config.symbol}, interval=${config.interval}, source=${config.source}`);
		
		const lastCandle = await prisma.bTCandle.findFirst({
			where: {
				symbol: config.symbol,
				interval: config.interval,
				source: config.source,
			},
			orderBy: {
				openTime: 'desc',
			},
			select: {
				openTime: true,
			},
		});

		if (lastCandle) {
			console.log(`✅ Найдена последняя дата в БД: ${lastCandle.openTime.toISOString()}`);
		} else {
			console.log(`⚠️ Последняя дата не найдена в БД для указанных параметров`);
			// Проверяем, есть ли вообще записи в БД
			const anyCandle = await prisma.bTCandle.findFirst({
				orderBy: {
					openTime: 'desc',
				},
				select: {
					openTime: true,
					symbol: true,
					interval: true,
					source: true,
				},
			});
			if (anyCandle) {
				console.log(`ℹ️ В БД есть записи, но с другими параметрами: symbol=${anyCandle.symbol}, interval=${anyCandle.interval}, source=${anyCandle.source}, openTime=${anyCandle.openTime.toISOString()}`);
			} else {
				console.log(`ℹ️ В БД нет записей вообще`);
			}
		}

		return lastCandle ? lastCandle.openTime : null;
	} catch (error) {
		console.error('❌ Ошибка получения последней даты:', error.message);
		throw error;
	}
}

/**
 * Массовая вставка/обновление данных
 */
async function upsertCandles(candles) {
	if (candles.length === 0) return 0;

	try {
		let upsertedCount = 0;

		// Используем upsert для каждой свечи
		for (const candle of candles) {
			await prisma.bTCandle.upsert({
				where: {
					symbol_interval_openTime: {
						symbol: candle.symbol,
						interval: candle.interval,
						openTime: candle.openTime,
					},
				},
				update: {
					closeTime: candle.closeTime,
					open: candle.open,
					high: candle.high,
					low: candle.low,
					close: candle.close,
					volume: candle.volume,
					quoteVolume: candle.quoteVolume,
					trades: candle.trades,
					takerBuyBase: candle.takerBuyBase,
					takerBuyQuote: candle.takerBuyQuote,
					source: candle.source,
					updatedAt: new Date(),
				},
				create: candle,
			});
			upsertedCount++;
		}

		return upsertedCount;
	} catch (error) {
		console.error('❌ Ошибка upsert данных:', error.message);
		throw error;
	}
}

/**
 * Основная функция синхронизации
 */
async function syncKlines() {
	let mode = 'init';
	let startTime = new Date(config.startFrom);
	let totalUpserted = 0;
	let batchCount = 0;

	try {
		console.log('🚀 Запуск синхронизации BTC свечей...');
		console.log(`📊 Параметры: ${config.symbol} ${config.interval} из ${config.source}`);
		console.log(`📅 Стартовая дата: ${startTime.toISOString()}`);

		// Проверяем последнюю дату в БД
		const lastOpenTime = await getLastOpenTime();

		if (lastOpenTime) {
			mode = 'resume';
			startTime = new Date(lastOpenTime.getTime() + 5 * 60 * 1000); // +5 минут
			console.log(`🔄 Режим: ${mode}`);
			console.log(`📅 Продолжение с: ${startTime.toISOString()}`);
		} else {
			console.log(`🆕 Режим: ${mode}`);
			console.log(`📅 Начальная загрузка с: ${startTime.toISOString()}`);
		}

		const now = new Date();

		// Если установлено ограничение по времени, ограничиваем стартовую дату
		if (config.maxHoursBack > 0) {
			const minStartTime = new Date(now.getTime() - config.maxHoursBack * 60 * 60 * 1000);
			if (startTime < minStartTime) {
				console.log(`⏰ Ограничение диапазона: синхронизируем только последние ${config.maxHoursBack} часов`);
				startTime = minStartTime;
				mode = 'incremental';
			}
		}

		// Проверяем, нужно ли что-то синхронизировать
		if (startTime >= now) {
			console.log('✅ Данные актуальны, синхронизация не требуется');
			return;
		}

		// Основной цикл синхронизации
		while (startTime < now) {
			batchCount++;

			// Вычисляем конечное время для батча
			const endTime = new Date(Math.min(
				startTime.getTime() + config.batchSize * 5 * 60 * 1000, // 1000 свечей * 5 минут
				now.getTime()
			));

			try {
				// Получаем данные с Binance
				const klines = await fetchKlines(startTime, endTime);

				if (klines.length === 0) {
					console.log(`📭 Батч ${batchCount}: нет данных`);
					break;
				}

				// Преобразуем данные
				const candles = klines.map(transformKlineData);

				// Сохраняем в БД
				const upserted = await upsertCandles(candles);
				totalUpserted += upserted;

				const lastCandle = candles[candles.length - 1];
				console.log(`✅ Батч ${batchCount}: ${upserted} свечей, последняя: ${lastCandle.closeTime.toISOString()}`);

				// Обновляем время для следующего батча
				startTime = new Date(lastCandle.closeTime.getTime() + 5 * 60 * 1000);

				// Пауза между батчами
				if (startTime < now) {
					await delay(config.delayBetweenBatches);
				}

			} catch (error) {
				console.error(`❌ Ошибка в батче ${batchCount}:`, error.message);
				throw error;
			}
		}

		console.log('🎉 Синхронизация завершена!');
		console.log(`📊 Итого обработано батчей: ${batchCount}`);
		console.log(`📈 Итого upsert свечей: ${totalUpserted}`);

	} catch (error) {
		console.error('💥 Критическая ошибка синхронизации:', error.message);
		throw error;
	}
}

/**
 * Основная функция
 */
async function main() {
	try {
		await syncKlines();
		console.log('✅ Скрипт выполнен успешно');
		process.exit(0);
	} catch (error) {
		console.error('💥 Фатальная ошибка:', error.message);
		process.exit(1);
	} finally {
		// Закрываем соединение с БД
		await prisma.$disconnect();
	}
}

// Обработка сигналов завершения
process.on('SIGINT', async () => {
	console.log('\n🛑 Получен сигнал завершения...');
	await prisma.$disconnect();
	process.exit(0);
});

process.on('SIGTERM', async () => {
	console.log('\n🛑 Получен сигнал завершения...');
	await prisma.$disconnect();
	process.exit(0);
});

// Запуск скрипта
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
