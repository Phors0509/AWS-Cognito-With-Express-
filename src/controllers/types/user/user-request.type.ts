// Define the request type for creating a user
export interface UserCreateRequest {
    name: string;
    email: string;
    password: string;
    // Add other fields as necessary
}

// Define the request type for getting all users with optional query parameters
export interface UserGetAllRequest {
    page?: number;
    limit?: number;
    filter?: {
        name?: string;
        email?: string;
        // Add other filter fields as necessary
    };
    sort?: {

        // Add other sort fields as necessary
    };
}

// Define the request type for updating a user
export interface UserUpdateRequest {
    name?: string;
    email?: string;
    password?: string;
    // Add other fields as necessary
}