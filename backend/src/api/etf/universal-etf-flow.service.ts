import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import * as puppeteer from 'puppeteer';

export interface ETFFlowData {
  date: string;
  blackrock: number;
  fidelity: number;
  bitwise: number;
  twentyOneShares: number;
  vanEck: number;
  invesco: number;
  franklin: number;
  grayscale: number;
  grayscaleCrypto: number;
  total: number;
}

export interface BTCFlowData extends ETFFlowData {
  valkyrie: number;
  wisdomTree: number;
  grayscaleBtc: number;
}

export interface ParsingResult {
  success: boolean;
  count: number;
  message?: string;
  error?: string;
}

@Injectable()
export class UniversalETFFlowService {
  private readonly logger = new Logger(UniversalETFFlowService.name);

  private readonly urls = {
    ethereum: 'https://farside.co.uk/ethereum-etf-flow-all-data/',
    bitcoin: 'https://farside.co.uk/bitcoin-etf-flow-all-data/',
  };

  constructor(private readonly prisma: PrismaService) {}

  async parseETFFlowData(
    type: 'ethereum' | 'bitcoin',
  ): Promise<ETFFlowData[] | BTCFlowData[]> {
    let browser: puppeteer.Browser | undefined;

    try {
      this.logger.log(
        `Начинаю парсинг данных о потоках ${type.toUpperCase()} ETF с помощью Puppeteer`,
      );

      // Настройки Puppeteer для сервера
      const puppeteerOptions: any = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-pings',
          '--password-store=basic',
          '--use-mock-keychain',
          '--disable-blink-features=AutomationControlled',
          '--disable-ipc-flooding-protection',
        ],
      };

