import { PrismaService } from '../prisma/prisma.service';
export interface ETFFlowData {
    date: string;
    blackrock: number | null;
    fidelity: number | null;
    bitwise: number | null;
    twentyOneShares: number | null;
    vanEck: number | null;
    invesco: number | null;
    franklin: number | null;
    grayscale: number | null;
    grayscaleCrypto: number | null;
    total: number | null;
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
    parseETFFlowData(type: 'ethereum' | 'bitcoin'): Promise<ETFFlowData[]>;
    saveETFFlowData(type: 'ethereum' | 'bitcoin', flowData: ETFFlowData[]): Promise<void>;
    getETFFlowData(type: 'ethereum' | 'bitcoin'): Promise<ETFFlowData[]>;
    parseAllETFFlowData(): Promise<{
        ethereum: ParsingResult;
        bitcoin: ParsingResult;
    }>;
}
