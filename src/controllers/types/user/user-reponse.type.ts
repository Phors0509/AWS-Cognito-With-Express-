import { IUser } from "@/database/models/user.model";

// Define the response type for a single user
export interface UserResponse {
    message: string;
    data?: IUser
}

// Define the response type for paginated users
export interface UserPaginatedResponse {
    message: string;
    data: {
        users: Array<{
            id: string;
            name: string;
            email: string;
            // Add other user properties as necessary
        }>;
        total: number;
        page: number;
        limit: number;
    };
}