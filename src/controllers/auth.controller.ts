// auth.controller.ts
import { Controller, Tags, Route, Post, Get, Body, Path, Query } from 'tsoa';
import { createAuthRequest, verifyAuthRequest, signInAuthRequest } from './types/auth/auth-request.type';
import { AuthResponse } from './types/auth/auth-response.type';
import { UserResponse, UsersResponse } from '@/controllers/types/user/user-response.type';
import AuthService from '@/services/auth.service';
import { AuthRepository } from '@/database/repositories/auth.repository';
import { UserAttributesResponse } from './types/user/user-response.type';
import { sendResponse } from '@/utils/sendResponse';
@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {
    private authRepository: AuthRepository;
    constructor() {
        super();
        this.authRepository = new AuthRepository();
    }

    @Post("/register")
    public async register(@Body() createAuthRequest: createAuthRequest): Promise<AuthResponse> {
        try {
            await AuthService.register(createAuthRequest);
            return {
                message: "User registered successfully!",
                data: {
                    email: createAuthRequest.email
                }
            };
        } catch (error: any) {
            console.error(`AuthController - register() method error: ${error}`);
            if (error.message === 'User already exists') {
                this.setStatus(409);
                throw new Error('User with this email already exists');
            } else {
                this.setStatus(500);
                throw new Error('An error occurred during registration');
            }
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
            console.error(`AuthController - signIn() method error : ${error}`);
            throw error;
        }
    }

    /**
  * Login with Google using Cognito OAuth2
  * @param state A unique state string to prevent CSRF attacks
  */
    @Get('/google/login')
    public loginWithGoogle(@Query() state: string) {
        const cognitoOAuthURL = AuthService.loginWithGoogle(state);
        return sendResponse({ message: 'Login with Google successfully', data: cognitoOAuthURL });
    }

    @Get('/google/callback')
    public async cognitoCallback(
        @Query() code: string,
        @Query() state: string,
    ) {
        try {
            // Exchange the code for tokens
            const tokens = await AuthService.handleCallback(code, state);
            // console.log('AuthController - cognitoCallback() Log : ', tokens);
            console.log('Authorization code received:', code);
            console.log('State received:', state);
            return sendResponse({
                message: 'Authentication successful',
                data: tokens,
            });
        } catch (error) {
            console.error(error);
            return sendResponse({
                message: 'Authentication failed',
                status: 500,
            });
        }
    }

    // @Get('/google/login')
    // public initiateGoogleLogin() {
    //     const state = AuthService.generateState(); // Generate state
    //     const googleAuthUrl = AuthService.getGoogleAuthUrl(state);
    //     console.log(`AuthController - initiateGoogleLogin() - Google Auth URL: ${googleAuthUrl}`);
    //     return Response(200, `Google Auth URL generated successfully! : ${googleAuthUrl}`);
    // }

    // @Get('/google/callback')
    // @Response(200, 'Success')
    // @Response(500, 'Authentication failed')
    // public async handleGoogleCallback(
    //     @Query('code') code: string,
    //     @Query('state') state: string,
    //     @Query('error') error: string,
    //     @Request() req: any,
    //     @Response(200, 'Success') res: any
    // ): Promise<void> {
    //     try {
    //         if (error) {
    //             throw new Error(`Google OAuth Error: ${error}`);
    //         }

    //         if (!code) {
    //             throw new Error('No authorization code received from Google');
    //         }

    //         if (state !== req.session.oauthState) {
    //             throw new Error('Invalid state parameter');
    //         }

    //         const tokenResponse = await AuthService.exchangeCodeForTokens(code);

    //         if (!tokenResponse.data || !tokenResponse.data.access_token) {
    //             throw new Error('Invalid token response from Google');
    //         }

    //         AuthService.storeTokensInCookies(res, tokenResponse.data);

    //         const userInfo = await AuthService.getUserInfo(tokenResponse.data.access_token);
    //         req.session.user = userInfo;

    //         // Redirect to your frontend application
    //         res.redirect('http://localhost:3000/products');
    //     } catch (error) {
    //         console.error('Error handling Google callback:', error);
    //         // Send a more informative error response
    //         res.status(500).json({
    //             error: 'Authentication failed',
    //             message: "error occurred during authentication",
    //             stack: process.env.NODE_ENV === 'development' ? (error as any).stack : undefined
    //         });
    //     }
    // }


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