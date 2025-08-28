import type { ParsingResult } from './universal-etf-flow.service';
interface IETFFlowService {
    parseAllETFFlowData(): Promise<{
        ethereum: ParsingResult;
        bitcoin: ParsingResult;
    }>;
}
export declare class ETFFlowSchedulerService {
    private readonly etfFlowService;
    private readonly logger;
    private lastParseStatus;
    constructor(etfFlowService: IETFFlowService);
    handleMorningParse(): Promise<void>;
    handleEveningParse(): Promise<void>;
    parseAllETFFlowData(): Promise<void>;
    manualParse(): Promise<void>;
    getLastParseStatus(): {
        ethereum: {
            success: boolean;
            count: number;
            timestamp: Date;
        };
        bitcoin: {
            success: boolean;
            count: number;
            timestamp: Date;
        };
    };
}
export {};
