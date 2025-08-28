import { UniversalETFFlowService } from './universal-etf-flow.service';
export declare class ETFFlowController {
    private readonly etfFlowService;
    constructor(etfFlowService: UniversalETFFlowService);
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
}
