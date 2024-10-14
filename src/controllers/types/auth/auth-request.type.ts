export interface createAuthRequest {
    email: string;
    password: string;
}

export interface verifyAuthRequest {
    email: string;
    verificationCode: string;
}

export interface signInAuthRequest {
    email: string;
    password: string;
}

export interface GoogleCallbackRequest {
    code: string;
    state: string;
}