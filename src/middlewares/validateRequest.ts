import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const validationError = new Error('Validation error');
            (validationError as any).details = error.details;
            return next(validationError);
        }
        next();
    };
};

export default validateRequest;