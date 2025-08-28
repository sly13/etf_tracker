import { UniversalETFFlowService } from './universal-etf-flow.service';
import { ETFSchedulerService } from './etf-scheduler.service';
export declare class ETFFlowController {
    private readonly etfFlowService;
    private readonly etfSchedulerService;
    constructor(etfFlowService: UniversalETFFlowService, etfSchedulerService: ETFSchedulerService);
    getETFFlowData(): Promise<import("./universal-etf-flow.service").ETFFlowData[]>;
    getEthereumETFFlowData(): Promise<import("./universal-etf-flow.service").ETFFlowData[]>;
    getBitcoinETFFlowData(): Promise<import("./universal-etf-flow.service").ETFFlowData[]>;
    getETFFlowSummary(): Promise<{
        ethereum: {
            total: number;
            count: number;
            average: number;
        };
        bitcoin: {
            total: number;
            count: number;
            average: number;
        };
        overall: {
            total: number;
            count: number;
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
