export interface CEFIIndexData {
  date: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface CEFIIndexResponse {
  index: string;
  current: CEFIIndexData;
  history: CEFIIndexData[];
  metadata: {
    baseValue: number;
    smoothingFactor: number;
    windowSize: number;
  };
}

export interface BPFData {
  date: string;
  percentage: number;
  positiveFunds: number;
  totalFunds: number;
}

export interface FundFlowData {
  fundName: string;
  netFlow: number;
  aum: number;
  weight: number;
}

export interface AssetFlowData {
  date: string;
  asset: 'BTC' | 'ETH' | 'SOL';
  totalFlow: number;
  normalizedFlow: number;
  smoothedFlow: number;
  funds: FundFlowData[];
}

export interface ChartDataPoint {
  date: string;
  indexValue: number;
  btcPrice: number;
  btcVolume: number;
  flows?: {
    total: number;
    funds: Record<string, number>;
  };
}

export interface IndexChartResponse {
  index: string;
  data: ChartDataPoint[];
  current: {
    indexValue: number;
    btcPrice: number;
    btcVolume: number;
  };
}


