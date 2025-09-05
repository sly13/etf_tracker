import { UniversalETFFlowService, ETFFlowData, BTCFlowData } from './universal-etf-flow.service';
import { ETFSchedulerService } from './etf-scheduler.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ETFFlowController {
    private readonly etfFlowService;
    private readonly etfSchedulerService;
    private readonly prisma;
    constructor(etfFlowService: UniversalETFFlowService, etfSchedulerService: ETFSchedulerService, prisma: PrismaService);
    getETFFlowData(): Promise<ETFFlowData[]>;
    getEthereumETFFlowData(): Promise<ETFFlowData[] | BTCFlowData[]>;
    getBitcoinETFFlowData(): Promise<ETFFlowData[] | BTCFlowData[]>;
    getDailyETFFlowData(date: string): Promise<{
        date: string;
        ethereum: {
            blackrock: number;
            fidelity: number;
            bitwise: number;
            twentyOneShares: number;
            vanEck: number;
            invesco: number;
            franklin: number;
            grayscale: number;
            grayscaleEth: number;
            total: number;
        } | null;
        bitcoin: {
            blackrock: number;
            fidelity: number;
            bitwise: number;
            twentyOneShares: number;
            vanEck: number;
            invesco: number;
            franklin: number;
            grayscale: number;
            grayscaleBtc: number;
            valkyrie: number;
            wisdomTree: number;
            total: number;
        } | null;
    }>;
    getETFFlowSummary(): Promise<{
        ethereum: {
            total: number;
            totalAssets: number;
            count: number;
            average: number;
            latestDate: string | null;
        };
        bitcoin: {
            total: number;
            totalAssets: number;
            count: number;
            average: number;
            latestDate: string | null;
        };
        overall: {
            total: number;
            totalAssets: number;
            count: number;
            latestDate: string | null;
        };
    }>;
    getFundHoldings(): Promise<{
        fundHoldings: {
            [x: string]: {
                eth: number;
                btc: number;
            } | {
                eth: number;
                btc: number;
            };
        };
        summary: {
            totalEth: number;
            totalBtc: number;
            totalHoldings: number;
            fundCount: number;
        };
    }>;
    parseETFFlowData(): Promise<{
        ethereum: import("./universal-etf-flow.service").ParsingResult;
        bitcoin: import("./universal-etf-flow.service").ParsingResult;
    }>;
    parseEthereumETFFlowData(): Promise<{
        success: boolean;
        count: number;
    }>;
    parseBitcoinETFFlowData(): Promise<{
        success: boolean;
        count: number;
    }>;
    updateETFDataNow(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
}
