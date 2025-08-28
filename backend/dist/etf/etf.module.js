"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EtfModule = void 0;
const common_1 = require("@nestjs/common");
const etf_service_1 = require("./etf.service");
const etf_controller_1 = require("./etf.controller");
let EtfModule = class EtfModule {
};
exports.EtfModule = EtfModule;
exports.EtfModule = EtfModule = __decorate([
    (0, common_1.Module)({
        controllers: [etf_controller_1.EtfController],
        providers: [etf_service_1.EtfService],
    })
], EtfModule);
//# sourceMappingURL=etf.module.js.map