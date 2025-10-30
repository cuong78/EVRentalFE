import { apiClient } from './api';
import { API } from '../constants';

export interface Station {
  id: number;
  city: string;
  address: string;
  staffMembers: any[];
  vehicles: any[];
}

export interface StationResponse {
  statusCode: number;
  message: string;
  data: Station[];
}

export const stationService = {
  getAllStations: async (): Promise<StationResponse> => {
    try {
      const response = await apiClient.get(`/rental-stations`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      throw error;
    }
  },

  getStationById: async (id: number): Promise<Station> => {
    try {
      const response = await apiClient.get(`/rental-stations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch station ${id}:`, error);
      throw error;
    }
  }
  ,
  getStationsByCity: async (city: string): Promise<StationResponse> => {
    try {
      const response = await apiClient.get(`/rental-stations/city/${encodeURIComponent(city)}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch stations by city ${city}:`, error);
      throw error;
    }
  }
};