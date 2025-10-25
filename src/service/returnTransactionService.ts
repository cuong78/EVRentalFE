import { apiClient } from './api';
import { API } from '../constants';

const BASE = `${API.BASE}`;

export interface CreateReturnRequest {
    bookingId: string;
    conditionNotes?: string;
    damageFee?: number;
    photos?: File[];
}

export const returnTransactionService = {
    create: async (payload: CreateReturnRequest): Promise<any> => {
        const form = new FormData();
        form.append('bookingId', payload.bookingId);
        if (payload.conditionNotes) form.append('conditionNotes', payload.conditionNotes);
        if (typeof payload.damageFee !== 'undefined') form.append('damageFee', String(payload.damageFee));
        if (payload.photos && payload.photos.length > 0) {
            for (const file of payload.photos) {
                form.append('photos', file);
            }
        }
        const res = await apiClient.post(`${BASE}/return-transactions`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }
};


