export interface AuthResponse {
    message: string;
    data: {
        email?: string;
        AccessToken?: string;
        RefreshToken?: string;
        IdToken?: string;
        attributes?: any[];
    } | null;
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

export interface AuthGoogleResponse {
    message: string;
    data: string;
}