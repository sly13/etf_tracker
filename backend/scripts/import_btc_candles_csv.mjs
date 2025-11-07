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
	// Важно: проверяем наличие всех обязательных полей
	if (!obj.symbol || !obj.interval || !obj.open_time) {
		throw new Error(`Отсутствуют обязательные поля: symbol=${obj.symbol}, interval=${obj.interval}, open_time=${obj.open_time}`);
	}

	const openTime = new Date(obj.open_time);
	const closeTime = new Date(obj.close_time);

	if (isNaN(openTime.getTime())) {
		throw new Error(`Невалидная дата open_time: ${obj.open_time}`);
	}
	if (isNaN(closeTime.getTime())) {
		throw new Error(`Невалидная дата close_time: ${obj.close_time}`);
	}

	return {
		symbol: obj.symbol,
		interval: obj.interval,
		openTime: openTime,
		closeTime: closeTime,
		open: parseFloat(obj.open) || 0,
		high: parseFloat(obj.high) || 0,
		low: parseFloat(obj.low) || 0,
		close: parseFloat(obj.close) || 0,
		volume: parseFloat(obj.volume) || 0,
		quoteVolume: parseFloat(obj.quote_volume) || 0,
		trades: parseInt(obj.trades, 10) || 0,
		takerBuyBase: parseFloat(obj.taker_buy_base) || 0,
		takerBuyQuote: parseFloat(obj.taker_buy_quote) || 0,
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
	let processedLines = 0;

	// Читаем и импортируем данные в одном проходе
	// Подсчет строк будет происходить по ходу обработки
	console.log('📊 Начало чтения и импорта данных...');
	
	for await (const line of rl) {
		lineNumber++;

		if (!headersRead) {
			headers = parseCSVLine(line);
			console.log(`📋 Найдено колонок: ${headers.length}`);
			console.log(`📋 Заголовки: ${headers.join(', ')}`);
			headersRead = true;
			continue;
		}

		if (!line.trim()) {
			continue;
		}

		processedLines++;
		totalLines = processedLines; // Обновляем счетчик для прогресса

		try {
			const row = parseCSVLine(line);
			if (row.length !== headers.length) {
				if (processedLines <= 5) {
					console.warn(`⚠️ Пропущена строка ${lineNumber}: неверное количество колонок (ожидалось ${headers.length}, получено ${row.length})`);
				}
				skipped++;
				continue;
			}

			let candle;
			try {
				candle = csvRowToCandle(row, headers);
			} catch (error) {
				if (processedLines <= 5) {
					console.error(`❌ Ошибка преобразования строки ${lineNumber}:`, error.message);
					console.error(`   Данные строки:`, row.slice(0, 5).join(', '));
				}
				errors++;
				continue;
			}
			
			// Проверяем, что candle валиден
			if (!candle || !candle.symbol || !candle.interval || !candle.openTime) {
				if (processedLines <= 5) {
					console.warn(`⚠️ Пропущена строка ${lineNumber}: невалидные данные`);
					console.warn(`   Symbol: ${candle?.symbol}, Interval: ${candle?.interval}, OpenTime: ${candle?.openTime}`);
					console.warn(`   Первые 5 значений строки:`, row.slice(0, 5));
				}
				skipped++;
				continue;
			}
			
			// Проверяем, что openTime валидная дата
			if (isNaN(candle.openTime.getTime())) {
				if (processedLines <= 5) {
					console.warn(`⚠️ Пропущена строка ${lineNumber}: невалидная дата openTime`);
				}
				skipped++;
				continue;
			}
			
			candles.push(candle);
			
			// Логируем первые несколько успешно обработанных записей
			if (processedLines <= 3) {
				console.log(`✅ Обработана строка ${lineNumber}: symbol=${candle.symbol}, interval=${candle.interval}, openTime=${candle.openTime}`);
			}

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

					if (imported % (batchSize * 10) === 0 || processedLines % 100000 === 0) {
						const percent = totalLines > 0 ? Math.round((processedLines / totalLines) * 100) : 0;
						console.log(`📈 Импортировано: ${imported} записей, обработано строк: ${processedLines} (${percent}%)`);
					}

					candles = []; // Очищаем батч
				} catch (error) {
					console.error(`❌ Ошибка импорта батча (строки ${lineNumber - batchSize + 1}-${lineNumber}):`, error.message);
					if (errors === 0) {
						console.error(`❌ Детали ошибки:`, error);
					}
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
	console.log(`   📄 Обработано строк: ${processedLines}`);

	if (imported === 0 && processedLines > 0) {
		console.error(`\n⚠️  ВНИМАНИЕ: Обработано ${processedLines} строк, но ничего не импортировано!`);
		console.error(`   Возможные причины:`);
		console.error(`   - Ошибки в преобразовании данных (проверьте функцию csvRowToCandle)`);
		console.error(`   - Ошибки при вставке в БД (проверьте логи выше)`);
		console.error(`   - Несоответствие формата CSV ожидаемому`);
	}

	return { imported, skipped, errors };
}

/**
 * Проверка существования таблицы
 */
async function checkTableExists() {
	try {
		const result = await prisma.$queryRaw`
			SELECT EXISTS (
				SELECT FROM information_schema.tables 
				WHERE table_schema = 'public' 
				AND table_name = 'btc_candles'
			);
		`;
		return result[0].exists;
	} catch (error) {
		console.error('❌ Ошибка при проверке существования таблицы:', error.message);
		return false;
	}
}

/**
 * Основная функция
 */
async function main() {
	try {
		// Проверяем существование таблицы перед импортом
		console.log('🔍 Проверка существования таблицы btc_candles...');
		const tableExists = await checkTableExists();
		
		if (!tableExists) {
			console.error('❌ Ошибка: Таблица btc_candles не существует в базе данных!');
			console.error('💡 Примените миграции перед импортом:');
			console.error('   npx prisma migrate deploy');
			process.exit(1);
		}
		
		console.log('✅ Таблица btc_candles существует');

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

