import { IUser } from '@/database/models/user.model';


export interface UserResponse {
    message: string;
    data: IUser | null;
}

export interface UsersResponse {
    message: string;
    data: {
        users: IUser[];
        totalUsers: number;
        currentPage: number;
        totalPages: number;
    };
}

export interface UserAttributesResponse {
    message: string;
    data: {
        attributes: any[];
    };
}