import type { PermissionType } from "./permission";

export interface Role {
    name: string;
    roleId: number;
    roleName: "ADMIN" | "MANAGER" | "EMPLOYEE" | "MEMBER";
    permissions: PermissionType[]
}
export interface RoleResponse {
    roleId: number;
    roleName: string;
    permissions: PermissionType[];
}

export interface RoleType {
    roleId: number;
    roleName: string;
    permissions: PermissionType[];
}


export interface RoleUpdatePermission {
    roleId: number;
    permissionId: number;
}
