import { apiClient } from './api';
<<<<<<< HEAD
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


=======

export const paymentService = {
    // Create VNPay payment URL
    createVnPayUrl: async (bookingId: string) => {
        // Match backend config exactly (without hash)
        const returnUrl = `http://localhost:3000/payment/vnpay-return`;
        console.log('Setting VNPay return URL to:', returnUrl);
        
        // Store booking info for fallback
        localStorage.setItem('pendingPayment', JSON.stringify({
            bookingId: bookingId,
            timestamp: Date.now()
        }));
        
        // Try different ways to send return URL
        try {
            // Method 1: Query parameter
            const resp = await apiClient.post(`/api/payments/vnpay/${bookingId}?returnUrl=${encodeURIComponent(returnUrl)}`);
            return resp.data;
        } catch (error) {
            console.log('Query param method failed, trying request body');
            // Method 2: Request body
            const resp = await apiClient.post(`/api/payments/vnpay/${bookingId}`, {
                returnUrl: returnUrl
            });
            return resp.data;
        }
    },

    // Handle VNPay return callback
    handleVNPayReturn: async (params: Record<string, string>) => {
        // Backend expects params as object in request body
        const resp = await apiClient.get('/api/payments/vnpay-return', { params });
        return resp.data;
    },

    // Create return transaction (refund)
    createReturnTransaction: async (bookingId: string, refundMethod: 'ONLINE' | 'DIRECT', reason?: string) => {
        const resp = await apiClient.post(`/api/return-transactions`, {
            bookingId: bookingId,
            refundMethod: refundMethod,
            reason: reason || 'Customer cancellation'
        });
        return resp.data;
    },

    // Get return transaction by booking ID
    getReturnTransaction: async (bookingId: string) => {
        const resp = await apiClient.get(`/api/return-transactions/booking/${bookingId}`);
        return resp.data;
    },

    // Legacy refund methods (deprecated)
    refundPayment: async (bookingId: string, reason?: string) => {
        // Use new return transaction API
        return await paymentService.createReturnTransaction(bookingId, 'ONLINE', reason);
    },

    getRefundStatus: async (bookingId: string) => {
        // Use new return transaction API
        return await paymentService.getReturnTransaction(bookingId);
    }
};

export default paymentService;
>>>>>>> e20d11b0eca0826dcfba530ffe0c81341434fe9e
