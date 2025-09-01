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
const etf_scheduler_service_1 = require("./etf-scheduler.service");
let ETFFlowController = class ETFFlowController {
    constructor(etfFlowService, etfSchedulerService) {
        this.etfFlowService = etfFlowService;
        this.etfSchedulerService = etfSchedulerService;
    }
    async getETFFlowData() {
        const ethereumData = (await this.etfFlowService.getETFFlowData('ethereum'));
        const bitcoinData = (await this.etfFlowService.getETFFlowData('bitcoin'));
        const allData = [...ethereumData, ...bitcoinData];
        const uniqueData = allData.filter((item, index, self) => index === self.findIndex((t) => t.date === item.date));
        const sortedData = uniqueData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const filteredData = sortedData.filter((item) => item.total !== null && item.total !== 0);
        return filteredData.length > 0 ? filteredData : sortedData.slice(0, 10);
    }
    async getEthereumETFFlowData() {
        return await this.etfFlowService.getETFFlowData('ethereum');
    }
    async getBitcoinETFFlowData() {
        return await this.etfFlowService.getETFFlowData('bitcoin');
    }
    async getETFFlowSummary() {
        const ethereumData = (await this.etfFlowService.getETFFlowData('ethereum'));
        const bitcoinData = (await this.etfFlowService.getETFFlowData('bitcoin'));
        const latestEthereum = ethereumData[0];
        const latestBitcoin = bitcoinData[0];
        let ethereumTotal = latestEthereum?.total || 0;
        let bitcoinTotal = latestBitcoin?.total || 0;
        if (ethereumTotal === 0 && ethereumData.length > 0) {
            ethereumTotal = ethereumData
                .slice(0, Math.min(7, ethereumData.length))
                .reduce((sum, item) => sum + (item.total || 0), 0);
        }
        if (bitcoinTotal === 0 && bitcoinData.length > 0) {
            bitcoinTotal = bitcoinData
                .slice(0, Math.min(7, bitcoinData.length))
                .reduce((sum, item) => sum + (item.total || 0), 0);
        }
        const overallTotal = ethereumTotal + bitcoinTotal;
        return {
            ethereum: {
                total: ethereumTotal,
                count: ethereumData.length,
                average: ethereumData.length > 0
                    ? ethereumData.reduce((sum, item) => sum + (item.total || 0), 0) /
                        ethereumData.length
                    : 0,
                latestDate: latestEthereum?.date || null,
            },
            bitcoin: {
                total: bitcoinTotal,
                count: bitcoinData.length,
                average: bitcoinData.length > 0
                    ? bitcoinData.reduce((sum, item) => sum + (item.total || 0), 0) /
                        bitcoinData.length
                    : 0,
                latestDate: latestBitcoin?.date || null,
            },
            overall: {
                total: overallTotal,
                count: ethereumData.length + bitcoinData.length,
                latestDate: latestEthereum?.date || latestBitcoin?.date || null,
            },
        };
    }
    async getFundHoldings() {
        const ethereumData = (await this.etfFlowService.getETFFlowData('ethereum'));
        const bitcoinData = (await this.etfFlowService.getETFFlowData('bitcoin'));
        const fundHoldings = {
            blackrock: { eth: 0, btc: 0 },
            fidelity: { eth: 0, btc: 0 },
            bitwise: { eth: 0, btc: 0 },
            twentyOneShares: { eth: 0, btc: 0 },
            vanEck: { eth: 0, btc: 0 },
            invesco: { eth: 0, btc: 0 },
            franklin: { eth: 0, btc: 0 },
            grayscale: { eth: 0, btc: 0 },
            grayscaleCrypto: { eth: 0, btc: 0 },
        };
        const bitcoinFundHoldings = {
            valkyrie: { eth: 0, btc: 0 },
            wisdomTree: { eth: 0, btc: 0 },
        };
        ethereumData.forEach((item) => {
            fundHoldings.blackrock.eth += item.blackrock || 0;
            fundHoldings.fidelity.eth += item.fidelity || 0;
            fundHoldings.bitwise.eth += item.bitwise || 0;
            fundHoldings.twentyOneShares.eth += item.twentyOneShares || 0;
            fundHoldings.vanEck.eth += item.vanEck || 0;
            fundHoldings.invesco.eth += item.invesco || 0;
            fundHoldings.franklin.eth += item.franklin || 0;
            fundHoldings.grayscale.eth += item.grayscale || 0;
            fundHoldings.grayscaleCrypto.eth += item.grayscaleCrypto || 0;
        });
        bitcoinData.forEach((item) => {
            fundHoldings.blackrock.btc += item.blackrock || 0;
            fundHoldings.fidelity.btc += item.fidelity || 0;
            fundHoldings.bitwise.btc += item.bitwise || 0;
            fundHoldings.twentyOneShares.btc += item.twentyOneShares || 0;
            fundHoldings.vanEck.btc += item.vanEck || 0;
            fundHoldings.invesco.btc += item.invesco || 0;
            fundHoldings.franklin.btc += item.franklin || 0;
            fundHoldings.grayscale.btc += item.grayscale || 0;
            fundHoldings.grayscaleCrypto.btc += item.grayscaleCrypto || 0;
            const btcItem = item;
            bitcoinFundHoldings.valkyrie.btc += btcItem.valkyrie || 0;
            bitcoinFundHoldings.wisdomTree.btc += btcItem.wisdomTree || 0;
        });
        const allFundHoldings = { ...fundHoldings, ...bitcoinFundHoldings };
        Object.keys(allFundHoldings).forEach((fund) => {
            allFundHoldings[fund].eth =
                Math.round(allFundHoldings[fund].eth * 100) / 100;
            allFundHoldings[fund].btc =
                Math.round(allFundHoldings[fund].btc * 100) / 100;
        });
        return {
            fundHoldings: allFundHoldings,
            summary: {
                totalEth: Math.round(Object.values(allFundHoldings).reduce((sum, fund) => sum + fund.eth, 0) * 100) / 100,
                totalBtc: Math.round(Object.values(allFundHoldings).reduce((sum, fund) => sum + fund.btc, 0) * 100) / 100,
                totalHoldings: Math.round(Object.values(allFundHoldings).reduce((sum, fund) => sum + fund.eth + fund.btc, 0) * 100) / 100,
                fundCount: Object.keys(allFundHoldings).length,
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
    async updateETFDataNow() {
        await this.etfSchedulerService.manualUpdate();
        return {
            success: true,
            message: 'ETF данные обновляются в фоновом режиме',
            timestamp: new Date().toISOString(),
        };
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
    (0, common_1.Get)('holdings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ETFFlowController.prototype, "getFundHoldings", null);
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
__decorate([
    (0, common_1.Post)('update-now'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ETFFlowController.prototype, "updateETFDataNow", null);
exports.ETFFlowController = ETFFlowController = __decorate([
    (0, common_1.Controller)('etf-flow'),
    __metadata("design:paramtypes", [universal_etf_flow_service_1.UniversalETFFlowService,
        etf_scheduler_service_1.ETFSchedulerService])
], ETFFlowController);
//# sourceMappingURL=etf-flow.controller.js.map