      // Используем системный Chrome если доступен
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }

      // Добавляем дополнительные аргументы из переменных окружения
      if (process.env.PUPPETEER_ARGS) {
        puppeteerOptions.args.push(...process.env.PUPPETEER_ARGS.split(' '));
      }

      browser = await puppeteer.launch(puppeteerOptions);

      const page: puppeteer.Page = await browser.newPage();

      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
      );

      await page.setViewport({ width: 1920, height: 1080 });

      this.logger.log(
        `Перехожу на страницу с данными ${type.toUpperCase()} ETF...`,
      );

      await page.goto(this.urls[type], {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      this.logger.log('Страница загружена, жду загрузки таблицы...');

      await page.waitForSelector('table.etf', { timeout: 10000 });

      this.logger.log('Таблица найдена, начинаю парсинг...');

      const rowCount = await page.evaluate(() => {
        const table = document.querySelector('table.etf');
        if (!table) return 0;

        const tbody = table.querySelector('tbody');
        if (!tbody) return 0;

        return tbody.querySelectorAll('tr').length;
      });

      this.logger.log(
        `Найдено ${rowCount} строк в таблице ${type.toUpperCase()} ETF`,
      );

      if (type === 'ethereum') {
        const flowData: ETFFlowData[] = await page.evaluate(() => {
          const table = document.querySelector('table.etf');
          if (!table) return [];

          const tbody = table.querySelector('tbody');
          if (!tbody) return [];

          const rows = tbody.querySelectorAll('tr');
          const data: any[] = [];

          // Функция для правильного парсинга даты
          function parseDate(dateText: string): string | null {
            try {
              // Ожидаемый формат: "29 Aug 2025"
              const parts = dateText.trim().split(' ');
              if (parts.length !== 3) return null;

              const day = parseInt(parts[0]);
              const month = parts[1];
              const year = parseInt(parts[2]);

              if (isNaN(day) || isNaN(year)) return null;

              // Маппинг месяцев
              const monthMap: { [key: string]: number } = {
                Jan: 0,
                Feb: 1,
                Mar: 2,
                Apr: 3,
                May: 4,
                Jun: 5,
                Jul: 6,
                Aug: 7,
                Sep: 8,
                Oct: 9,
                Nov: 10,
                Dec: 11,
              };

              const monthIndex = monthMap[month];
              if (monthIndex === undefined) return null;

              // Создаем дату в UTC для избежания проблем с временными зонами
              const date = new Date(Date.UTC(year, monthIndex, day));

              // Проверяем валидность даты
              if (
                date.getUTCFullYear() !== year ||
                date.getUTCMonth() !== monthIndex ||
                date.getUTCDate() !== day
              ) {
                return null;
              }

              // Возвращаем дату в формате YYYY-MM-DD
              return date.toISOString().split('T')[0];
            } catch (error) {
              console.log('Ошибка парсинга даты:', dateText, error);
              return null;
            }
          }

          const seenDates = new Set<string>();

          rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');

            if (cells.length >= 11) {
              console.log(
                `Ethereum processing row ${index + 1} with ${cells.length} cells`,
              );
              const firstCellText = cells[0]
                .querySelector('span.tabletext')
                ?.textContent?.trim();

              // Обрабатываем seed данные отдельно
              if (firstCellText === 'Seed') {
                console.log('Ethereum processing Seed data');
                const seedData = {
                  date: '2024-07-22', // За день до старта Ethereum ETF
                  blackrock: parseNumber(
                    cells[1].querySelector('span.tabletext')?.textContent,
                  ),
                  fidelity: parseNumber(
                    cells[2].querySelector('span.tabletext')?.textContent,
                  ),
                  bitwise: parseNumber(
                    cells[3].querySelector('span.tabletext')?.textContent,
                  ),
                  twentyOneShares: parseNumber(
                    cells[4].querySelector('span.tabletext')?.textContent,
                  ),
                  vanEck: parseNumber(
                    cells[5].querySelector('span.tabletext')?.textContent,
                  ),
                  invesco: parseNumber(
                    cells[6].querySelector('span.tabletext')?.textContent,
                  ),
                  franklin: parseNumber(
                    cells[7].querySelector('span.tabletext')?.textContent,
                  ),
                  grayscale: parseNumber(
                    cells[8].querySelector('span.tabletext')?.textContent,
                  ),
                  grayscaleCrypto: parseNumber(
                    cells[9].querySelector('span.tabletext')?.textContent,
                  ),
                  total: parseNumber(
                    cells[10].querySelector('span.tabletext')?.textContent,
                  ),
                };

                // Проверяем, что не все значения равны нулю только для сегодняшнего дня
                const today = new Date().toISOString().split('T')[0];
                const isToday = seedData.date === today;

                if (isToday) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { date, ...numericValues } = seedData;
                  const allValuesZero = Object.values(numericValues).every(
                    (value) => value === 0,
                  );

                  if (allValuesZero) {
                    console.log(
                      'Ethereum Seed data skipped for today - all values are zero',
                    );
                    return;
                  }
                }

                if (!seenDates.has(seedData.date)) {
                  seenDates.add(seedData.date);
                  data.push(seedData);
                  console.log('Ethereum Seed data saved:', seedData);
                } else {
                  console.log(
                    'Ethereum Seed data already exists for date:',
                    seedData.date,
                  );
                }
                return;
              }

              // Обрабатываем обычные данные
              if (firstCellText && firstCellText !== 'Seed') {
                console.log(
                  `Ethereum Row ${index + 1}: processing date "${firstCellText}"`,
                );
                try {
                  const parsedDate = parseDate(firstCellText);
                  if (parsedDate && !seenDates.has(parsedDate)) {
                    console.log(
                      `Ethereum successfully parsed date: ${parsedDate}`,
                    );
                    seenDates.add(parsedDate);

                    const flowDataItem = {
                      date: parsedDate,
                      blackrock: parseNumber(
                        cells[1].querySelector('span.tabletext')?.textContent,
                      ),
                      fidelity: parseNumber(
                        cells[2].querySelector('span.tabletext')?.textContent,
                      ),
                      bitwise: parseNumber(
                        cells[3].querySelector('span.tabletext')?.textContent,
                      ),
                      twentyOneShares: parseNumber(
                        cells[4].querySelector('span.tabletext')?.textContent,
                      ),
                      vanEck: parseNumber(
                        cells[5].querySelector('span.tabletext')?.textContent,
                      ),
                      invesco: parseNumber(
                        cells[6].querySelector('span.tabletext')?.textContent,
                      ),
                      franklin: parseNumber(
                        cells[7].querySelector('span.tabletext')?.textContent,
                      ),
                      grayscale: parseNumber(
                        cells[8].querySelector('span.tabletext')?.textContent,
                      ),
                      grayscaleCrypto: parseNumber(
                        cells[9].querySelector('span.tabletext')?.textContent,
                      ),
                      total: parseNumber(
                        cells[10].querySelector('span.tabletext')?.textContent,
                      ),
                    };

                    // Проверяем, что не все значения равны нулю только для сегодняшнего дня
                    const today = new Date().toISOString().split('T')[0];
                    const isToday = parsedDate === today;

                    if (isToday) {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { date, ...numericValues } = flowDataItem;
                      const allValuesZero = Object.values(numericValues).every(
                        (value) => value === 0,
                      );

                      if (allValuesZero) {
                        console.log(
                          `Ethereum data skipped for today - all values are zero`,
                        );
                        return;
                      }
                    }

                    data.push(flowDataItem);
                    console.log(`Ethereum data added for date: ${parsedDate}`);
                  }
                } catch (error) {
                  console.log(
                    `Ошибка при обработке строки ${index + 1}:`,
                    error,
                  );
                }
              }
            }
          });

          return data;

          function parseNumber(text: string | null | undefined): number {
            if (!text) return 0;

            try {
              const cleanText = text.replace(/[^\d.,-]/g, '');

              if (text.includes('(') && text.includes(')')) {
                const number = parseFloat(cleanText.replace(/[()]/g, ''));
                return isNaN(number) ? 0 : -number;
              }

              // Заменяем все запятые на пустую строку (убираем разделители тысяч)
              // Оставляем точку как десятичный разделитель
              const numberText = cleanText.replace(/,/g, '');
              const number = parseFloat(numberText);
              return isNaN(number) ? 0 : number;
            } catch {
              return 0;
            }
          }
        });

        this.logger.log(
          `Успешно спарсено ${flowData.length} записей о потоках ${type.toUpperCase()} ETF`,
        );
        console.log('Ethereum total records parsed:', flowData.length);
        return flowData;
      } else {
        // Bitcoin парсинг с дополнительными полями
        const flowData: BTCFlowData[] = await page.evaluate(() => {
          const table = document.querySelector('table.etf');
          if (!table) return [];

          const tbody = table.querySelector('tbody');
          if (!tbody) return [];

          const rows = tbody.querySelectorAll('tr');
          const data: any[] = [];

          // Функция для правильного парсинга даты
          function parseDate(dateText: string): string | null {
            try {
              // Ожидаемый формат: "29 Aug 2025"
              const parts = dateText.trim().split(' ');
              if (parts.length !== 3) return null;

              const day = parseInt(parts[0]);
              const month = parts[1];
              const year = parseInt(parts[2]);

              if (isNaN(day) || isNaN(year)) return null;

              // Маппинг месяцев
              const monthMap: { [key: string]: number } = {
                Jan: 0,
                Feb: 1,
                Mar: 2,
                Apr: 3,
                May: 4,
                Jun: 5,
                Jul: 6,
                Aug: 7,
                Sep: 8,
                Oct: 9,
                Nov: 10,
                Dec: 11,
              };

              const monthIndex = monthMap[month];
              if (monthIndex === undefined) return null;

              // Создаем дату в UTC для избежания проблем с временными зонами
              const date = new Date(Date.UTC(year, monthIndex, day));

              // Проверяем валидность даты
              if (
                date.getUTCFullYear() !== year ||
                date.getUTCMonth() !== monthIndex ||
                date.getUTCDate() !== day
              ) {
                return null;
              }

              // Возвращаем дату в формате YYYY-MM-DD
              return date.toISOString().split('T')[0];
            } catch (error) {
              console.log('Ошибка парсинга даты:', dateText, error);
              return null;
            }
          }

          rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');

            if (cells.length >= 13) {
              const firstCellText = cells[0]
                .querySelector('span.tabletext')
                ?.textContent?.trim();

              console.log(
                `Row ${index + 1}: processing date "${firstCellText}"`,
              );

              if (firstCellText && firstCellText !== 'Seed') {
                try {
                  const parsedDate = parseDate(firstCellText);
                  if (parsedDate) {
                    console.log(`Successfully parsed date: ${parsedDate}`);
                    const flowDataItem = {
                      date: parsedDate,
                      blackrock: parseNumber(
                        cells[1].querySelector('span.tabletext')?.textContent,
                      ),
                      fidelity: parseNumber(
                        cells[2].querySelector('span.tabletext')?.textContent,
                      ),
                      bitwise: parseNumber(
                        cells[3].querySelector('span.tabletext')?.textContent,
                      ),
                      twentyOneShares: parseNumber(
                        cells[4].querySelector('span.tabletext')?.textContent,
                      ),
                      invesco: parseNumber(
                        cells[5].querySelector('span.tabletext')?.textContent,
                      ),
                      franklin: parseNumber(
                        cells[6].querySelector('span.tabletext')?.textContent,
                      ),
                      valkyrie: parseNumber(
                        cells[7].querySelector('span.tabletext')?.textContent,
                      ),
                      vanEck: parseNumber(
                        cells[8].querySelector('span.tabletext')?.textContent,
                      ),
                      wisdomTree: parseNumber(
                        cells[9].querySelector('span.tabletext')?.textContent,
                      ),
                      grayscale: parseNumber(
                        cells[10].querySelector('span.tabletext')?.textContent,
                      ),
                      grayscaleBtc: parseNumber(
                        cells[11].querySelector('span.tabletext')?.textContent,
                      ),
                      total: parseNumber(
                        cells[12].querySelector('span.tabletext')?.textContent,
                      ),
                    };

                    // Проверяем, что не все значения равны нулю только для сегодняшнего дня
                    const today = new Date().toISOString().split('T')[0];
                    const isToday = flowDataItem.date === today;

                    if (isToday) {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { date, ...numericValues } = flowDataItem;
                      const allValuesZero = Object.values(numericValues).every(
                        (value) => value === 0,
                      );

                      if (allValuesZero) {
                        console.log(
                          `Bitcoin data skipped for today - all values are zero`,
                        );
                        return;
                      }
                    }

                    data.push(flowDataItem);
                    console.log(
                      'Bitcoin Grayscale BTC parsed value:',
                      flowDataItem.grayscaleBtc,
                    );
                    console.log('Bitcoin data date:', flowDataItem.date);
                    console.log(
                      `Bitcoin data added for date: ${flowDataItem.date}`,
                    );
                  }
                } catch (error) {
                  console.log(
                    `Ошибка при обработке строки ${index + 1}:`,
                    error,
                  );
                }
              }
            }
          });

          return data;

          function parseNumber(text: string | null | undefined): number {
            if (!text) return 0;

            try {
              const cleanText = text.replace(/[^\d.,-]/g, '');

              if (text.includes('(') && text.includes(')')) {
                const number = parseFloat(cleanText.replace(/[()]/g, ''));
                return isNaN(number) ? 0 : -number;
              }

              // Заменяем все запятые на пустую строку (убираем разделители тысяч)
              // Оставляем точку как десятичный разделитель
              const numberText = cleanText.replace(/,/g, '');
              const number = parseFloat(numberText);
              return isNaN(number) ? 0 : number;
            } catch {
              return 0;
            }
          }
        });

        this.logger.log(
          `Успешно спарсено ${flowData.length} записей о потоках ${type.toUpperCase()} ETF`,
        );
        return flowData;
      }
    } catch (error) {
      this.logger.error(
        `Ошибка при парсинге данных ${type.toUpperCase()} ETF:`,
        error,
      );
      throw error;
    } finally {
      if (browser) {
        this.logger.log('Закрываю браузер...');
        await browser.close();
      }
    }
  }

  async saveETFFlowData(
    type: 'ethereum' | 'bitcoin',
    flowData: ETFFlowData[] | BTCFlowData[],
  ): Promise<{
    hasNewData: boolean;
    newDataCount: number;
    newData?: any;
    newRecords: any[];
  }> {
    try {
      this.logger.log(
        `Начинаю сохранение данных о потоках ${type.toUpperCase()} ETF в базу данных`,
      );

      this.logger.log(
        `Сохраняю ${flowData.length} записей ${type.toUpperCase()} ETF`,
      );

      let newDataCount = 0;
      let latestNewData: any = null;
      const newRecords: any[] = [];

      for (const data of flowData) {
        const date = new Date(data.date);

        if (type === 'ethereum') {
          // Получаем существующую запись для сравнения
          const existingRecord = await this.prisma.eTFFlow.findUnique({
            where: { date },
            select: {
              id: true,
              total: true,
              blackrock: true,
              fidelity: true,
              bitwise: true,
              twentyOneShares: true,
              vanEck: true,
              invesco: true,
              franklin: true,
              grayscale: true,
              grayscaleEth: true,
            },
          });

          const wasExisting = !!existingRecord;

          // Сохраняем данные
          await this.prisma.eTFFlow.upsert({
            where: { date },
            update: {
              blackrock: data.blackrock,
              fidelity: data.fidelity,
              bitwise: data.bitwise,
              twentyOneShares: data.twentyOneShares,
              vanEck: data.vanEck,
              invesco: data.invesco,
              franklin: data.franklin,
              grayscale: data.grayscale,
              grayscaleEth: data.grayscaleCrypto,
              total: data.total,
              updatedAt: new Date(),
            },
            create: {
              date,
              blackrock: data.blackrock,
              fidelity: data.fidelity,
              bitwise: data.bitwise,
              twentyOneShares: data.twentyOneShares,
              vanEck: data.vanEck,
              invesco: data.invesco,
              franklin: data.franklin,
              grayscale: data.grayscale,
              grayscaleEth: data.grayscaleCrypto,
              total: data.total,
            },
          });

          // Обнаруживаем новые записи для каждой компании
          const companies = [
            { name: 'blackrock', value: data.blackrock },
            { name: 'fidelity', value: data.fidelity },
            { name: 'bitwise', value: data.bitwise },
            { name: 'twentyOneShares', value: data.twentyOneShares },
            { name: 'vanEck', value: data.vanEck },
            { name: 'invesco', value: data.invesco },
            { name: 'franklin', value: data.franklin },
            { name: 'grayscale', value: data.grayscale },
            { name: 'grayscaleEth', value: data.grayscaleCrypto },
          ];

          for (const company of companies) {
            const previousValue = existingRecord?.[company.name] || 0;
            const currentValue = company.value || 0;

            // Проверяем, появилась ли новая запись или значительно изменилась
            const isNewRecord = this.isNewRecord(previousValue, currentValue);

            if (isNewRecord) {
              const newRecord = await this.createETFNewRecord({
                date,
                assetType: 'ethereum',
                company: company.name,
                amount: currentValue,
                previousAmount: previousValue,
              });

              if (newRecord) {
                newRecords.push(newRecord);
                this.logger.log(
                  `🆕 Новая запись Ethereum ETF: ${company.name} - ${currentValue}M (было: ${previousValue}M)`,
                );
              }
            }
          }

          // Если записи не было, то это новые данные
          if (!wasExisting) {
            newDataCount++;
            latestNewData = data;
            this.logger.log(
              `🆕 Новая запись Ethereum ETF для даты: ${data.date}`,
            );
          }
        } else {
          const btcData = data as BTCFlowData;

          // Получаем существующую запись для сравнения
          const existingRecord = await this.prisma.bTCFlow.findUnique({
            where: { date },
            select: {
              id: true,
              total: true,
              blackrock: true,
              fidelity: true,
              bitwise: true,
              twentyOneShares: true,
              invesco: true,
              franklin: true,
              valkyrie: true,
              vanEck: true,
              wisdomTree: true,
              grayscale: true,
              grayscaleBtc: true,
            },
          });

          const wasExisting = !!existingRecord;

          // Сохраняем данные
          await this.prisma.bTCFlow.upsert({
            where: { date },
            update: {
              blackrock: btcData.blackrock,
              fidelity: btcData.fidelity,
              bitwise: btcData.bitwise,
              twentyOneShares: btcData.twentyOneShares,
              invesco: btcData.invesco,
              franklin: btcData.franklin,
              valkyrie: btcData.valkyrie,
              vanEck: btcData.vanEck,
              wisdomTree: btcData.wisdomTree,
              grayscale: btcData.grayscale,
              grayscaleBtc: btcData.grayscaleBtc,
              total: btcData.total,
              updatedAt: new Date(),
            },
            create: {
              date,
              blackrock: btcData.blackrock,
              fidelity: btcData.fidelity,
              bitwise: btcData.bitwise,
              twentyOneShares: btcData.twentyOneShares,
              invesco: btcData.invesco,
              franklin: btcData.franklin,
              valkyrie: btcData.valkyrie,
              vanEck: btcData.vanEck,
              wisdomTree: btcData.wisdomTree,
              grayscale: btcData.grayscale,
              grayscaleBtc: btcData.grayscaleBtc,
              total: btcData.total,
            },
          });

          // Обнаруживаем новые записи для каждой компании
          const companies = [
            { name: 'blackrock', value: btcData.blackrock },
            { name: 'fidelity', value: btcData.fidelity },
            { name: 'bitwise', value: btcData.bitwise },
            { name: 'twentyOneShares', value: btcData.twentyOneShares },
            { name: 'invesco', value: btcData.invesco },
            { name: 'franklin', value: btcData.franklin },
            { name: 'valkyrie', value: btcData.valkyrie },
            { name: 'vanEck', value: btcData.vanEck },
            { name: 'wisdomTree', value: btcData.wisdomTree },
            { name: 'grayscale', value: btcData.grayscale },
            { name: 'grayscaleBtc', value: btcData.grayscaleBtc },
          ];

          for (const company of companies) {
            const previousValue = existingRecord?.[company.name] || 0;
            const currentValue = company.value || 0;

            // Проверяем, появилась ли новая запись или значительно изменилась
            const isNewRecord = this.isNewRecord(previousValue, currentValue);

            if (isNewRecord) {
              const newRecord = await this.createETFNewRecord({
                date,
                assetType: 'bitcoin',
                company: company.name,
                amount: currentValue,
                previousAmount: previousValue,
              });

              if (newRecord) {
                newRecords.push(newRecord);
                this.logger.log(
                  `🆕 Новая запись Bitcoin ETF: ${company.name} - ${currentValue}M (было: ${previousValue}M)`,
                );
              }
            }
          }

          // Если записи не было, то это новые данные
          if (!wasExisting) {
            newDataCount++;
            latestNewData = data;
            this.logger.log(
              `🆕 Новая запись Bitcoin ETF для даты: ${data.date}`,
            );
          }
        }
      }

      this.logger.log(
        `Данные о потоках ${type.toUpperCase()} ETF успешно сохранены в базу данных. Новых записей: ${newDataCount}, новых событий: ${newRecords.length}`,
      );

      return {
        hasNewData: newDataCount > 0,
        newDataCount,
        newData: latestNewData,
        newRecords,
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при сохранении данных ${type.toUpperCase()} ETF:`,
        error,
      );
      throw error;
    }
  }

  async getETFFlowData(type: 'ethereum'): Promise<ETFFlowData[]>;
  async getETFFlowData(type: 'bitcoin'): Promise<BTCFlowData[]>;
  async getETFFlowData(
    type: 'ethereum' | 'bitcoin',
  ): Promise<ETFFlowData[] | BTCFlowData[]> {
    try {
      if (type === 'ethereum') {
        const flows = await this.prisma.eTFFlow.findMany({
          orderBy: { date: 'desc' },
        });

        return flows.map((flow) => ({
          date: flow.date.toISOString().split('T')[0],
          blackrock: flow.blackrock || 0,
          fidelity: flow.fidelity || 0,
          bitwise: flow.bitwise || 0,
          twentyOneShares: flow.twentyOneShares || 0,
          vanEck: flow.vanEck || 0,
          invesco: flow.invesco || 0,
          franklin: flow.franklin || 0,
          grayscale: flow.grayscale || 0,
          grayscaleCrypto: flow.grayscaleEth || 0,
          total: flow.total || 0,
        }));
      } else {
        const flows = await this.prisma.bTCFlow.findMany({
          orderBy: { date: 'desc' },
        });

        return flows.map(
          (flow) =>
            ({
              date: flow.date.toISOString().split('T')[0],
              blackrock: flow.blackrock || 0,
              fidelity: flow.fidelity || 0,
              bitwise: flow.bitwise || 0,
              twentyOneShares: flow.twentyOneShares || 0,
              invesco: flow.invesco || 0,
              franklin: flow.franklin || 0,
              valkyrie: flow.valkyrie || 0,
              vanEck: flow.vanEck || 0,
              wisdomTree: flow.wisdomTree || 0,
              grayscale: flow.grayscale || 0,
              grayscaleBtc: flow.grayscaleBtc || 0,
              total: flow.total || 0,
            }) as BTCFlowData,
        );
      }
    } catch (error) {
      this.logger.error(
        `Ошибка при получении данных ${type.toUpperCase()} ETF:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Проверяет, является ли изменение новой записью
   */
  private isNewRecord(previousValue: number, currentValue: number): boolean {
    // Если предыдущее значение было 0 или null, а текущее > 0 - это новая запись
    if ((previousValue === 0 || previousValue === null) && currentValue > 0) {
      return true;
    }

    // Если изменение больше чем на 10% и больше чем на 1M - это значительное изменение
    if (previousValue > 0 && currentValue > 0) {
      const changePercent =
        Math.abs(currentValue - previousValue) / previousValue;
      const changeAmount = Math.abs(currentValue - previousValue);

      if (changePercent > 0.1 && changeAmount > 1) {
        return true;
      }
    }

    return false;
  }

  /**
   * Создает новую запись ETFNewRecord
   */
  private async createETFNewRecord(data: {
    date: Date;
    assetType: 'bitcoin' | 'ethereum';
    company: string;
    amount: number;
    previousAmount: number;
  }): Promise<any> {
    try {
      const dedupeKey = `${data.date.toISOString().split('T')[0]}_${data.assetType}_${data.company}_${data.amount.toFixed(2)}`;

      // Проверяем, не создавали ли мы уже такую запись
      const existingRecord = await this.prisma.eTFNewRecord.findUnique({
        where: { dedupeKey },
      });

      if (existingRecord) {
        this.logger.log(`Запись уже существует: ${dedupeKey}`);
        return null;
      }

      const newRecord = await this.prisma.eTFNewRecord.create({
        data: {
          date: data.date,
          assetType: data.assetType,
          company: data.company,
          amount: data.amount,
          previousAmount: data.previousAmount,
          dedupeKey,
        },
      });

      this.logger.log(`Создана новая запись ETF: ${dedupeKey}`);
      return newRecord;
    } catch (error) {
      this.logger.error(`Ошибка при создании новой записи ETF:`, error);
      return null;
    }
  }

  /**
   * Получает новые записи для отправки уведомлений
   */
  async getNewRecordsForNotifications(): Promise<any[]> {
    try {
      const records = await this.prisma.eTFNewRecord.findMany({
        where: {
          deliveries: {
            none: {}, // Записи без доставок уведомлений
          },
        },
        orderBy: {
          detectedAt: 'desc',
        },
        take: 50, // Ограничиваем количество для обработки
      });

      return records;
    } catch (error) {
      this.logger.error(
        'Ошибка при получении новых записей для уведомлений:',
        error,
      );
      return [];
    }
  }

  /**
   * Проверяет, нужно ли обновлять данные на сегодня
   */
  async shouldUpdateToday(): Promise<boolean> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Начало дня

      // Проверяем последние записи для Ethereum и Bitcoin
      const [latestEthereum, latestBitcoin] = await Promise.all([
        this.prisma.eTFFlow.findFirst({
          orderBy: { date: 'desc' },
          select: { date: true },
        }),
        this.prisma.bTCFlow.findFirst({
          orderBy: { date: 'desc' },
          select: { date: true },
        }),
      ]);

      const ethereumDate = latestEthereum?.date;
      const bitcoinDate = latestBitcoin?.date;

      // Если нет данных вообще, нужно обновлять
      if (!ethereumDate || !bitcoinDate) {
        this.logger.log('📊 Нет данных в базе, требуется обновление');
        return true;
      }

      // Проверяем, есть ли данные за сегодня
      const ethereumToday = ethereumDate >= today;
      const bitcoinToday = bitcoinDate >= today;

      if (ethereumToday && bitcoinToday) {
        this.logger.log(
          '✅ Данные за сегодня уже есть, обновление не требуется',
        );
        return false;
      }

      this.logger.log('📊 Данные за сегодня отсутствуют, требуется обновление');
      return true;
    } catch (error) {
      this.logger.error('❌ Ошибка проверки даты обновления:', error);
      return true; // В случае ошибки лучше обновить
    }
  }

  async parseAllETFFlowData(): Promise<{
    ethereum: ParsingResult & {
      hasNewData?: boolean;
      newDataCount?: number;
      newData?: any;
    };
    bitcoin: ParsingResult & {
      hasNewData?: boolean;
      newDataCount?: number;
      newData?: any;
    };
  }> {
    this.logger.log('🚀 Начинаю парсинг данных о потоках всех ETF...');

    // Проверяем, нужно ли обновление
    const shouldUpdate = await this.shouldUpdateToday();
    if (!shouldUpdate) {
      this.logger.log('⏭️ Пропускаю парсинг - данные за сегодня уже актуальны');
      return {
        ethereum: {
          success: true,
          count: 0,
          hasNewData: false,
          newDataCount: 0,
        },
        bitcoin: {
          success: true,
          count: 0,
          hasNewData: false,
          newDataCount: 0,
        },
      };
    }

    const results = {
      ethereum: {
        success: false,
        count: 0,
        hasNewData: false,
        newDataCount: 0,
      } as ParsingResult & {
        hasNewData: boolean;
        newDataCount: number;
        newData?: any;
      },
      bitcoin: {
        success: false,
        count: 0,
        hasNewData: false,
        newDataCount: 0,
      } as ParsingResult & {
        hasNewData: boolean;
        newDataCount: number;
        newData?: any;
      },
    };

    try {
      this.logger.log('📊 Парсинг Ethereum ETF...');
      const ethereumData = await this.parseETFFlowData('ethereum');
      if (ethereumData && ethereumData.length > 0) {
        const saveResult = await this.saveETFFlowData('ethereum', ethereumData);
        results.ethereum = {
          success: true,
          count: ethereumData.length,
          hasNewData: saveResult.hasNewData,
          newDataCount: saveResult.newDataCount,
          newData: saveResult.newData,
        };
        this.logger.log(
          `✅ Ethereum ETF: ${ethereumData.length} записей, новых: ${saveResult.newDataCount}`,
        );
      }
    } catch (error) {
      results.ethereum = {
        success: false,
        count: 0,
        hasNewData: false,
        newDataCount: 0,
        error: error.message,
      };
      this.logger.error('❌ Ошибка при парсинге Ethereum ETF:', error);
    }

    try {
      this.logger.log('📊 Парсинг Bitcoin ETF...');
      const bitcoinData = await this.parseETFFlowData('bitcoin');
      if (bitcoinData && bitcoinData.length > 0) {
        const saveResult = await this.saveETFFlowData('bitcoin', bitcoinData);
        results.bitcoin = {
          success: true,
          count: bitcoinData.length,
          hasNewData: saveResult.hasNewData,
          newDataCount: saveResult.newDataCount,
          newData: saveResult.newData,
        };
        this.logger.log(
          `✅ Bitcoin ETF: ${bitcoinData.length} записей, новых: ${saveResult.newDataCount}`,
        );
      }
    } catch (error) {
      results.bitcoin = {
        success: false,
        count: 0,
        hasNewData: false,
        newDataCount: 0,
        error: error.message,
      };
      this.logger.error('❌ Ошибка при парсинге Bitcoin ETF:', error);
    }

    this.logger.log('🎯 Парсинг всех ETF завершен');
    return results;
  }
}
