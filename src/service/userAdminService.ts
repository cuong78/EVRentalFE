import { apiClient } from './api';
import { API } from '../constants';
import { tokenManager } from '../utils/token-manager';

export type AdminUserDTO = {
  userId: number;
  username: string;
  email?: string;
  phone?: string;
  roles?: string[];
  status?: string;
  createdAt?: string;
};

export type PagedResponse<T> = {
  data: T[];
  total: number;
  page?: number;
  size?: number;
};

export const userAdminService = {
  async getAll(params: { q?: string; page?: number; size?: number; role?: string }) {
    try {
      const token = tokenManager.getToken() || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await apiClient.get(`${API.ADMIN}/users`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      // Expect backend returns { statusCode, message, data: { data, total, ... } } or { data, total }
      const payload = res.data?.data ?? res.data;
      return {
        data: (payload?.data ?? payload ?? []) as AdminUserDTO[],
        total: Number(payload?.total ?? 0),
        page: payload?.page,
        size: payload?.size,
      } as PagedResponse<AdminUserDTO>;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        // Trả về rỗng để không chặn UI khi chưa có quyền
        return { data: [], total: 0 } as PagedResponse<AdminUserDTO>;
      }
      throw err;
    }
  },

  async remove(userId: number) {
    const token = tokenManager.getToken() || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
    await apiClient.delete(`${API.ADMIN}/users/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },
};
