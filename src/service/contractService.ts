import { apiClient } from './api';
import { API } from '../constants';

const BASE = `${API.BASE}`;

export interface CreateContractRequest {
    bookingId: string;
    vehicleId: number;
    conditionNotes: string;
}

export interface Contract {
    id: number;
    bookingId: string;
    vehicleId: number;
    documentId?: number;
    conditionNotes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const contractService = {
    create: async (payload: CreateContractRequest): Promise<Contract> => {
        const res = await apiClient.post(`${BASE}/contracts`, payload);
        return res.data as Contract;
    },

    getByBookingId: async (bookingId: string): Promise<Contract> => {
        const res = await apiClient.get(`${BASE}/contracts/booking/${encodeURIComponent(bookingId)}`);
        return res.data as Contract;
    },
};


