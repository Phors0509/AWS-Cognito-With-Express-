import { Controller, Tags, Route, Post, Get, Body, Path, Query } from 'tsoa';
import { createAuthRequest, verifyAuthRequest, signInAuthRequest } from './types/auth/auth-request.type';
import { AuthResponse } from './types/auth/auth-response.type';
import { UserResponse, UsersResponse } from '@/controllers/types/user/user-response.type';
import AuthService from '@/services/auth.service';
import { AuthRepository } from '@/database/repositories/auth.repository';
import { UserAttributesResponse } from './types/user/user-response.type';

@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {
    private authRepository: AuthRepository;

    constructor() {
        super();
        this.authRepository = new AuthRepository();
    }

    @Post('/register')
    public async register(@Body() requestBody: createAuthRequest): Promise<AuthResponse> {
        try {
            const result = await AuthService.register(requestBody);
            return {
                message: "User registered successfully!",
                data: {
                    email: result.email
                }
            };
        } catch (error) {
            console.error(`AuthController - register() method error: ${error}`);
            throw error;
        }
    }

    @Post('/verify')
    public async verify(@Body() requestBody: verifyAuthRequest): Promise<AuthResponse> {
        try {
            await AuthService.verify(requestBody);
            return {
                message: "User verified successfully!",
                data: null
            };
        } catch (error) {
            console.error(`AuthController - verify() method error: ${error}`);
            throw error;
        }
    }

    @Post('/signin')
    public async signIn(@Body() requestBody: signInAuthRequest): Promise<AuthResponse> {
        try {
            const result = await AuthService.signIn(requestBody);
            return {
                message: "User signed in successfully!",
                data: {
                    email: result.data.email,
                    AccessToken: result.data.accessToken,
                    RefreshToken: result.data.RefreshToken,
                    IdToken: result.data.IdToken
                }
            };
        } catch (error) {
            console.error(`AuthController - signIn() method error: ${error}`);
            throw error;
        }
    }

    @Get('/user/{email}/attributes')
    public async getUserAttributes(@Path() email: string): Promise<UserAttributesResponse> {
        try {
            const attributes = await this.authRepository.getUserAttributes(email);
            return {
                message: "User attributes retrieved successfully!",
                data: { attributes }
            };
        } catch (error) {
            console.error(`AuthController - getUserAttributes() method error: ${error}`);
            throw error;
        }
    }

    @Get('/user/{email}')
    public async getUserByEmail(@Path() email: string): Promise<UserResponse> {
        try {
            const user = await this.authRepository.getUserByEmail(email);
            if (user) {
                return {
                    message: "User retrieved successfully!",
                    data: user
                };
            } else {
                this.setStatus(404);
                return {
                    message: "User not found",
                    data: null
                };
            }
        } catch (error) {
            console.error(`AuthController - getUserByEmail() method error: ${error}`);
            throw error;
        }
    }

    @Get('/users')
    public async getAllUsers(
        @Query() page: number = 1,
        @Query() limit: number = 10
    ): Promise<UsersResponse> {
        try {
            const result = await this.authRepository.getAllUsers(page, limit);
            return {
                message: "Users retrieved successfully!",
                data: result
            };
        } catch (error) {
            console.error(`AuthController - getAllUsers() method error: ${error}`);
            throw error;
        }
    }
}

export default new AuthController();