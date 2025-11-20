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

export interface SolFlowData {
  date: string;
  bitwise: number; // BSOL
  vanEck: number; // VSOL
  fidelity: number; // FSOL
  twentyOneShares: number; // TSOL
  grayscale: number; // GSOL
  total: number;
}

export interface ParsingResult {
  success: boolean;
  count: number;
  message?: string;
  error?: string;
}
