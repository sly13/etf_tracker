import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import {
  ETFFlowData,
  BTCFlowData,
  SolFlowData,
  ParsingResult,
} from './etf-types';
import { parseEthereum } from './parsers/ethereum.parser';
import { parseBitcoin } from './parsers/bitcoin.parser';
import { parseSolana } from './parsers/solana.parser';

@Injectable()
export class UniversalETFFlowService {
  private readonly logger = new Logger(UniversalETFFlowService.name);

  private readonly urls = {
    ethereum: 'https://farside.co.uk/ethereum-etf-flow-all-data/',
    bitcoin: 'https://farside.co.uk/bitcoin-etf-flow-all-data/',
    solana: process.env.SOLANA_FLOW_URL || 'https://farside.co.uk/sol/',
  };

  constructor(private readonly prisma: PrismaService) {}

  async parseETFFlowData(
    type: 'ethereum' | 'bitcoin' | 'solana',
  ): Promise<ETFFlowData[] | BTCFlowData[] | SolFlowData[]> {
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
        const flowData = await parseEthereum(page);
        this.logger.log(
          `Успешно спарсено ${flowData.length} записей о потоках ETHEREUM ETF`,
        );
        return flowData;
      } else if (type === 'bitcoin') {
        const flowData = await parseBitcoin(page);
        this.logger.log(
          `Успешно спарсено ${flowData.length} записей о потоках BITCOIN ETF`,
        );
        return flowData;
      } else {
        const flowData = await parseSolana(page);
        this.logger.log(
          `Успешно спарсено ${flowData.length} записей о потоках SOLANA ETF`,
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
    type: 'ethereum' | 'bitcoin' | 'solana',
    flowData: ETFFlowData[] | BTCFlowData[] | SolFlowData[],
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
          const ethData = data as ETFFlowData;
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
              blackrock: ethData.blackrock,
              fidelity: ethData.fidelity,
              bitwise: ethData.bitwise,
              twentyOneShares: ethData.twentyOneShares,
              vanEck: ethData.vanEck,
              invesco: ethData.invesco,
              franklin: ethData.franklin,
              grayscale: ethData.grayscale,
              grayscaleEth: ethData.grayscaleCrypto,
              total: ethData.total,
              updatedAt: new Date(),
            },
            create: {
              date,
              blackrock: ethData.blackrock,
              fidelity: ethData.fidelity,
              bitwise: ethData.bitwise,
              twentyOneShares: ethData.twentyOneShares,
              vanEck: ethData.vanEck,
              invesco: ethData.invesco,
              franklin: ethData.franklin,
              grayscale: ethData.grayscale,
              grayscaleEth: ethData.grayscaleCrypto,
              total: ethData.total,
            },
          });

          // Обнаруживаем новые записи для каждой компании
          const companies = [
            { name: 'blackrock', value: ethData.blackrock },
            { name: 'fidelity', value: ethData.fidelity },
            { name: 'bitwise', value: ethData.bitwise },
            { name: 'twentyOneShares', value: ethData.twentyOneShares },
            { name: 'vanEck', value: ethData.vanEck },
            { name: 'invesco', value: ethData.invesco },
            { name: 'franklin', value: ethData.franklin },
            { name: 'grayscale', value: ethData.grayscale },
            { name: 'grayscaleEth', value: ethData.grayscaleCrypto },
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
            latestNewData = ethData;
            this.logger.log(
              `🆕 Новая запись Ethereum ETF для даты: ${ethData.date}`,
            );
          }
        } else if (type === 'bitcoin') {
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
        } else {
          const solData = data as SolFlowData;

          const existingRecord = await (this.prisma as any).solFlow.findUnique({
            where: { date },
            select: {
              id: true,
              total: true,
              bitwise: true,
              grayscale: true,
            },
          });

          const wasExisting = !!existingRecord;

          await (this.prisma as any).solFlow.upsert({
            where: { date },
            update: {
              bitwise: solData.bitwise,
              grayscale: solData.grayscale,
              total: solData.total,
              updatedAt: new Date(),
            },
            create: {
              date,
              bitwise: solData.bitwise,
              grayscale: solData.grayscale,
              total: solData.total,
            },
          });

          const companies = [
            { name: 'bitwise', value: solData.bitwise },
            { name: 'grayscale', value: solData.grayscale },
          ];
          for (const company of companies) {
            const previousValue = existingRecord?.[company.name] || 0;
            const currentValue = company.value || 0;
            const isNewRecord = this.isNewRecord(previousValue, currentValue);
            if (isNewRecord) {
              const newRecord = await this.createETFNewRecord({
                date,
                assetType: 'solana',
                company: company.name,
                amount: currentValue,
                previousAmount: previousValue,
              });

              if (newRecord) newRecords.push(newRecord);
            }
          }

          if (!wasExisting) {
            newDataCount++;
            latestNewData = data;
            // записали новую дату для Solana
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
  async getETFFlowData(type: 'solana'): Promise<SolFlowData[]>;
  async getETFFlowData(
    type: 'ethereum' | 'bitcoin' | 'solana',
  ): Promise<ETFFlowData[] | BTCFlowData[] | SolFlowData[]> {
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
      } else if (type === 'bitcoin') {
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
      } else {
        const flows = await (this.prisma as any).solFlow.findMany({
          orderBy: { date: 'desc' },
        });

        return flows.map((flow) => ({
          date: flow.date.toISOString().split('T')[0],
          bitwise: flow.bitwise || 0,
          grayscale: flow.grayscale || 0,
          total: flow.total || 0,
        }));
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
    assetType: 'bitcoin' | 'ethereum' | 'solana';
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
      const [latestEthereum, latestBitcoin, latestSolana] = await Promise.all([
        this.prisma.eTFFlow.findFirst({
          orderBy: { date: 'desc' },
          select: { date: true },
        }),
        this.prisma.bTCFlow.findFirst({
          orderBy: { date: 'desc' },
          select: { date: true },
        }),
        (this.prisma as any).solFlow.findFirst({
          orderBy: { date: 'desc' },
          select: { date: true },
        }),
      ]);

      const ethereumDate = latestEthereum?.date;
      const bitcoinDate = latestBitcoin?.date;
      const solanaDate = latestSolana?.date;

      // Если нет данных вообще, нужно обновлять
      if (!ethereumDate || !bitcoinDate || !solanaDate) {
        this.logger.log('📊 Нет данных в базе, требуется обновление');
        return true;
      }

      // Проверяем, есть ли данные за сегодня
      const ethereumToday = ethereumDate >= today;
      const bitcoinToday = bitcoinDate >= today;
      const solanaToday = solanaDate >= today;

      if (ethereumToday && bitcoinToday && solanaToday) {
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
    solana: ParsingResult & {
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
        solana: {
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
      solana: {
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

    try {
      this.logger.log('📊 Парсинг Solana ETF...');
      const solData = await this.parseETFFlowData('solana');
      if (solData && solData.length > 0) {
        const saveResult = await this.saveETFFlowData('solana', solData);
        results.solana = {
          success: true,
          count: solData.length,
          hasNewData: saveResult.hasNewData,
          newDataCount: saveResult.newDataCount,
          newData: saveResult.newData,
        };
        this.logger.log(
          `✅ Solana ETF: ${solData.length} записей, новых: ${saveResult.newDataCount}`,
        );
      }
    } catch (error) {
      results.solana = {
        success: false,
        count: 0,
        hasNewData: false,
        newDataCount: 0,
        error: error.message,
      };
      this.logger.error('❌ Ошибка при парсинге Solana ETF:', error);
    }

    this.logger.log('🎯 Парсинг всех ETF завершен');
    return results;
  }
}
