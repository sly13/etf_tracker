"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UniversalETFFlowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalETFFlowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const puppeteer = __importStar(require("puppeteer"));
let UniversalETFFlowService = UniversalETFFlowService_1 = class UniversalETFFlowService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UniversalETFFlowService_1.name);
        this.urls = {
            ethereum: 'https://farside.co.uk/ethereum-etf-flow-all-data/',
            bitcoin: 'https://farside.co.uk/bitcoin-etf-flow-all-data/',
        };
    }
    async parseETFFlowData(type) {
        let browser;
        try {
            this.logger.log(`Начинаю парсинг данных о потоках ${type.toUpperCase()} ETF с помощью Puppeteer`);
            const puppeteerOptions = {
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
                    '--single-process',
                ],
            };
            if (process.env.PUPPETEER_EXECUTABLE_PATH) {
                puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
            }
            if (process.env.PUPPETEER_ARGS) {
                puppeteerOptions.args.push(...process.env.PUPPETEER_ARGS.split(' '));
            }
            browser = await puppeteer.launch(puppeteerOptions);
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1920, height: 1080 });
            this.logger.log(`Перехожу на страницу с данными ${type.toUpperCase()} ETF...`);
            await page.goto(this.urls[type], {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });
            this.logger.log('Страница загружена, жду загрузки таблицы...');
            await page.waitForSelector('table.etf', { timeout: 10000 });
            this.logger.log('Таблица найдена, начинаю парсинг...');
            const rowCount = await page.evaluate(() => {
                const table = document.querySelector('table.etf');
                if (!table)
                    return 0;
                const tbody = table.querySelector('tbody');
                if (!tbody)
                    return 0;
                return tbody.querySelectorAll('tr').length;
            });
            this.logger.log(`Найдено ${rowCount} строк в таблице ${type.toUpperCase()} ETF`);
            const flowData = await page.evaluate(() => {
                const table = document.querySelector('table.etf');
                if (!table)
                    return [];
                const tbody = table.querySelector('tbody');
                if (!tbody)
                    return [];
                const rows = tbody.querySelectorAll('tr');
                const data = [];
                rows.forEach((row, index) => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 11) {
                        const firstCellText = cells[0]
                            .querySelector('span.tabletext')
                            ?.textContent?.trim();
                        if (firstCellText && firstCellText !== 'Seed') {
                            try {
                                const date = new Date(firstCellText);
                                if (!isNaN(date.getTime())) {
                                    const flowDataItem = {
                                        date: date.toISOString().split('T')[0],
                                        blackrock: parseNumber(cells[1].querySelector('span.tabletext')?.textContent),
                                        fidelity: parseNumber(cells[2].querySelector('span.tabletext')?.textContent),
                                        bitwise: parseNumber(cells[3].querySelector('span.tabletext')?.textContent),
                                        twentyOneShares: parseNumber(cells[4].querySelector('span.tabletext')?.textContent),
                                        vanEck: parseNumber(cells[5].querySelector('span.tabletext')?.textContent),
                                        invesco: parseNumber(cells[6].querySelector('span.tabletext')?.textContent),
                                        franklin: parseNumber(cells[7].querySelector('span.tabletext')?.textContent),
                                        grayscale: parseNumber(cells[8].querySelector('span.tabletext')?.textContent),
                                        grayscaleCrypto: parseNumber(cells[9].querySelector('span.tabletext')?.textContent),
                                        total: parseNumber(cells[10].querySelector('span.tabletext')?.textContent),
                                    };
                                    data.push(flowDataItem);
                                }
                            }
                            catch (error) {
                                console.log(`Ошибка при обработке строки ${index + 1}:`, error);
                            }
                        }
                    }
                });
                return data;
                function parseNumber(text) {
                    if (!text)
                        return null;
                    try {
                        const cleanText = text.replace(/[^\d.,-]/g, '');
                        if (text.includes('(') && text.includes(')')) {
                            const number = parseFloat(cleanText.replace(/[()]/g, ''));
                            return isNaN(number) ? null : -number;
                        }
                        const number = parseFloat(cleanText.replace(',', '.'));
                        return isNaN(number) ? null : number;
                    }
                    catch {
                        return null;
                    }
                }
            });
            this.logger.log(`Успешно спарсено ${flowData.length} записей о потоках ${type.toUpperCase()} ETF`);
            return flowData;
        }
        catch (error) {
            this.logger.error(`Ошибка при парсинге данных ${type.toUpperCase()} ETF:`, error);
            throw error;
        }
        finally {
            if (browser) {
                this.logger.log('Закрываю браузер...');
                await browser.close();
            }
        }
    }
    async saveETFFlowData(type, flowData) {
        try {
            this.logger.log(`Начинаю сохранение данных о потоках ${type.toUpperCase()} ETF в базу данных`);
            for (const data of flowData) {
                const date = new Date(data.date);
                if (type === 'ethereum') {
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
                }
                else {
                    await this.prisma.bTCFlow.upsert({
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
                            grayscaleBtc: data.grayscaleCrypto,
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
                            grayscaleBtc: data.grayscaleCrypto,
                            total: data.total,
                        },
                    });
                }
            }
            this.logger.log(`Данные о потоках ${type.toUpperCase()} ETF успешно сохранены в базу данных`);
        }
        catch (error) {
            this.logger.error(`Ошибка при сохранении данных ${type.toUpperCase()} ETF:`, error);
            throw error;
        }
    }
    async getETFFlowData(type) {
        try {
            if (type === 'ethereum') {
                const flows = await this.prisma.eTFFlow.findMany({
                    orderBy: { date: 'desc' },
                });
                return flows.map((flow) => ({
                    date: flow.date.toISOString().split('T')[0],
                    blackrock: flow.blackrock,
                    fidelity: flow.fidelity,
                    bitwise: flow.bitwise,
                    twentyOneShares: flow.twentyOneShares,
                    vanEck: flow.vanEck,
                    invesco: flow.invesco,
                    franklin: flow.franklin,
                    grayscale: flow.grayscale,
                    grayscaleCrypto: flow.grayscaleEth,
                    total: flow.total,
                }));
            }
            else {
                const flows = await this.prisma.bTCFlow.findMany({
                    orderBy: { date: 'desc' },
                });
                return flows.map((flow) => ({
                    date: flow.date.toISOString().split('T')[0],
                    blackrock: flow.blackrock,
                    fidelity: flow.fidelity,
                    bitwise: flow.bitwise,
                    twentyOneShares: flow.twentyOneShares,
                    vanEck: flow.vanEck,
                    invesco: flow.invesco,
                    franklin: flow.franklin,
                    grayscale: flow.grayscale,
                    grayscaleCrypto: flow.grayscaleBtc,
                    total: flow.total,
                }));
            }
        }
        catch (error) {
            this.logger.error(`Ошибка при получении данных ${type.toUpperCase()} ETF:`, error);
            throw error;
        }
    }
    async parseAllETFFlowData() {
        this.logger.log('🚀 Начинаю парсинг данных о потоках всех ETF...');
        const results = {
            ethereum: { success: false, count: 0 },
            bitcoin: { success: false, count: 0 },
        };
        try {
            this.logger.log('📊 Парсинг Ethereum ETF...');
            const ethereumData = await this.parseETFFlowData('ethereum');
            if (ethereumData && ethereumData.length > 0) {
                await this.saveETFFlowData('ethereum', ethereumData);
                results.ethereum = { success: true, count: ethereumData.length };
                this.logger.log(`✅ Ethereum ETF: ${ethereumData.length} записей`);
            }
        }
        catch (error) {
            results.ethereum = { success: false, count: 0, error: error.message };
            this.logger.error('❌ Ошибка при парсинге Ethereum ETF:', error);
        }
        try {
            this.logger.log('📊 Парсинг Bitcoin ETF...');
            const bitcoinData = await this.parseETFFlowData('bitcoin');
            if (bitcoinData && bitcoinData.length > 0) {
                await this.saveETFFlowData('bitcoin', bitcoinData);
                results.bitcoin = { success: true, count: bitcoinData.length };
                this.logger.log(`✅ Bitcoin ETF: ${bitcoinData.length} записей`);
            }
        }
        catch (error) {
            results.bitcoin = { success: false, count: 0, error: error.message };
            this.logger.error('❌ Ошибка при парсинге Bitcoin ETF:', error);
        }
        this.logger.log('🎯 Парсинг всех ETF завершен');
        return results;
    }
};
exports.UniversalETFFlowService = UniversalETFFlowService;
exports.UniversalETFFlowService = UniversalETFFlowService = UniversalETFFlowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UniversalETFFlowService);
//# sourceMappingURL=universal-etf-flow.service.js.map