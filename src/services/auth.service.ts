// auth.service.ts
import { createAuthRequest, verifyAuthRequest, signInAuthRequest } from "@/controllers/types/auth/auth-request.type";
import { AuthSessionResponse } from "@/controllers/types/auth/auth-response.type";
import AuthRepository from "@/database/repositories/auth.repository";
import axios, { AxiosResponse } from 'axios';
import { Response } from 'express';
import crypto from 'crypto';
import { IUser } from '@/database/models/user.model';

export class AuthService {
    private readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '705404076755-14d6im0imscn51dr8ietoeu6eu594jph.apps.googleusercontent.com';
    private readonly GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
    private readonly REDIRECT_URI = process.env.REDIRECT_URI || 'https://sophorn.auth.us-west-2.amazoncognito.com/oauth2/idpresponse';

    private awsCognitoDomain = process.env.COGNITO_DOMAIN!;
    private awsCognitoClientId = process.env.COGNITO_CLIENT_ID!;
    private awsRedirectUri = process.env.COGNITO_REDIRECT_URI!;
    private awsCognitoClientSecret = process.env.COGNITO_CLIENT_SECRET!;

    /**
     * Generate a random state string for OAuth 2.0 CSRF protection.
     * @returns A randomly generated state string.
     */
    public generateState(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
    * Generate Cognito OAuth2 URL for Google login
    * @param state A unique state string to prevent CSRF attacks
    */
    public loginWithGoogle(state: string): string {
        // If state is not provided, generate a random state value
        const stateValue = state || crypto.randomBytes(16).toString('hex');

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.awsCognitoClientId,
            redirect_uri: this.awsRedirectUri,
            identity_provider: 'Google',
            scope: 'profile email openid',
            state: stateValue,
            prompt: 'select_account',
        });

        return `${this.awsCognitoDomain}/oauth2/authorize?${params.toString()}`;
    }


    public async handleCallback(code: string, _state: string): Promise<any> {
        const tokenUrl = `${this.awsCognitoDomain}/oauth2/token`;

        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: this.awsCognitoClientId,
            redirect_uri: this.awsRedirectUri,
            code: code,
        });

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${this.awsCognitoClientId}:${this.awsCognitoClientSecret}`).toString('base64')}`,
        };

        try {
            const response = await axios.post(tokenUrl, params.toString(), { headers });
            console.log('Cognito token response:', response.data);
            return response.data; // This will contain access token, id token, etc.
        } catch (error) {
            console.error('Failed to get tokens from Cognito', error);
            throw new Error('Failed to get tokens from Cognito');
        }
    }


    /**
     * Generate the Google authorization URL for the OAuth 2.0 flow.
     * @param state The state parameter for CSRF protection.
     * @returns The Google authorization URL.
     */
    public getGoogleAuthUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.GOOGLE_CLIENT_ID,
            redirect_uri: this.REDIRECT_URI,
            response_type: 'code',
            identity_provider: 'Google',
            scope: 'profile email openid',
            state: state,
            prompt: 'select_account',
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    /**
     * Exchange the authorization code for tokens.
     * @param code The authorization code from the Google callback.
     * @returns The token response from Google OAuth 2.0 API.
     */
    public async exchangeCodeForTokens(code: string): Promise<AxiosResponse<any>> {
        try {
            return await axios.post('https://oauth2.googleapis.com/token', {
                code: code,
                client_id: this.GOOGLE_CLIENT_ID,
                client_secret: this.GOOGLE_CLIENT_SECRET,
                redirect_uri: this.REDIRECT_URI,
                grant_type: 'authorization_code',
            });
        } catch (error) {
            console.error('Error exchanging code for tokens:', (error as any).response?.data || (error as any).message);
            throw error;
        }
    }

    /**
     * Retrieve user information from Google using the access token.
     * @param accessToken The access token obtained from Google OAuth 2.0.
     * @returns The user information from Google.
     */
    public async getUserInfo(accessToken: string): Promise<any> {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    }

    /**
     * Store tokens in secure HTTP-only cookies.
     * @param res The response object to set cookies on.
     * @param tokenResponse The token response from Google OAuth 2.0 API.
     */
    public storeTokensInCookies(res: Response, tokenResponse: AxiosResponse<any>): void {
        res.cookie('access_token', tokenResponse.data.access_token, { httpOnly: true, secure: true });
        res.cookie('id_token', tokenResponse.data.id_token, { httpOnly: true, secure: true });

        if (tokenResponse.data.refresh_token) {
            res.cookie('refresh_token', tokenResponse.data.refresh_token, { httpOnly: true, secure: true });
        }
    }

    /**
     * Store the Google user in the database.
     * @param email The user's email obtained from Google.
     * @param googleId The user's Google ID.
     */
    public async storeGoogleUser(email: string, googleId: string): Promise<IUser> {
        // Check if the user already exists in the database
        let user = await AuthRepository.getUserByEmail(email);
        if (!user) {
            // If the user doesn't exist, create a new entry
            user = await AuthRepository.storeUser(email, googleId);
        }
        return user;
    }

    // Your existing methods...
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

    public async register(createAuthRequest: createAuthRequest): Promise<void> {
        try {
            console.log(`AuthService - register() called for ${createAuthRequest.email}`);
            await AuthRepository.register(createAuthRequest);
        } catch (error: any) {
            if (error.name === 'UsernameExistsException') {
                console.log(`AuthService - register() - User already exists: ${createAuthRequest.email}`);
                throw new Error('User already exists');
            }
            console.error(`AuthService - register() method error: ${error}`);
            throw error;
        }
    }

    public async verify(verifyRequest: verifyAuthRequest): Promise<void> {
        try {
            console.log(`AuthService - verify() called for ${verifyRequest.email} with code ${verifyRequest.verificationCode}`);
            await AuthRepository.verify(verifyRequest);

            console.log(`AuthService - verification successful for ${verifyRequest.email}`);
        } catch (error: any) {
            if (error.__type === 'ExpiredCodeException') {
                console.error(`AuthService - verify() method error: Verification code expired for : ${verifyRequest.email}`);
                throw new Error('Verification code expired. Please request a new code.');
            }
            console.error(`AuthService - verify() method error: ${error}`);
            throw error;
        }
    }

    private async storeUserInDatabase(email: string): Promise<void> {
        try {
            const userAttributes = await AuthRepository.getUserAttributes(email);
            const cognitoId = userAttributes.find(attr => attr.Name === 'sub')?.Value;

            if (!cognitoId) {
                throw new Error(`AuthService - storeUserInDatabase() method : Cognito ID not found : ${cognitoId}`);
            }

            await AuthRepository.storeUser(email, cognitoId);
        } catch (error) {
            console.error('AuthService - storeUserInDatabase() method Error storing user in database ', error);
            throw error;
        }
    }

    public async signIn(signInRequest: signInAuthRequest): Promise<AuthSessionResponse> {
        try {
            const authResult = await AuthRepository.signIn(signInRequest);
            console.log(`AuthService - signIn() called for : ${authResult}`);
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
