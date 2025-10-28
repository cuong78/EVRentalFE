import { apiClient } from './api';
import { API } from '../constants';

const BASE = `${API.BASE}`;

export interface Document {
    id?: number;
    userId: number;
    username?: string;
    documentType: string;
    documentNumber: string;
    frontPhoto?: string;
    backPhoto?: string;
    issueDate?: string;
    expiryDate?: string;
    issuedBy?: string;
    default?: boolean;
    status?: string; // VERIFIED, PENDING, REJECTED
    verifiedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    valid?: boolean;
    expired?: boolean;
}

export interface CreateDocumentRequest {
    userId: number;
    documentType: string;
    documentNumber: string;
    frontPhoto?: File;
    backPhoto?: File;
    issueDate?: string;
    expiryDate?: string;
    issuedBy?: string;
    default?: boolean;
}

export interface UpdateDocumentRequest {
    userId?: number;
    documentType?: string;
    documentNumber?: string;
    frontPhoto?: File | string; // File mới hoặc URL cũ
    backPhoto?: File | string;
    issueDate?: string;
    expiryDate?: string;
    issuedBy?: string;
    default?: boolean;
}

export const documentService = {
    getAll: async (): Promise<Document[]> => {
        const response = await apiClient.get(`${BASE}/documents`);
        return response.data || [];
    },

    create: async (data: CreateDocumentRequest): Promise<any> => {
        const formData = new FormData();
        formData.append('userId', String(data.userId));
        formData.append('documentType', data.documentType);
        formData.append('documentNumber', data.documentNumber);
        
        if (data.frontPhoto) {
            formData.append('frontPhoto', data.frontPhoto);
        }
        if (data.backPhoto) {
            formData.append('backPhoto', data.backPhoto);
        }
        if (data.issueDate) {
            formData.append('issueDate', data.issueDate);
        }
        if (data.expiryDate) {
            formData.append('expiryDate', data.expiryDate);
        }
        if (data.issuedBy) {
            formData.append('issuedBy', data.issuedBy);
        }
        if (data.default !== undefined) {
            formData.append('default', String(data.default));
        }

        const response = await apiClient.post(`${BASE}/documents`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getByUserId: async (userId: number): Promise<Document[]> => {
        const response = await apiClient.get(`${BASE}/documents/user/${userId}`);
        return response.data?.data || response.data || [];
    },

    getById: async (id: number): Promise<Document> => {
        const response = await apiClient.get(`${BASE}/documents/${id}`);
        return response.data?.data || response.data;
    },

    update: async (id: number, data: UpdateDocumentRequest): Promise<any> => {
        const formData = new FormData();
        
        if (data.userId !== undefined) {
            formData.append('userId', String(data.userId));
        }
        if (data.documentType) {
            formData.append('documentType', data.documentType);
        }
        if (data.documentNumber) {
            formData.append('documentNumber', data.documentNumber);
        }
        
        // Nếu frontPhoto là File thì append, nếu là string (URL cũ) thì append luôn
        if (data.frontPhoto) {
            if (data.frontPhoto instanceof File) {
                formData.append('frontPhoto', data.frontPhoto);
            } else {
                formData.append('frontPhoto', data.frontPhoto);
            }
        }
        
        if (data.backPhoto) {
            if (data.backPhoto instanceof File) {
                formData.append('backPhoto', data.backPhoto);
            } else {
                formData.append('backPhoto', data.backPhoto);
            }
        }
        
        if (data.issueDate) {
            formData.append('issueDate', data.issueDate);
        }
        if (data.expiryDate) {
            formData.append('expiryDate', data.expiryDate);
        }
        if (data.issuedBy) {
            formData.append('issuedBy', data.issuedBy);
        }
        if (data.default !== undefined) {
            formData.append('default', String(data.default));
        }

        const response = await apiClient.put(`${BASE}/documents/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: number): Promise<any> => {
        const response = await apiClient.delete(`${BASE}/documents/${id}`);
        return response.data;
    },
};

