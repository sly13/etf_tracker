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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETFFlowController = void 0;
const common_1 = require("@nestjs/common");
const universal_etf_flow_service_1 = require("./universal-etf-flow.service");
let ETFFlowController = class ETFFlowController {
    constructor(etfFlowService) {
        this.etfFlowService = etfFlowService;
    }
    async getETFFlowData() {
        return await this.etfFlowService.getETFFlowData('ethereum');
    }
    async getEthereumETFFlowData() {
        return await this.etfFlowService.getETFFlowData('ethereum');
    }
    async getBitcoinETFFlowData() {
        return await this.etfFlowService.getETFFlowData('bitcoin');
    }
    async getETFFlowSummary() {
        const ethereumData = await this.etfFlowService.getETFFlowData('ethereum');
        const bitcoinData = await this.etfFlowService.getETFFlowData('bitcoin');
        const ethereumTotal = ethereumData.reduce((sum, item) => sum + (item.total || 0), 0);
        const bitcoinTotal = bitcoinData.reduce((sum, item) => sum + (item.total || 0), 0);
        return {
            ethereum: {
                total: ethereumTotal,
                count: ethereumData.length,
                average: ethereumData.length > 0 ? ethereumTotal / ethereumData.length : 0,
            },
            bitcoin: {
                total: bitcoinTotal,
                count: bitcoinData.length,
                average: bitcoinData.length > 0 ? bitcoinTotal / bitcoinData.length : 0,
            },
            overall: {
                total: ethereumTotal + bitcoinTotal,
                count: ethereumData.length + bitcoinData.length,
            },
        };
    }
    async parseETFFlowData() {
        return await this.etfFlowService.parseAllETFFlowData();
    }
    async parseEthereumETFFlowData() {
        const data = await this.etfFlowService.parseETFFlowData('ethereum');
        await this.etfFlowService.saveETFFlowData('ethereum', data);
        return { success: true, count: data.length };
    }
    async parseBitcoinETFFlowData() {
        const data = await this.etfFlowService.parseETFFlowData('bitcoin');
        await this.etfFlowService.saveETFFlowData('bitcoin', data);
        return { success: true, count: data.length };
    }
};
exports.ETFFlowController = ETFFlowController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ETFFlowController.prototype, "getETFFlowData", null);
__decorate([
    (0, common_1.Get)('eth'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ETFFlowController.prototype, "getEthereumETFFlowData", null);
__decorate([
    (0, common_1.Get)('bitcoin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ETFFlowController.prototype, "getBitcoinETFFlowData", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ETFFlowController.prototype, "getETFFlowSummary", null);
__decorate([
    (0, common_1.Post)('parse'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ETFFlowController.prototype, "parseETFFlowData", null);
__decorate([
    (0, common_1.Post)('parse-ethereum'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ETFFlowController.prototype, "parseEthereumETFFlowData", null);
__decorate([
    (0, common_1.Post)('parse-bitcoin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ETFFlowController.prototype, "parseBitcoinETFFlowData", null);
exports.ETFFlowController = ETFFlowController = __decorate([
    (0, common_1.Controller)('etf-flow'),
    __metadata("design:paramtypes", [universal_etf_flow_service_1.UniversalETFFlowService])
], ETFFlowController);
//# sourceMappingURL=etf-flow.controller.js.map