import { apiClient } from './api';
import { API } from '../constants';

const BASE = `${API.BASE}`;

export interface PaymentResponse<T = any> {
    statusCode?: number;
    message?: string;
    data?: T;
}

const extractUrl = (resp: any): string | undefined => {
    if (!resp) return undefined;
    const data = resp.data ?? resp.url ?? resp.redirectUrl ?? resp.paymentUrl ?? resp;
    if (typeof data === 'string') return data;
    if (typeof data?.data === 'string') return data.data;
    if (typeof data?.url === 'string') return data.url;
    if (typeof data?.redirectUrl === 'string') return data.redirectUrl;
    if (typeof data?.paymentUrl === 'string') return data.paymentUrl;
    if (typeof data?.vnpayUrl === 'string') return data.vnpayUrl;
    return undefined;
};

export const paymentService = {
    payWithWallet: async (bookingId: string): Promise<PaymentResponse> => {
        const response = await apiClient.post(`${BASE}/payments/wallet/${encodeURIComponent(bookingId)}`);
        return response.data as PaymentResponse;
    },

    payWithVNPay: async (bookingId: string): Promise<string | undefined> => {
        const response = await apiClient.post(`${BASE}/payments/vnpay/${encodeURIComponent(bookingId)}`);
        // Try multiple shapes to find URL
        return extractUrl(response.data) || extractUrl(response);
    },

    vnpayReturn: async (params: Record<string, string>): Promise<PaymentResponse> => {
        const response = await apiClient.get(`${BASE}/payments/vnpay-return`, { params });
        return response.data as PaymentResponse;
    }
};


