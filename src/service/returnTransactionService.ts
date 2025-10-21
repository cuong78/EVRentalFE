import { apiClient } from './api';

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
