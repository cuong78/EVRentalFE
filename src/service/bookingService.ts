import { apiClient } from './api';
import { API } from '../constants';

export interface BookingRequest {
    stationId: number;
    typeId: number;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
}

export interface Booking {
    id: string;
    userId: number;
    stationId: number;
    typeId: number;
    startDate: string;
    endDate: string;
    totalPayment: number;
    status: string; // PENDING | CONFIRMED | ACTIVE | CANCELLED | ...
    paymentMethod?: string | null;
    paymentExpiryTime?: string | null;
    createdAt?: string;
    updatedAt?: string;
    rentalDays?: number | null;
    isPaymentExpired?: boolean | null;
    canCancel?: boolean | null;
    totalPaid?: number | null;
    isFullyPaid?: boolean | null;
}

const BASE = `${API.BASE}`;

export const bookingService = {
    create: async (payload: BookingRequest): Promise<Booking> => {
        const response = await apiClient.post(`${BASE}/bookings`, payload);
        return response.data as Booking;
    },

    getById: async (id: string | number): Promise<Booking> => {
        const response = await apiClient.get(`${BASE}/bookings/${id}`);
        return response.data as Booking;
    },

    getByUser: async (userId: number): Promise<Booking[]> => {
        const response = await apiClient.get(`${BASE}/bookings/user/${userId}`);
        return response.data as Booking[];
    },

    getConfirmedByPhone: async (phone: string): Promise<Booking[]> => {
        const response = await apiClient.get(`${BASE}/bookings/phone/${encodeURIComponent(phone)}/confirmed`);
        return response.data as Booking[];
    },

    getActiveByPhone: async (phone: string): Promise<Booking[]> => {
        const response = await apiClient.get(`${BASE}/bookings/phone/${encodeURIComponent(phone)}/active`);
        return response.data as Booking[];
    },
};


