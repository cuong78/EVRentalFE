import { apiClient } from './api';
import { API } from '../constants';

export type ReturnTransactionDTO = {
  id: number;
  bookingId: string;
  returnDate?: string; // ISO datetime
  additionalFees?: number;
  refundAmount?: number;
  conditionNotes?: string;
  photos?: string;
  createdAt?: string; // ISO datetime
  updatedAt?: string; // ISO datetime
  isLateReturn?: boolean;
  overdueDays?: number;
  stationId?: number;
  vehicleTypeId?: number;
  kind?: 'CANCEL' | 'RETURN';
};

export type PagedResponse<T> = {
  data: T[];
  total: number;
  page?: number;
  size?: number;
};

export const returnTransactionAdminService = {
  async getAll(params: {
    stationId?: number;
    vehicleTypeId?: number;
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
    page?: number;
    size?: number;
  }): Promise<PagedResponse<ReturnTransactionDTO>> {
    const res = await apiClient.get(`${API.ADMIN}/return-transactions`, { params });
    const payload = res.data?.data ?? res.data;
    return {
      data: (payload?.data ?? payload ?? []) as ReturnTransactionDTO[],
      total: Number(payload?.total ?? 0),
      page: payload?.page,
      size: payload?.size,
    };
  },
};
