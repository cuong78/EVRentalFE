import { apiClient } from './api';
import { API } from '../constants';

const BASE = `${API.BASE}`;

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface AdminUserDTO {
  userId: number;
  username: string;
  email: string;
  phone: string;
  roles: string[];
  status: UserStatus;
  createdAt?: string;
}

export interface UpsertAdminUserRequest {
  username: string;
  email: string;
  phone: string;
  status: UserStatus;
  roles: string[];
  password?: string; // optional for create
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
}

export const userAdminService = {
  // GET /api/admin/users?q=&page=&size=
  getAll: async (params: { q?: string; page?: number; size?: number } = {}): Promise<PagedResponse<AdminUserDTO>> => {
    const res = await apiClient.get(`${BASE}/admin/users`, { params });
    const payload = res.data || {};
    const data = (payload.data ?? payload) as any;
    if (Array.isArray(data)) return { data, total: data.length };
    return { data: data.data ?? data.items ?? [], total: data.total ?? 0 };
  },

  // GET /api/admin/users/{id}
  getById: async (id: number): Promise<AdminUserDTO> => {
    const res = await apiClient.get(`${BASE}/admin/users/${id}`);
    const payload = res.data || {};
    return (payload.data ?? payload) as AdminUserDTO;
  },

  // POST /api/admin/users
  create: async (body: UpsertAdminUserRequest): Promise<AdminUserDTO> => {
    const res = await apiClient.post(`${BASE}/admin/users`, body);
    const payload = res.data || {};
    return (payload.data ?? payload) as AdminUserDTO;
  },

  // PUT /api/admin/users/{id}
  update: async (id: number, body: UpsertAdminUserRequest): Promise<AdminUserDTO> => {
    const res = await apiClient.put(`${BASE}/admin/users/${id}`, body);
    const payload = res.data || {};
    return (payload.data ?? payload) as AdminUserDTO;
  },

  // DELETE /api/admin/users/{id}
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/admin/users/${id}`);
  },
};
