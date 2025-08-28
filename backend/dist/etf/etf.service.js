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
exports.EtfService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EtfService = class EtfService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createEtfDto) {
        return this.prisma.eTF.create({
            data: createEtfDto,
        });
    }
    findAll() {
        return this.prisma.eTF.findMany({
            include: {
                prices: {
                    orderBy: { date: 'desc' },
                    take: 1,
                },
                holdings: true,
            },
        });
    }
    findOne(id) {
        return this.prisma.eTF.findUnique({
            where: { id },
            include: {
                prices: {
                    orderBy: { date: 'desc' },
                    take: 30,
                },
                holdings: true,
            },
        });
    }
    findBySymbol(symbol) {
        return this.prisma.eTF.findUnique({
            where: { symbol },
            include: {
                prices: {
                    orderBy: { date: 'desc' },
                    take: 30,
                },
                holdings: true,
            },
        });
    }
    update(id, updateEtfDto) {
        return this.prisma.eTF.update({
            where: { id },
            data: updateEtfDto,
        });
    }
    remove(id) {
        return this.prisma.eTF.delete({
            where: { id },
        });
    }
};
exports.EtfService = EtfService;
exports.EtfService = EtfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EtfService);
//# sourceMappingURL=etf.service.js.map