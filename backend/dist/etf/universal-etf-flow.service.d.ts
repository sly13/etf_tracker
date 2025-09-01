import { PrismaService } from '../prisma/prisma.service';
export interface ETFFlowData {
    date: string;
    blackrock: number;
    fidelity: number;
    bitwise: number;
    twentyOneShares: number;
    vanEck: number;
    invesco: number;
    franklin: number;
    grayscale: number;
    grayscaleCrypto: number;
    total: number;
}
export interface BTCFlowData extends ETFFlowData {
    valkyrie: number;
    wisdomTree: number;
    grayscaleBtc: number;
}
export interface ParsingResult {
    success: boolean;
    count: number;
    message?: string;
    error?: string;
}
export declare class UniversalETFFlowService {
    private readonly prisma;
    private readonly logger;
    private readonly urls;
    constructor(prisma: PrismaService);
    parseETFFlowData(type: 'ethereum' | 'bitcoin'): Promise<ETFFlowData[] | BTCFlowData[]>;
    saveETFFlowData(type: 'ethereum' | 'bitcoin', flowData: ETFFlowData[] | BTCFlowData[]): Promise<void>;
    getETFFlowData(type: 'ethereum' | 'bitcoin'): Promise<ETFFlowData[] | BTCFlowData[]>;
    parseAllETFFlowData(): Promise<{
        ethereum: ParsingResult;
        bitcoin: ParsingResult;
    }>;
}
