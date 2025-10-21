import { apiClient, apiPublicClient } from './api';

export interface Vehicle {
    id: number;
    typeId: number;
    stationId: number;
    status: 'AVAILABLE' | 'RENTED' | 'DAMAGED' | 'MAINTENANCE';
    conditionNotes?: string;
    photos?: string;
    typeName?: string;
    stationName?: string;
}

export interface VehicleRequest {
    typeId: number;
    stationId: number;
    status: 'AVAILABLE' | 'RENTED' | 'DAMAGED' | 'MAINTENANCE';
    conditionNotes?: string;
    photos?: string;
}

export const vehicleService = {
    // Get all vehicles
    getAllVehicles: async () => {
        const resp = await apiClient.get('/api/vehicles');
        return resp.data?.data ?? resp.data ?? [];
    },

    // Get vehicle by ID
    getVehicleById: async (id: number) => {
        const resp = await apiClient.get(`/api/vehicles/${id}`);
        return resp.data?.data ?? resp.data;
    },

    // Get available vehicles
    getAvailableVehicles: async () => {
        const resp = await apiPublicClient.get('/api/vehicles/available');
        return resp.data?.data ?? resp.data ?? [];
    },

    // Get available vehicles by station
    getAvailableVehiclesByStation: async (stationId: number) => {
        const resp = await apiPublicClient.get(`/api/vehicles/available/station/${stationId}`);
        return resp.data?.data ?? resp.data ?? [];
    },

    // Get vehicles by station
    getVehiclesByStation: async (stationId: number) => {
        const resp = await apiClient.get(`/api/vehicles/station/${stationId}`);
        return resp.data?.data ?? resp.data ?? [];
    },

    // Get vehicles by type
    getVehiclesByType: async (typeId: number) => {
        const resp = await apiClient.get(`/api/vehicles/type/${typeId}`);
        return resp.data?.data ?? resp.data ?? [];
    },

    // Get vehicles by station and type
    getVehiclesByStationAndType: async (stationId: number, typeId: number) => {
        const resp = await apiClient.get(`/api/vehicles/station/${stationId}/type/${typeId}`);
        return resp.data?.data ?? resp.data ?? [];
    },

    // Create vehicle
    createVehicle: async (payload: VehicleRequest) => {
        const resp = await apiClient.post('/api/vehicles', payload);
        return resp.data;
    },

    // Update vehicle
    updateVehicle: async (id: number, payload: VehicleRequest) => {
        const resp = await apiClient.put(`/api/vehicles/${id}`, payload);
        return resp.data;
    },

    // Delete vehicle
    deleteVehicle: async (id: number) => {
        const resp = await apiClient.delete(`/api/vehicles/${id}`);
        return resp.data;
    }
};

export default vehicleService;
