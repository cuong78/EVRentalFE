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
import { apiClient } from "./api";
import { API } from "../constants";

const API_BASE = `${API.BASE}`;

export interface Station {
	id: number;
	address: string;
	city: string;
}

export interface VehicleSearchParams {
	stationId: number;
	startDate: string;
	endDate: string;
}

export interface VehicleType {
	typeId: number;
	typeName: string;
	depositAmount: number;
	rentalRate: number;
	totalVehicles: number;
	availableCount: number;
	availableVehicles: Vehicle[];
}

export interface Vehicle {
	id: number;
	type: {
		id: number;
		name: string;
		depositAmount: number;
		rentalRate: number;
	};
	station: {
		id: number;
		city: string;
		address: string;
	};
	photos?: string;
}

export interface VehicleSearchResponse {
	statusCode: number;
	message: string;
	data: {
		stationId: number;
		stationName: string;
		searchStartDate: string;
		searchEndDate: string;
		vehicleTypes: VehicleType[];
	};
}

export const vehicleService = {
	// Get all stations
	getStations: async (): Promise<Station[]> => {
		try {
			const response = await apiClient.get(`${API_BASE}/rental-stations`);
			// API may return either an array directly or a wrapped object { statusCode, message, data: [...] }
			const resp = response.data;
			if (Array.isArray(resp)) {
				return resp as Station[];
			}
			if (resp && Array.isArray(resp.data)) {
				return resp.data as Station[];
			}
			// Some endpoints might wrap twice or return data in a different field — try common fallbacks
			if (resp && resp.data && Array.isArray(resp.data.data)) {
				return resp.data.data as Station[];
			}
			console.warn('Unexpected stations response shape, returning empty array', resp);
			return [];
		} catch (error) {
			console.error('Failed to fetch stations:', error);
			throw error;
		}
	},

	// Search vehicles by station and date range
	searchVehicles: async (params: VehicleSearchParams): Promise<VehicleSearchResponse> => {
		try {
			const response = await apiClient.get(`${API_BASE}/vehicles/search`, {
				params: {
					stationId: params.stationId,
					startDate: params.startDate,
					endDate: params.endDate
				}
			});
			return response.data;
		} catch (error) {
			console.error('Failed to search vehicles:', error);
			throw error;
		}
	}
};
