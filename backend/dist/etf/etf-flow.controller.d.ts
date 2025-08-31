import { UniversalETFFlowService, ETFFlowData, BTCFlowData } from './universal-etf-flow.service';
import { ETFSchedulerService } from './etf-scheduler.service';
export declare class ETFFlowController {
    private readonly etfFlowService;
    private readonly etfSchedulerService;
    constructor(etfFlowService: UniversalETFFlowService, etfSchedulerService: ETFSchedulerService);
    getETFFlowData(): Promise<ETFFlowData[]>;
    getEthereumETFFlowData(): Promise<ETFFlowData[] | BTCFlowData[]>;
    getBitcoinETFFlowData(): Promise<ETFFlowData[] | BTCFlowData[]>;
    getETFFlowSummary(): Promise<{
        ethereum: {
            total: number;
            count: number;
            average: number;
            latestDate: string | null;
        };
        bitcoin: {
            total: number;
            count: number;
            average: number;
            latestDate: string | null;
        };
        overall: {
            total: number;
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
