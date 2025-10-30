import { apiClient } from './api';
import { API } from '../constants';

export type AdminStaffDTO = {
  id: number;
  userId: number;
  username?: string;
  stationId?: number;
  stationName?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  createdAt?: string;
  status?: string;
};

export type PagedResponse<T> = {
  data: T[];
  total: number;
  page?: number;
  size?: number;
};

export const staffAdminService = {
  async getAll(params: { q?: string; stationId?: number; page?: number; size?: number }) {
    const res = await apiClient.get(`${API.ADMIN}/staffs`, { params });
    const payload = res.data?.data ?? res.data;
    return {
      data: (payload?.data ?? payload ?? []) as AdminStaffDTO[],
      total: Number(payload?.total ?? 0),
      page: payload?.page,
      size: payload?.size,
    } as PagedResponse<AdminStaffDTO>;
  },

  async create(data: Partial<AdminStaffDTO>) {
    const res = await apiClient.post(`${API.ADMIN}/staffs`, data);
    return res.data?.data ?? res.data;
  },

  async update(id: number, data: Partial<AdminStaffDTO>) {
    const res = await apiClient.put(`${API.ADMIN}/staffs/${id}`, data);
    return res.data?.data ?? res.data;
  },

  async remove(id: number) {
    await apiClient.delete(`${API.ADMIN}/staffs/${id}`);
  },
};
