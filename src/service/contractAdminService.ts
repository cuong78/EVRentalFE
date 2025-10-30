import { apiClient } from './api';
import { API } from '../constants';

export type ContractDTO = {
  id: number;
  bookingId: string;
  vehicleId: number;
  vehicleName?: string;
  stationId?: number;
  vehicleTypeId?: number;
  conditionNotes?: string;
  createdAt?: string; // ISO datetime
};

export type PagedResponse<T> = {
  data: T[];
  total: number;
  page?: number;
  size?: number;
};

export const contractAdminService = {
  async getAll(params: {
    stationId?: number;
    vehicleTypeId?: number;
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
    page?: number;
    size?: number;
  }): Promise<PagedResponse<ContractDTO>> {
    const res = await apiClient.get(`${API.ADMIN}/contracts`, { params });
    const payload = res.data?.data ?? res.data;
    return {
      data: (payload?.data ?? payload ?? []) as ContractDTO[],
      total: Number(payload?.total ?? 0),
      page: payload?.page,
      size: payload?.size,
    };
  },
};
