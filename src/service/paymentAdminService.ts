import { apiClient } from './api';
import { API } from '../constants';

export type PaymentDTO = {
  id: number;
  bookingId?: string;
  method?: 'VNPAY' | 'WALLET';
  type?: 'DEPOSIT' | 'REFUND';
  status?: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  amount?: number;
  transactionId?: string;
  description?: string;
  paymentDate?: string; // ISO
  createdAt?: string; // ISO
  stationId?: number;
  vehicleTypeId?: number;
};

export type PagedResponse<T> = {
  data: T[];
  total: number;
  page?: number;
  size?: number;
};

export const paymentAdminService = {
  async getAll(params: {
    stationId?: number;
    vehicleTypeId?: number;
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
    page?: number;
    size?: number;
  }): Promise<PagedResponse<PaymentDTO>> {
    const res = await apiClient.get(`${API.ADMIN}/payments`, { params });
    const payload = res.data?.data ?? res.data;
    return {
      data: (payload?.data ?? payload ?? []) as PaymentDTO[],
      total: Number(payload?.total ?? 0),
      page: payload?.page,
      size: payload?.size,
    };
  },
};
