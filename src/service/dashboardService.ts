import { API } from "../constants";
import { apiClient } from "./api";
import type { ApiResponses } from "../types/api-response";
import type { RevenueReportDTO } from "../types/dashboard";

const API_BASE_DASHBOARD = `${API.ADMIN}/dashboard`;

export const dashboardService = {
  getRevenueByProduct: async (
    from?: string,
    to?: string
  ): Promise<ApiResponses<RevenueReportDTO[]>> => {
    try {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
    
      
      const response = await apiClient.get<ApiResponses<RevenueReportDTO[]>>(
        `${API_BASE_DASHBOARD}/revenues/by-product${params.toString() ? `?${params.toString()}` : ""}`
      );
      return response.data;
    } catch (error) {
      return { code: 500, message: "Failed to fetch revenue by product", data: [] };
    }
  },
}; 