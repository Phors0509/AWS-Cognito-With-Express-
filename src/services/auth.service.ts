// auth.service.ts
import { createAuthRequest, verifyAuthRequest, signInAuthRequest } from "@/controllers/types/auth/auth-request.type";
import { AuthSessionResponse } from "@/controllers/types/auth/auth-response.type";
import AuthRepository from "@/database/repositories/auth.repository";

export class AuthService {

    public async getAllUsers(page: number = 1, limit: number = 10) {
        try {
            return await AuthRepository.getAllUsers(page, limit);
        } catch (error) {
            console.error(`AuthService - getAllUsers() method error: ${error}`);
            throw error;
        }
    }

    public async getUserByEmail(email: string) {
        try {
            const user = await AuthRepository.getUserByEmail(email);
            if (!user) {
                throw new Error('AuthService - getUserByEmail() method : User not found');
            }
            return user;
        } catch (error) {
            console.error(`AuthService - getUserByEmail() method error: ${error}`);
            throw error;
        }
    }

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

            // After successful verification, we don't store the user yet
            // We'll do that after they sign in
            console.log(`AuthService - verification successful for ${verifyRequest.email}`);
        } catch (error: any) {
            if (error.__type === 'ExpiredCodeException') {
                console.error(`AuthService - verify() method error: Verification code expired for ${verifyRequest.email}`);
                throw new Error('Verification code expired. Please request a new code.');
            }
            console.error(`AuthService - verify() method error: ${error}`);
            throw error;
        }
    }

    private async storeUserInDatabase(email: string): Promise<void> {
        try {
            // Get user attributes from Cognito
            const userAttributes = await AuthRepository.getUserAttributes(email);

            // Find the 'sub' attribute which is the Cognito User ID
            const cognitoId = userAttributes.find(attr => attr.Name === 'sub')?.Value;

            if (!cognitoId) {
                throw new Error(`AuthService - storeUserInDatabase() method : Cognito ID not found : ${cognitoId}`);
            }

            // Store user in MongoDB
            await AuthRepository.storeUser(email, cognitoId);

        } catch (error) {
            console.error('AuthService - storeUserInDatabase() method Error storing user in database ', error);
            throw error;

        }
    }

    public async signIn(signInRequest: signInAuthRequest): Promise<AuthSessionResponse> {
        try {
            const authResult = await AuthRepository.signIn(signInRequest);

            // Now that we have authenticated, we can store the user
            await this.storeUserInDatabase(signInRequest.email);

            return {
                message: "User signed in successfully!",
                data: {
                    email: signInRequest.email,
                    accessToken: authResult.AccessToken,
                    RefreshToken: authResult.RefreshToken,
                    IdToken: authResult.IdToken,
                }
            };
        } catch (error) {
            console.error(`AuthService - signIn() method error: ${error}`);
            throw error;
        }
    }


}

export default new AuthService();