import { API } from "../constants";
import { apiClient } from "./api";
import type { ApiResponses } from "../types/api-response";
import type { 
  ProductPerformance, 
  ProductPerformanceFilter,
  ProductPerformanceResponse 
} from "../types/productPerformance";

const API_BASE_PRODUCT_PERFORMANCE = `${API.ADMIN}/product-performance`;

export const productPerformanceService = {
  getProductPerformance: async (
    filter?: ProductPerformanceFilter
  ): Promise<ApiResponses<ProductPerformance[]>> => {
    try {
      const params = new URLSearchParams();
      
      if (filter?.fromDate) params.append("fromDate", filter.fromDate);
      if (filter?.toDate) params.append("toDate", filter.toDate);
      if (filter?.category) params.append("category", filter.category);
      if (filter?.sortBy) params.append("sortBy", filter.sortBy);
      if (filter?.order) params.append("order", filter.order);
      
      const url = `${API_BASE_PRODUCT_PERFORMANCE}${params.toString() ? `?${params.toString()}` : ""}`;
      
      const response = await apiClient.get<ApiResponses<ProductPerformance[]>>(url);
      return response.data;
    } catch (error) {
      return { 
        code: 500, 
        message: "Failed to fetch product performance data", 
        data: [] 
      };
    }
  },

  getProductPerformanceWithStats: async (
    filter?: ProductPerformanceFilter
  ): Promise<ApiResponses<ProductPerformanceResponse>> => {
    try {
      const params = new URLSearchParams();
      
      if (filter?.fromDate) params.append("fromDate", filter.fromDate);
      if (filter?.toDate) params.append("toDate", filter.toDate);
      if (filter?.category) params.append("category", filter.category);
      if (filter?.sortBy) params.append("sortBy", filter.sortBy);
      if (filter?.order) params.append("order", filter.order);
      
      const response = await apiClient.get<ApiResponses<ProductPerformanceResponse>>(
        `${API_BASE_PRODUCT_PERFORMANCE}/with-stats${params.toString() ? `?${params.toString()}` : ""}`
      );
      return response.data;
    } catch (error) {
      return { 
        code: 500, 
        message: "Failed to fetch product performance data with stats", 
        data: { data: [] } 
      };
    }
  },

  exportProductPerformance: async (
    filter?: ProductPerformanceFilter,
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> => {
    try {
      const params = new URLSearchParams();
      
      if (filter?.fromDate) params.append("fromDate", filter.fromDate);
      if (filter?.toDate) params.append("toDate", filter.toDate);
      if (filter?.category) params.append("category", filter.category);
      if (filter?.sortBy) params.append("sortBy", filter.sortBy);
      if (filter?.order) params.append("order", filter.order);
      params.append("format", format);
      
      const response = await apiClient.get(
        `${API_BASE_PRODUCT_PERFORMANCE}/export${params.toString() ? `?${params.toString()}` : ""}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to export product performance data");
    }
  }
}; 