"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETFFlowModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("../prisma/prisma.module");
const notification_module_1 = require("../notifications/notification.module");
const universal_etf_flow_service_1 = require("./universal-etf-flow.service");
const etf_flow_controller_1 = require("./etf-flow.controller");
const etf_scheduler_service_1 = require("./etf-scheduler.service");
let ETFFlowModule = class ETFFlowModule {
};
exports.ETFFlowModule = ETFFlowModule;
exports.ETFFlowModule = ETFFlowModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, schedule_1.ScheduleModule.forRoot(), notification_module_1.NotificationModule],
        providers: [universal_etf_flow_service_1.UniversalETFFlowService, etf_scheduler_service_1.ETFSchedulerService],
        controllers: [etf_flow_controller_1.ETFFlowController],
        exports: [universal_etf_flow_service_1.UniversalETFFlowService],
    })
], ETFFlowModule);
//# sourceMappingURL=etf-flow.module.js.map