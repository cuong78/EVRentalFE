import { apiClient } from './api';
<<<<<<< HEAD
import { API } from '../constants';

const BASE = `${API.BASE}`;

export interface CreateReturnRequest {
    bookingId: string;
    conditionNotes?: string;
    damageFee?: number;
    photos?: File[];
}

export const returnTransactionService = {
    create: async (payload: CreateReturnRequest): Promise<any> => {
        const form = new FormData();
        form.append('bookingId', payload.bookingId);
        if (payload.conditionNotes) form.append('conditionNotes', payload.conditionNotes);
        if (typeof payload.damageFee !== 'undefined') form.append('damageFee', String(payload.damageFee));
        if (payload.photos && payload.photos.length > 0) {
            for (const file of payload.photos) {
                form.append('photos', file);
            }
        }
        const res = await apiClient.post(`${BASE}/return-transactions`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }
};


=======

export interface ReturnTransactionRequest {
    bookingId: string;
    conditionNotes?: string;
    photos?: string;
    refundMethod: 'CASH' | 'TRANSFER';
    damageFee?: number;
    cleaningFee?: number;
    isLateReturn?: boolean;
}

export interface ReturnTransactionResponse {
    id: number;
    bookingId: string;
    returnDate: string;
    additionalFees: number;
    refundAmount: number;
    refundMethod: 'CASH' | 'TRANSFER';
    conditionNotes?: string;
    photos?: string;
    createdAt: string;
    updatedAt: string;
    isLateReturn: boolean;
    overdueDays: number;
    originalDeposit: number;
    refundStatus: string;
}

export const returnTransactionService = {
    // Create return transaction
    createReturnTransaction: async (payload: ReturnTransactionRequest): Promise<ReturnTransactionResponse> => {
        const resp = await apiClient.post('/api/return-transactions', payload);
        return resp.data?.data ?? resp.data;
    },

    // Get return transaction by booking ID
    getReturnTransactionByBooking: async (bookingId: string): Promise<ReturnTransactionResponse> => {
        const resp = await apiClient.get(`/api/return-transactions/booking/${bookingId}`);
        return resp.data?.data ?? resp.data;
    }
};

export default returnTransactionService;
>>>>>>> e20d11b0eca0826dcfba530ffe0c81341434fe9e
