import { errorResponse, type ApiResponses } from "../types/api-response";
import { apiClient } from "./api";
import { API } from "../constants";
import type { RoleResponse, RoleType } from "../types/role";
const API_BASE_ADMIN = `${API.BASE}/roles`;
export const RoleService = {
    getRoles: async (): Promise<ApiResponses<RoleResponse[]>> => {
        try {
            const response = await apiClient.get<ApiResponses<RoleResponse[]>>(`${API_BASE_ADMIN}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching permission", error);
            return errorResponse<RoleType[]>("Failed to fetch Role");
        }
    },

    editPermission: async (roleId: number, permissionId: number): Promise<ApiResponses<RoleType>> => {
        try {
            const response = await apiClient.patch<ApiResponses<RoleType>>(
                `${API_BASE_ADMIN}`,
                { roleId, permissionId }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching role's permission update", error);
            return errorResponse<RoleType>("Failed to update role's permission");
        }
    }





}