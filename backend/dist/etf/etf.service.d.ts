import { PrismaService } from '../prisma/prisma.service';
import { CreateEtfDto } from './dto/create-etf.dto';
import { UpdateEtfDto } from './dto/update-etf.dto';
export declare class EtfService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createEtfDto: CreateEtfDto): import(".prisma/client").Prisma.Prisma__ETFClient<{
        symbol: string;
        name: string;
        description: string | null;
        assetClass: string;
        expenseRatio: number;
        aum: number | null;
        inceptionDate: Date | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        prices: {
            id: string;
            createdAt: Date;
            date: Date;
            etfId: string;
            open: number;
            high: number;
            low: number;
            close: number;
            volume: number;
        }[];
        holdings: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            etfId: string;
            ticker: string;
            weight: number;
            sector: string | null;
        }[];
    } & {
        symbol: string;
        name: string;
        description: string | null;
        assetClass: string;
        expenseRatio: number;
        aum: number | null;
        inceptionDate: Date | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ETFClient<({
        prices: {
            id: string;
            createdAt: Date;
            date: Date;
            etfId: string;
            open: number;
            high: number;
            low: number;
            close: number;
            volume: number;
        }[];
        holdings: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            etfId: string;
            ticker: string;
            weight: number;
            sector: string | null;
        }[];
    } & {
        symbol: string;
        name: string;
        description: string | null;
        assetClass: string;
        expenseRatio: number;
        aum: number | null;
        inceptionDate: Date | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findBySymbol(symbol: string): import(".prisma/client").Prisma.Prisma__ETFClient<({
        prices: {
            id: string;
            createdAt: Date;
            date: Date;
            etfId: string;
            open: number;
            high: number;
            low: number;
            close: number;
            volume: number;
        }[];
        holdings: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            etfId: string;
            ticker: string;
            weight: number;
            sector: string | null;
        }[];
    } & {
        symbol: string;
        name: string;
        description: string | null;
        assetClass: string;
        expenseRatio: number;
        aum: number | null;
        inceptionDate: Date | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateEtfDto: UpdateEtfDto): import(".prisma/client").Prisma.Prisma__ETFClient<{
        symbol: string;
        name: string;
        description: string | null;
        assetClass: string;
        expenseRatio: number;
        aum: number | null;
        inceptionDate: Date | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ETFClient<{
        symbol: string;
        name: string;
        description: string | null;
        assetClass: string;
        expenseRatio: number;
        aum: number | null;
        inceptionDate: Date | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
