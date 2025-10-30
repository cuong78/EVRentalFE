import { apiClient } from './api';
import { API } from '../constants';

const BASE = `${API.BASE}`;

export interface PagedResponse<T> {
  data: T[];
  total: number;
}

export interface PaymentReportItem {
  id: number;
  bookingId: string;
  stationId: number;
  stationName?: string;
  typeId: number;
  typeName?: string;
  userPhone?: string;
  amount: number;
  method: 'VNPAY' | 'WALLET';
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  type: 'DEPOSIT' | 'REFUND';
  paymentDate?: string; // date-time
}

export interface ContractReportItem {
  id: number;
  bookingId: string;
  stationId: number;
  stationName?: string;
  typeId: number;
  typeName?: string;
  vehicleId: number;
  conditionNotes?: string;
  createdAt?: string; // date-time
}

export type ReturnKind = 'RETURN' | 'CANCEL';

export interface ReturnReportItem {
  kind: ReturnKind;
  bookingId: string;
  stationId: number;
  stationName?: string;
  typeId: number;
  typeName?: string;
  // RETURN
  returnId?: number;
  returnDate?: string; // date-time
  refundAmount?: number;
  additionalFees?: number;
  conditionNotes?: string;
  // CANCEL
  cancelledAt?: string; // date-time
  refundPercentage?: number;
}

export const reportService = {
  // GET /api/reports/payments?stationId=&typeId=&startDate=&endDate=&page=&size=
  getPayments: async (params: { stationId?: number; typeId?: number; startDate?: string; endDate?: string; page?: number; size?: number } = {}): Promise<PagedResponse<PaymentReportItem>> => {
    const res = await apiClient.get(`${BASE}/reports/payments`, { params });
    const payload = res.data || {};
    const data = (payload.data ?? payload) as any;
    if (Array.isArray(data)) return { data, total: data.length };
    return { data: data.data ?? data.items ?? [], total: data.total ?? 0 };
  },

  // GET /api/reports/contracts?stationId=&typeId=&startDate=&endDate=&page=&size=
  getContracts: async (params: { stationId?: number; typeId?: number; startDate?: string; endDate?: string; page?: number; size?: number } = {}): Promise<PagedResponse<ContractReportItem>> => {
    const res = await apiClient.get(`${BASE}/reports/contracts`, { params });
    const payload = res.data || {};
    const data = (payload.data ?? payload) as any;
    if (Array.isArray(data)) return { data, total: data.length };
    return { data: data.data ?? data.items ?? [], total: data.total ?? 0 };
  },

  // GET /api/reports/returns?stationId=&typeId=&startDate=&endDate=&includeCanceled=true&page=&size=
  getReturns: async (params: { stationId?: number; typeId?: number; startDate?: string; endDate?: string; includeCanceled?: boolean; page?: number; size?: number } = {}): Promise<PagedResponse<ReturnReportItem>> => {
    const res = await apiClient.get(`${BASE}/reports/returns`, { params });
    const payload = res.data || {};
    const data = (payload.data ?? payload) as any;
    if (Array.isArray(data)) return { data, total: data.length };
    return { data: data.data ?? data.items ?? [], total: data.total ?? 0 };
  },
};
