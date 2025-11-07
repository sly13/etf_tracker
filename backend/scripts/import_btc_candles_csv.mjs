#!/usr/bin/env node

/**
 * Скрипт импорта данных из CSV файла btc_candles.csv в таблицу btc_candles
 * Использует Prisma Client для работы с базой данных
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Инициализация Prisma Client
const prisma = new PrismaClient();

/**
 * Парсинг CSV строки
 */
function parseCSVLine(line) {
	const values = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			inQuotes = !inQuotes;
		} else if (char === ',' && !inQuotes) {
			values.push(current.trim());
			current = '';
		} else {
			current += char;
		}
	}
	values.push(current.trim());
	return values;
}

/**
 * Преобразование строки CSV в объект свечи
 */
function csvRowToCandle(row, headers) {
	const obj = {};
	headers.forEach((header, index) => {
		obj[header] = row[index];
	});

	// Преобразуем данные в нужный формат
	return {
		symbol: obj.symbol,
		interval: obj.interval,
		openTime: new Date(obj.open_time),
		closeTime: new Date(obj.close_time),
		open: parseFloat(obj.open),
		high: parseFloat(obj.high),
		low: parseFloat(obj.low),
		close: parseFloat(obj.close),
		volume: parseFloat(obj.volume),
		quoteVolume: parseFloat(obj.quote_volume),
		trades: parseInt(obj.trades, 10),
		takerBuyBase: parseFloat(obj.taker_buy_base),
		takerBuyQuote: parseFloat(obj.taker_buy_quote),
		source: obj.source || 'binance_spot',
	};
}

/**
 * Импорт данных из CSV файла
 */
async function importCSV(filePath) {
	console.log(`📂 Чтение CSV файла: ${filePath}`);

	if (!fs.existsSync(filePath)) {
		throw new Error(`Файл не найден: ${filePath}`);
	}

	// Читаем файл построчно для экономии памяти
	const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
	const readline = await import('readline');

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	});

	// Читаем заголовки
	let headers = null;
	let lineNumber = 0;
	let headersRead = false;

	// Импортируем данные батчами
	const batchSize = 1000;
	let imported = 0;
	let skipped = 0;
	let errors = 0;
	let candles = [];
	let totalLines = 0;

	// Сначала считаем общее количество строк для прогресса
	console.log('📊 Подсчет строк в файле...');
	const countStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
	const countRl = readline.createInterface({
		input: countStream,
		crlfDelay: Infinity,
	});

	for await (const _ of countRl) {
		totalLines++;
	}
	totalLines--; // Вычитаем заголовок
	console.log(`📊 Всего строк для импорта: ${totalLines}`);

	// Теперь читаем и импортируем данные
	for await (const line of rl) {
		lineNumber++;

		if (!headersRead) {
			headers = parseCSVLine(line);
			console.log(`📋 Найдено колонок: ${headers.length}`);
			headersRead = true;
			continue;
		}

		if (!line.trim()) {
			continue;
		}

		try {
			const row = parseCSVLine(line);
			if (row.length !== headers.length) {
				console.warn(`⚠️ Пропущена строка ${lineNumber}: неверное количество колонок`);
				skipped++;
				continue;
			}

			const candle = csvRowToCandle(row, headers);
			candles.push(candle);

			// Когда накопили батч, вставляем в БД
			if (candles.length >= batchSize) {
				try {
					// Используем транзакцию для батча
					await prisma.$transaction(
						candles.map(candle =>
							prisma.bTCandle.upsert({
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
							})
						),
						{ timeout: 300000 } // 5 минут таймаут для больших батчей
					);

					imported += candles.length;

					if (imported % (batchSize * 10) === 0 || lineNumber >= totalLines) {
						const percent = totalLines > 0 ? Math.round((lineNumber / totalLines) * 100) : 0;
						console.log(`📈 Импортировано: ${imported} записей (${percent}%)`);
					}

					candles = []; // Очищаем батч
				} catch (error) {
					console.error(`❌ Ошибка импорта батча (строки ${lineNumber - batchSize + 1}-${lineNumber}):`, error.message);
					errors += candles.length;
					candles = [];
				}
			}
		} catch (error) {
			console.error(`❌ Ошибка парсинга строки ${lineNumber}:`, error.message);
			errors++;
		}
	}

	// Импортируем оставшиеся записи
	if (candles.length > 0) {
		try {
			await prisma.$transaction(
				candles.map(candle =>
					prisma.bTCandle.upsert({
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
					})
				),
				{ timeout: 300000 }
			);
			imported += candles.length;
		} catch (error) {
			console.error(`❌ Ошибка импорта последнего батча:`, error.message);
			errors += candles.length;
		}
	}

	console.log(`\n✅ Импорт завершен:`);
	console.log(`   📊 Импортировано: ${imported} записей`);
	console.log(`   ⏭️  Пропущено: ${skipped} записей`);
	console.log(`   ❌ Ошибок: ${errors} записей`);

	return { imported, skipped, errors };
}

/**
 * Основная функция
 */
async function main() {
	try {
		const csvPath = process.env.CSV_PATH || path.join(__dirname, '../data/btc_candles.csv');

		console.log('🚀 Начало импорта данных из CSV файла...');
		console.log(`📁 Путь к файлу: ${csvPath}`);

		const result = await importCSV(csvPath);

		if (result.errors > 0) {
			console.warn(`⚠️ Импорт завершен с ошибками. Проверьте логи выше.`);
			process.exit(1);
		}

		console.log('✅ Импорт успешно завершен!');
	} catch (error) {
		console.error('❌ Критическая ошибка импорта:', error.message);
		console.error(error.stack);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Запуск скрипта
main();

