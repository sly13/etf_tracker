"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ETFFlowSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETFFlowSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
let ETFFlowSchedulerService = ETFFlowSchedulerService_1 = class ETFFlowSchedulerService {
    constructor(etfFlowService) {
        this.etfFlowService = etfFlowService;
        this.logger = new common_1.Logger(ETFFlowSchedulerService_1.name);
        this.lastParseStatus = {
            ethereum: { success: false, count: 0, timestamp: new Date() },
            bitcoin: { success: false, count: 0, timestamp: new Date() },
        };
    }
    async handleMorningParse() {
        this.logger.log('🌅 Утренний парсинг ETF данных...');
        await this.parseAllETFFlowData();
    }
    async handleEveningParse() {
        this.logger.log('🌆 Вечерний парсинг ETF данных...');
        await this.parseAllETFFlowData();
    }
    async parseAllETFFlowData() {
        try {
            const results = await this.etfFlowService.parseAllETFFlowData();
            if (results && results.ethereum && results.bitcoin) {
                this.lastParseStatus.ethereum = {
                    success: results.ethereum.success,
                    count: results.ethereum.count,
                    timestamp: new Date(),
                };
                this.lastParseStatus.bitcoin = {
                    success: results.bitcoin.success,
                    count: results.bitcoin.count,
                    timestamp: new Date(),
                };
                this.logger.log('✅ Парсинг ETF данных завершен успешно');
                this.logger.log(`Ethereum: ${results.ethereum.count} записей`);
                this.logger.log(`Bitcoin: ${results.bitcoin.count} записей`);
            }
        }
        catch (error) {
            this.logger.error('❌ Ошибка при парсинге ETF данных:', error);
        }
    }
    async manualParse() {
        this.logger.log('🔧 Ручной запуск парсинга ETF данных...');
        await this.parseAllETFFlowData();
    }
    getLastParseStatus() {
        return this.lastParseStatus;
    }
};
exports.ETFFlowSchedulerService = ETFFlowSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_6AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ETFFlowSchedulerService.prototype, "handleMorningParse", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_6PM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ETFFlowSchedulerService.prototype, "handleEveningParse", null);
exports.ETFFlowSchedulerService = ETFFlowSchedulerService = ETFFlowSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], ETFFlowSchedulerService);
//# sourceMappingURL=etf-flow-scheduler.service.js.map