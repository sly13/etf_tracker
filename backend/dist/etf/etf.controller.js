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
const create_etf_dto_1 = require("./dto/create-etf.dto");
const update_etf_dto_1 = require("./dto/update-etf.dto");
let EtfController = class EtfController {
    constructor(etfService) {
        this.etfService = etfService;
    }
    create(createEtfDto) {
        return this.etfService.create(createEtfDto);
    }
    findAll() {
        return this.etfService.findAll();
    }
    findOne(id) {
        return this.etfService.findOne(id);
    }
    findBySymbol(symbol) {
        return this.etfService.findBySymbol(symbol);
    }
    update(id, updateEtfDto) {
        return this.etfService.update(id, updateEtfDto);
    }
    remove(id) {
        return this.etfService.remove(id);
    }
};
exports.EtfController = EtfController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_etf_dto_1.CreateEtfDto]),
    __metadata("design:returntype", void 0)
], EtfController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EtfController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EtfController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('symbol/:symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EtfController.prototype, "findBySymbol", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_etf_dto_1.UpdateEtfDto]),
    __metadata("design:returntype", void 0)
], EtfController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EtfController.prototype, "remove", null);
exports.EtfController = EtfController = __decorate([
    (0, common_1.Controller)('etf'),
    __metadata("design:paramtypes", [etf_service_1.EtfService])
], EtfController);
//# sourceMappingURL=etf.controller.js.map