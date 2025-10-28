


export interface PermissionResponse {
    permissionId?: number,
    permissionName?: string
}


export interface PermissionType {
    permissionId?: number,
    permissionName?: string
}

export interface PermissionAddRequest {
    permissionName?: string
}

export interface PermissionEditRequest {
    permissionName?: string
}

export interface PermissionModal {
    mode : string,
    open : boolean,
    onClose: () => void,
    addPermission?: (data: PermissionAddRequest) => Promise<void>,
    editPermission?: (id:number, name:string) => Promise<void>,
    permissionDetail?: PermissionResponse | null,
    loading: boolean,
}





