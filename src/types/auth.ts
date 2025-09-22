import type { Role } from "./role";

//Register
export type Gender = "MALE" | "FEMALE";
export type User = Role;

// export interface AuthContextType {
//   user: User | null;
//   setUser: (user: User | null) => void;
// }

export interface AuthContextType {
    user: UserDetails | null;
    setUser: (user: UserDetails | null) => void;
}

export type UserDetails = {
    userId: number;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    identityCard: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string; // ISO string
    address: string;
    avatarUrl: string;
    memberScore: number;
    status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | string;
    deleted: boolean;
    roles: Role[];
    permissions?: {
        permissionId: number;
        permissionName: string;
    }[];
};

export interface RegisterFormData {
    username: string;
    fullName: string;
    dateOfBirth: string;
    email: string;
    identityCard: string;
    phoneNumber: string;
    address: string;
    password: string;
    confirmPassword: string;
    gender: Gender;
}

export interface RegisterResponse {
    success: boolean;
}

export interface RegisterFormProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
    isPopup?: boolean;
}

//Login
export interface LoginFormData {
    username: string;
    password: string;
    rememberMe: boolean;
}

export interface LoginResponse {
    token: string;
    roles: Role[];
}
