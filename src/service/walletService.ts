import { apiClient, apiPublicClient } from './api';
import { API } from '../constants';

const BASE = `${API.BASE}`;

const pickUrl = (resp: any): string | undefined => {
    const data = resp?.data ?? resp;
    if (!data) return undefined;
    if (typeof data === 'string') return data;
    return data.vnpayUrl || data.url || data.redirectUrl || data.paymentUrl;
};

export const walletService = {
    // POST /wallet/topups?amountVnd=...
    createTopup: async (amountVnd: number): Promise<string> => {
        const res = await apiClient.post(`${BASE}/wallet/topups`, null, { params: { amountVnd } });
        const billId = res?.data?.billId || res?.data?.data?.billId || res?.data;
        if (!billId) throw new Error('Không lấy được billId');
        return String(billId);
    },

    // POST /wallet/topups/{billId}/vnpay-url
    getTopupVnpayUrl: async (billId: string): Promise<string> => {
        const res = await apiClient.post(`${BASE}/wallet/topups/${encodeURIComponent(billId)}/vnpay-url`);
        const url = pickUrl(res?.data) || pickUrl(res);
        if (!url) throw new Error('Không lấy được đường dẫn VNPay');
        return url;
    },
    // GET /wallet/topups/vnpay-return?...
    topupReturn: async (params: Record<string, string>): Promise<any> => {
        // Try with token first (some setups tie topup to current user), then fallback to public
        try {
            const res = await apiClient.get(`${BASE}/wallet/topups/vnpay-return`, { params });
            return res.data;
        } catch {
            const res = await apiPublicClient.get(`${BASE}/wallet/topups/vnpay-return`, { params });
            return res.data;
        }
    },
};


