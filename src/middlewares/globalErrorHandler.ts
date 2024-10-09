import { APP_ERROR_MESSAGE } from "@/utils/constants/app-error-message";
import { HTTP_STATUS_CODE } from "@/utils/constants/status-code";
import { ApplicationError } from "@/utils/errors";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export function globalErrorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
    // Handle Joi validation error
    if (Joi.isError(error)) {
        console.error(`$UserService - globalErrorHandler() method validation error: ${error}`);
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: error.details[0].message });
    }

    // Handle ApplicationError
    if (error instanceof ApplicationError) {
        const status = error.status;
        const message = error.message;
        const errors = error.errors;

        console.error(`$UserService - globalErrorHandler() method error: ${error}`);
        return res.status(status).json({ message, error: errors });
    }

    // Unhandled Error
    console.error(`$UserService - globalErrorHandler() method unexpected error: ${error}`);
    res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({ message: APP_ERROR_MESSAGE.serverError });
}