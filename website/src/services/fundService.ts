import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface FundDetail {
  id: number;
  fundKey: string;
  name: string;
  description?: string;
  logoUrl?: string;
  ticker?: string;
  fundType?: string;
  feePercentage?: number;
  launchDate?: string;
  status?: string;
  btcHoldings: bigint;
  ethHoldings: bigint;
  totalAssets: bigint;
  createdAt: string;
  updatedAt: string;
}

export const fundService = {
  async getAllFunds(): Promise<FundDetail[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/funds`);
      return response.data;
    } catch (error) {
      console.error("Error fetching funds:", error);
      throw error;
    }
  },

  async getFundDetails(
    fundKey: string,
    language?: string
  ): Promise<FundDetail> {
    try {
      const params = language ? { lang: language } : {};
      const response = await axios.get(`${API_BASE_URL}/funds/${fundKey}`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching fund details for ${fundKey}:`, error);
      throw error;
    }
  },
};
