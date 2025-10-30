import { apiClient } from './api';
<<<<<<< HEAD
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


=======

export interface ContractRequest {
    bookingId: string;
    vehicleId: number;
    cccd: string;
    conditionNotes?: string;
    signaturePhoto: string;
    vehiclePhoto: string;
}

export interface ContractResponse {
    id: number;
    bookingId: string;
    vehicleId: number;
    cccd: string;
    conditionNotes?: string;
    invoiceDetails?: string;
    signaturePhoto: string;
    vehiclePhoto: string;
    createdAt: string;
    updatedAt: string;
    customerName?: string;
    vehicleName?: string;
    stationName?: string;
    bookingStartDate?: string;
    bookingEndDate?: string;
}

export const contractService = {
    // Create contract
    createContract: async (payload: ContractRequest): Promise<ContractResponse> => {
        const resp = await apiClient.post('/api/contracts', payload);
        return resp.data?.data ?? resp.data;
    },

    // Get contract by booking ID
    getContractByBooking: async (bookingId: string): Promise<ContractResponse> => {
        const resp = await apiClient.get(`/api/contracts/booking/${bookingId}`);
        return resp.data?.data ?? resp.data;
    }
};

export default contractService;
>>>>>>> e20d11b0eca0826dcfba530ffe0c81341434fe9e
