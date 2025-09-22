export interface ApiResponses<T>{
    data?: T;
    code: number;
    message?: string;
    pagination?: Pagination;
}

export interface BackendPaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}

export interface Pagination {
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}

export function errorResponse<T>(message: string): ApiResponses<T> {
    return {
        data: null as unknown as T,
        code: 500,
        message: message
    };
}