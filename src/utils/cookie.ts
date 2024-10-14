import { Response } from 'express';

function setCookie(response: Response, name: string, value: string) {
    response.cookie(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600 * 1000 // 1 hour
    });
}

export default setCookie;