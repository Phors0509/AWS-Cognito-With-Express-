export interface AuthResponse {
    message: string;
    data: any;
}

export interface AuthSessionResponse {
    message: string;
    data: {
        email?: string;
        accessToken?: string;
        IdToken?: string;
        RefreshToken?: string;
    };
}