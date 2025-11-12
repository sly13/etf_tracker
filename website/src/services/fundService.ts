import axios from "axios";
import { API_CONFIG } from "../config/api";

// Используем API_CONFIG.BASE_URL, который уже содержит /api префикс
// Или fallback на localhost:3066/api для разработки
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || API_CONFIG.BASE_URL || "http://localhost:3066/api";

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
  btcHoldings: string | bigint;
  ethHoldings: string | bigint;
  totalAssets: string | bigint;
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
