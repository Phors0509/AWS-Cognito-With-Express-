import UserModel from "@/database/models/user.model1";
import { MongoError, UserCreationRepoParams, UserGetAllRepoParams, UserSortParams, UserUpdateRepoParams } from "@/database/repositories/types/user/user-repository.type";
import mongoose, { SortOrder } from "mongoose";
import { APP_ERROR_MESSAGE, ApplicationError, InvalidInputError, NotFoundError, ResourceConflictError, prettyObject } from "@/utils/errors";
import { HTTP_STATUS_CODE } from "@/utils/constants/status-code";

export class AuthenticationError extends ApplicationErroronError {
    constructor(message = "Authentication failed. Please check your credentials.") {
        super({ message, status: HTTP_STATUS_CODE_CODE.UNAUTHORIZED });
    }
}

export class AuthorizationError extends ApplicationError {
    constructor(message = "You do not have permission to access this resource.") {
        super({ message, status: HTTP_STATUS_CODE.FORBIDDEN });
    }
}

export class ResourceConflictError extends ApplicationError {
    constructor(message = "Resource conflict occurred. The resource might already exist.") {
        super({ message, status: HTTP_STATUS_CODE.CONFLICT });
    }
}

export class PrettyObjectError extends ApplicationError {
    constructor(message = "Resource conflict occurred. The resource might already exist.") {
        super({ message, status: HTTP_STATUS_CODE.CONFLICT });
    }
}

export class APP_ERROR_MESSAGE extends ApplicationError {
    static existedEmail = "Email already existed";
    static existedUsername = "Username already existed";
}

// ========================
// Server Error
// ========================

export class InternalServerError extends ApplicationError {
    constructor({ message = "An internal server error occurred.", errors }: { message: string, errors?: {} }) {
        super({ message, status: HTTP_STATUS_CODE.SERVER_ERROR, errors });
    }
}