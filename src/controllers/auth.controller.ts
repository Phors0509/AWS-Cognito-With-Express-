// auth.controller.ts
import { Controller, Tags, Route, Post, Body } from 'tsoa';
import { createAuthRequest, verifyAuthRequest, signInAuthRequest } from './types/auth/auth-request.type';
import { AuthResponse } from './types/auth/auth-response.type';
import AuthService from '@/services/auth.service';

@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {
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
                    accessToken: result.data.accessToken,
                    RefreshToken: result.data.RefreshToken,
                    IdToken: result.data.IdToken
                }
            };
        } catch (error) {
            console.error(`AuthController - signIn() method error: ${error}`);
            throw error;
        }
    }
}