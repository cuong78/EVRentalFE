import { apiClient } from './api';
import { API } from '../constants';

const BASE = `${API.BASE}`;

export type StaffStatus = 'ACTIVE' | 'INACTIVE';

export interface StaffDTO {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  stationId: number;
  status: StaffStatus;
  createdAt?: string;
}

export interface UpsertStaffRequest {
  fullName: string;
  phone: string;
  email: string;
  stationId: number;
  status: StaffStatus;
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
}

export const staffService = {
  // GET /api/staffs?stationId=&q=&page=&size=
  getAll: async (params: { stationId?: number; q?: string; page?: number; size?: number } = {}): Promise<PagedResponse<StaffDTO>> => {
    const res = await apiClient.get(`${BASE}/staffs`, { params });
    const payload = res.data || {};
    const data = (payload.data ?? payload) as any;
    // normalize shape
    if (Array.isArray(data)) return { data, total: data.length };
    return { data: data.data ?? data.items ?? [], total: data.total ?? 0 };
  },

  // GET /api/staffs/{id}
  getById: async (id: number): Promise<StaffDTO> => {
    const res = await apiClient.get(`${BASE}/staffs/${id}`);
    const payload = res.data || {};
    return (payload.data ?? payload) as StaffDTO;
  },

  // POST /api/staffs
  create: async (body: UpsertStaffRequest): Promise<StaffDTO> => {
    const res = await apiClient.post(`${BASE}/staffs`, body);
    const payload = res.data || {};
    return (payload.data ?? payload) as StaffDTO;
  },

  // PUT /api/staffs/{id}
  update: async (id: number, body: UpsertStaffRequest): Promise<StaffDTO> => {
    const res = await apiClient.put(`${BASE}/staffs/${id}`, body);
    const payload = res.data || {};
    return (payload.data ?? payload) as StaffDTO;
  },

  // DELETE /api/staffs/{id}
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/staffs/${id}`);
  },
};
