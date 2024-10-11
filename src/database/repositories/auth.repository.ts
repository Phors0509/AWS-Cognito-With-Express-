// auth.repository.ts
import { createAuthRequest, verifyAuthRequest, signInAuthRequest } from "@/controllers/types/auth/auth-request.type";
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    SignUpCommand,
    ConfirmSignUpCommand,
    // GetUserCommand,
    AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from 'crypto';
import configs from '@/config';
import User, { IUser } from '@/database/models/user.model';

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

        const command = new ConfirmSignUpCommand({
            ClientId: configs.cognito.clientId,
            Username: verifyRequest.email,
            ConfirmationCode: verifyRequest.verificationCode,
            SecretHash: secretHash

        });

        try {
            await this.client.send(command);
        } catch (error) {
            console.error(`AuthRepository - verify() method error:`, error);
            throw error;
        }
    }

    public async signIn(signInRequest: signInAuthRequest): Promise<any> {
        const secretHash = this.calculateSecretHash(signInRequest.email);
        const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: configs.cognito.clientId,
            AuthParameters: {
                USERNAME: signInRequest.email,
                PASSWORD: signInRequest.password,
                SECRET_HASH: secretHash

            },
        });

        try {
            const response = await this.client.send(command);
            return response.AuthenticationResult;
        } catch (error) {
            console.error(`AuthRepository - signIn() method error:`, error);
            throw error;
        }
    }


    public async getUserAttributes(username: string): Promise<any[]> {
        const command = new AdminGetUserCommand({
            UserPoolId: configs.cognito.userPoolId,
            Username: username
        });

        try {
            const response = await this.client.send(command);
            return response.UserAttributes || [];
        } catch (error) {
            console.error(`AuthRepository - getUserAttributes() method error:`, error);
            throw error;
        }
    }

    public async storeUser(email: string, cognitoId: string): Promise<IUser> {
        try {
            const user = await User.findOneAndUpdate(
                { email },
                {
                    email,
                    cognitoId,
                    isEmailVerified: true
                },
                { upsert: true, new: true }
            );
            return user;
        } catch (error) {
            console.error('Error storing user in database:', error);
            throw error;
        }
    }

    public async getUserByEmail(email: string): Promise<IUser | null> {
        try {
            const user = await User.findOne({ email });
            return user;
        } catch (error) {
            console.error(`AuthRepository - getUserByEmail() method error: ${error}`);
            throw error;
        }
    }

    public async getAllUsers(page: number = 1, limit: number = 10) {
        try {
            const skip = (page - 1) * limit;
            const users = await User.find()
                .skip(skip)
                .limit(limit)
                .select('-__v'); // Exclude the version key
            const total = await User.countDocuments();
            return {
                users,
                totalUsers: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error(`AuthRepository - getAllUsers() method error: ${error}`);
            throw error;
        }
    }
}

export default new AuthRepository();