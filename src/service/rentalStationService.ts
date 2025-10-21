import { apiClient, apiPublicClient } from './api';

export interface RentalStation {
    id: number;
    city: string;
    address: string;
    adminId?: number;
    adminName?: string;
    availableVehicles?: number;
    totalVehicles?: number;
}

export interface RentalStationRequest {
    city: string;
    address: string;
    adminId?: number;
}

export const rentalStationService = {
    // Get all rental stations (requires authentication)
    getAllRentalStations: async () => {
        const resp = await apiClient.get('/api/rental-stations');
        return resp.data?.data ?? resp.data ?? [];
    },

    // Get rental station by ID
    getRentalStationById: async (id: number) => {
        const resp = await apiClient.get(`/api/rental-stations/${id}`);
        return resp.data?.data ?? resp.data;
    },

    // Get rental stations by city (requires authentication)
    getRentalStationsByCity: async (city: string) => {
        const resp = await apiClient.get(`/api/rental-stations/city/${city}`);
        return resp.data?.data ?? resp.data ?? [];
    },

    // Get stations without admin
    getStationsWithoutAdmin: async () => {
        const resp = await apiClient.get('/api/rental-stations/without-admin');
        return resp.data?.data ?? resp.data ?? [];
    },

    // Create rental station
    createRentalStation: async (payload: RentalStationRequest) => {
        const resp = await apiClient.post('/api/rental-stations', payload);
        return resp.data;
    },

    // Update rental station
    updateRentalStation: async (id: number, payload: RentalStationRequest) => {
        const resp = await apiClient.put(`/api/rental-stations/${id}`, payload);
        return resp.data;
    },

    // Delete rental station
    deleteRentalStation: async (id: number) => {
        const resp = await apiClient.delete(`/api/rental-stations/${id}`);
        return resp.data;
    },

    // Assign admin to station
    assignAdminToStation: async (stationId: number, adminId: number) => {
        const resp = await apiClient.post(`/api/rental-stations/${stationId}/assign-admin/${adminId}`);
        return resp.data;
    },

    // Remove admin from station
    removeAdminFromStation: async (stationId: number) => {
        const resp = await apiClient.post(`/api/rental-stations/${stationId}/remove-admin`);
        return resp.data;
    }
};

export default rentalStationService;
