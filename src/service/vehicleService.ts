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
