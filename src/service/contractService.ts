import { apiClient } from './api';

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
