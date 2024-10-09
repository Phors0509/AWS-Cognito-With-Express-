// auth.service.ts
import { createAuthRequest, verifyAuthRequest, signInAuthRequest } from "@/controllers/types/auth/auth-request.type";
import { AuthSessionResponse } from "@/controllers/types/auth/auth-response.type";
import AuthRepository from "@/database/repositories/auth.repository";

export class AuthService {
    public async register(authRequest: createAuthRequest): Promise<{ email: string }> {
        try {
            const newAuth = await AuthRepository.register(authRequest);
            return {
                email: newAuth.email
            };
        } catch (error) {
            console.error(`AuthService - register() method error: ${error}`);
            throw error;
        }
    }

    public async verify(verifyRequest: verifyAuthRequest): Promise<void> {
        try {
            console.log(`AuthService - verify() called for ${verifyRequest.email} with code ${verifyRequest.verificationCode}`);
            await AuthRepository.verify(verifyRequest);
        } catch (error: any) {
            if (error.__type === 'ExpiredCodeException') {
                console.error(`AuthService - verify() method error: Verification code expired for ${verifyRequest.email}`);
                throw new Error('Verification code expired. Please request a new code.');
            }
            console.error(`AuthService - verify() method error: ${error}`);
            throw error;
        }
    }

    public async signIn(signInRequest: signInAuthRequest): Promise<AuthSessionResponse> {
        try {
            const session = await AuthRepository.signIn(signInRequest);
            return {
                message: "User signed in successfully!",
                data: {
                    email: signInRequest.email,
                    accessToken: session.getAccessToken().getJwtToken(),
                    RefreshToken: session.getRefreshToken().getToken(),
                    IdToken: session.getIdToken().getJwtToken()
                }
            };
        } catch (error) {
            console.error(`AuthService - signIn() method error: ${error}`);
            throw error;
        }
    }
}

export default new AuthService();
