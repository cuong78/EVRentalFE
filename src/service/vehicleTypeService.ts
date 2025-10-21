import { apiClient, apiPublicClient } from './api';

export interface VehicleType {
    id: number;
    name: string;
    depositAmount: number;
    rentalRate: number;
    description?: string;
    image?: string;
}

export interface VehicleTypeRequest {
    name: string;
    depositAmount: number;
    rentalRate: number;
}

export const vehicleTypeService = {
    // Get all vehicle types (requires authentication)
    getAllVehicleTypes: async () => {
        const resp = await apiClient.get('/api/vehicle-types');
        return resp.data?.data ?? resp.data ?? [];
    },

    // Get vehicle type by ID
    getVehicleTypeById: async (id: number) => {
        const resp = await apiClient.get(`/api/vehicle-types/${id}`);
        return resp.data?.data ?? resp.data;
    },

    // Get vehicle types by station with availability check (requires authentication)
    getVehicleTypesByStation: async (stationId: number, startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) {
            // Chỉ gửi ngày YYYY-MM-DD, không có giờ phút giây
            const dateOnly = new Date(startDate).toISOString().split('T')[0];
            params.append('startDate', dateOnly);
        }
        if (endDate) {
            // Chỉ gửi ngày YYYY-MM-DD, không có giờ phút giây
            const dateOnly = new Date(endDate).toISOString().split('T')[0];
            params.append('endDate', dateOnly);
        }
        
        const url = `/api/vehicle-types/by-station/${stationId}${params.toString() ? `?${params.toString()}` : ''}`;
        const resp = await apiClient.get(url);
        return resp.data?.data ?? resp.data ?? [];
    },

    // Create vehicle type
    createVehicleType: async (payload: VehicleTypeRequest) => {
        const resp = await apiClient.post('/api/vehicle-types', payload);
        return resp.data;
    },

    // Update vehicle type
    updateVehicleType: async (id: number, payload: VehicleTypeRequest) => {
        const resp = await apiClient.put(`/api/vehicle-types/${id}`, payload);
        return resp.data;
    },

    // Delete vehicle type
    deleteVehicleType: async (id: number) => {
        const resp = await apiClient.delete(`/api/vehicle-types/${id}`);
        return resp.data;
    }
};

export default vehicleTypeService;
