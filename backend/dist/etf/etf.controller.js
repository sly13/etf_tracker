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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EtfController = void 0;
const common_1 = require("@nestjs/common");
const etf_service_1 = require("./etf.service");
let EtfController = class EtfController {
    constructor(etfService) {
        this.etfService = etfService;
    }
    findAll() {
        return this.etfService.findAll();
    }
    findAllBitcoin() {
        return this.etfService.findAllBitcoin();
    }
    findOne(id) {
        return this.etfService.findOne(id);
    }
    findOneBitcoin(id) {
        return this.etfService.findOneBitcoin(id);
    }
};
exports.EtfController = EtfController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EtfController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('bitcoin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EtfController.prototype, "findAllBitcoin", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EtfController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('bitcoin/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EtfController.prototype, "findOneBitcoin", null);
exports.EtfController = EtfController = __decorate([
    (0, common_1.Controller)('etf'),
    __metadata("design:paramtypes", [etf_service_1.EtfService])
], EtfController);
//# sourceMappingURL=etf.controller.js.map