// auth.repository.ts
import { createAuthRequest, verifyAuthRequest, signInAuthRequest } from "@/controllers/types/auth/auth-request.type";
import { CognitoUserSession } from 'amazon-cognito-identity-js';
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    SignUpCommand,
    ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from 'crypto';
import configs from '@/config';

export class AuthRepository {
    private clientId: string;
    private clientSecret: string;
    private client: CognitoIdentityProviderClient;

    constructor() {
        this.clientId = configs.cognito.clientId;
        this.clientSecret = configs.cognito.clientSecret;
        this.client = new CognitoIdentityProviderClient({ region: configs.cognito.region });
    }

    private calculateSecretHash(username: string): string {
        const message = username + this.clientId;
        const hmac = crypto.createHmac('SHA256', this.clientSecret);
        const secretHash = hmac.update(message).digest('base64');
        console.log(`Generated SECRET_HASH for ${username}: ${secretHash}`);
        return secretHash;
    }

    public async register(authRequest: createAuthRequest): Promise<{ email: string }> {
        const secretHash = this.calculateSecretHash(authRequest.email);

        const command = new SignUpCommand({
            ClientId: this.clientId,
            Username: authRequest.email,
            Password: authRequest.password,
            SecretHash: secretHash,
            UserAttributes: [
                { Name: 'email', Value: authRequest.email }
            ]
        });

        try {
            await this.client.send(command);
            return { email: authRequest.email };
        } catch (error) {
            console.error(`AuthRepository - register() method error:`, error);
            throw error;
        }
    }

    public async verify(verifyRequest: verifyAuthRequest): Promise<void> {
        const secretHash = this.calculateSecretHash(verifyRequest.email);
        console.log(`AuthRepository - verify() method called for ${verifyRequest.email} with code ${verifyRequest.verificationCode}`);

        const command = new ConfirmSignUpCommand({
            ClientId: this.clientId,
            Username: verifyRequest.email,
            ConfirmationCode: verifyRequest.verificationCode,
            SecretHash: secretHash
        });

        console.log("Request payload to Cognito for verification:", command);

        try {
            const response = await this.client.send(command);
            console.log(`AuthRepository - verify() successful: `, response);
        } catch (error) {
            console.error(`AuthRepository - verify() method error:`, error);
            throw error;
        }
    }

    public async signIn(signInRequest: signInAuthRequest): Promise<CognitoUserSession> {
        const secretHash = this.calculateSecretHash(signInRequest.email);

        const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: this.clientId,
            AuthParameters: {
                USERNAME: signInRequest.email,
                PASSWORD: signInRequest.password,
                SECRET_HASH: secretHash
            }
        });

        try {
            const response = await this.client.send(command);
            const session = {
                getIdToken: () => ({ getJwtToken: () => response.AuthenticationResult?.IdToken }),
                getRefreshToken: () => ({ getToken: () => response.AuthenticationResult?.RefreshToken }),
                getAccessToken: () => ({ getJwtToken: () => response.AuthenticationResult?.AccessToken }),
                isValid: () => true
            } as CognitoUserSession;

            return session;
        } catch (error) {
            console.error(`AuthRepository - signIn() method error:`, error);
            throw error;
        }
    }
}

export default new AuthRepository();