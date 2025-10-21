import { apiClient } from './api';
import { API } from '../constants';

export interface AdminVehicle {
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
  status: 'AVAILABLE' | 'MAINTENANCE' | 'RENTED';
  conditionNotes: string;
  // photos can be a single string path or a comma-separated string, or an array
  photos: string | string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminVehicleResponse {
  statusCode: number;
  message: string;
  data: AdminVehicle[];
}

export interface CreateVehicleRequest {
  typeId: number;
  stationId: number;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'RENTED';
  conditionNotes: string;
  // backend expects a string for photos (single path or comma-separated list)
  photos: string | string[];
}

export interface VehicleType {
  id: number;
  name: string;
  depositAmount: number;
  rentalRate: number;
}

export interface VehicleTypesResponse {
  statusCode: number;
  message: string;
  data: VehicleType[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const vehicleAdminService = {
  // Get all vehicles for admin
  getAllVehicles: async (): Promise<AdminVehicleResponse> => {
    try {
      const response = await apiClient.get(`${API.BASE}/vehicles`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      throw error;
    }
  },

  // Get vehicle by ID
  getVehicleById: async (id: number): Promise<ApiResponse<AdminVehicle>> => {
    try {
      const response = await apiClient.get(`${API.BASE}/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch vehicle ${id}:`, error);
      throw error;
    }
  },

  // Create new vehicle
  createVehicle: async (data: CreateVehicleRequest): Promise<ApiResponse<AdminVehicle>> => {
    try {
      // Normalize photos to a single string as backend expects
      let photosPayload: string;
      if (Array.isArray(data.photos)) {
        photosPayload = data.photos.length === 0 ? '' : data.photos.join(',');
      } else {
        photosPayload = data.photos || '';
      }

      const payload = {
        typeId: data.typeId,
        stationId: data.stationId,
        status: data.status,
        conditionNotes: data.conditionNotes,
        photos: photosPayload
      };

      // debug: log outgoing payload shape
      console.debug('Creating vehicle with payload:', payload);

      const response = await apiClient.post(`${API.BASE}/vehicles`, payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      throw error;
    }
  },

  // Update vehicle
  updateVehicle: async (id: number, data: Partial<AdminVehicle>): Promise<ApiResponse<AdminVehicle>> => {
    try {
      const response = await apiClient.put(`${API.BASE}/vehicles/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update vehicle ${id}:`, error);
      throw error;
    }
  },

  // Delete vehicle
  deleteVehicle: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`${API.BASE}/vehicles/${id}`);
    } catch (error) {
      console.error(`Failed to delete vehicle ${id}:`, error);
      throw error;
    }
  },

  // Get all vehicle types
  getVehicleTypes: async (): Promise<VehicleTypesResponse> => {
    try {
      const response = await apiClient.get(`${API.BASE}/vehicle-types`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch vehicle types:', error);
      throw error;
    }
  }
  ,
  // Create vehicle type
  createVehicleType: async (data: { name: string; depositAmount: number; rentalRate: number }) => {
    try {
      const response = await apiClient.post(`${API.BASE}/vehicle-types`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create vehicle type:', error);
      throw error;
    }
  },

  updateVehicleType: async (id: number, data: { name?: string; depositAmount?: number; rentalRate?: number }) => {
    try {
      const response = await apiClient.put(`${API.BASE}/vehicle-types/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update vehicle type ${id}:`, error);
      throw error;
    }
  },

  deleteVehicleType: async (id: number) => {
    try {
      const response = await apiClient.delete(`${API.BASE}/vehicle-types/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete vehicle type ${id}:`, error);
      throw error;
    }
  }
  ,
  // Get vehicle types available at a station (optionally within a date range)
  getVehicleTypesByStation: async (stationId: number, startDate?: string, endDate?: string) => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate; // expect YYYY-MM-DD
      if (endDate) params.endDate = endDate;
      const response = await apiClient.get(`${API.BASE}/vehicle-types/by-station/${stationId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch vehicle types by station ${stationId}:`, error);
      throw error;
    }
  },

  // Get vehicle types available at a station filtered by type
  getVehicleTypesByStationAndType: async (stationId: number, typeId: number, startDate?: string, endDate?: string) => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await apiClient.get(`${API.BASE}/vehicle-types/station/${stationId}/type/${typeId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch vehicle types by station ${stationId} and type ${typeId}:`, error);
      throw error;
    }
  },

  // Get vehicle types by type id
  getVehicleTypesByType: async (typeId: number) => {
    try {
      const response = await apiClient.get(`${API.BASE}/vehicle-types/type/${typeId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch vehicle types by type ${typeId}:`, error);
      throw error;
    }
  }
  ,
  // Get vehicles by type
  getVehiclesByType: async (typeId: number): Promise<AdminVehicleResponse> => {
    try {
      const response = await apiClient.get(`${API.BASE}/vehicles/type/${typeId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch vehicles by type ${typeId}:`, error);
      throw error;
    }
  },

  // Get vehicles by station
  getVehiclesByStation: async (stationId: number): Promise<AdminVehicleResponse> => {
    try {
      const response = await apiClient.get(`${API.BASE}/vehicles/station/${stationId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch vehicles by station ${stationId}:`, error);
      throw error;
    }
  },

  // Get vehicles by station and type
  getVehiclesByStationAndType: async (stationId: number, typeId: number): Promise<AdminVehicleResponse> => {
    try {
      const response = await apiClient.get(`${API.BASE}/vehicles/station/${stationId}/type/${typeId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch vehicles by station ${stationId} and type ${typeId}:`, error);
      throw error;
    }
  }
};
