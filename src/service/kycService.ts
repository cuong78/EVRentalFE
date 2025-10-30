import { apiClient } from './api';
import { API } from '../constants';

const BASE = `${API.BASE}`;

export interface CCCDInfo {
    id: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    placeOfOrigin: string;
    placeOfResidence: string;
    issueDate: string;
    issuedBy: string;
    expiryDate: string;
}

export interface ExtractCCCDResponse {
    frontImageUrl: string;
    backImageUrl: string;
    kycLogId: number;
    cccdInfo: CCCDInfo;
    status: string;
}

export const kycService = {
    extractCCCD: async (frontImage: File, backImage: File): Promise<ExtractCCCDResponse> => {
        const formData = new FormData();
        formData.append('frontImage', frontImage);
        formData.append('backImage', backImage);

        const response = await apiClient.post(`${BASE}/kyc/extract-cccd`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data?.data || response.data;
    },
};

