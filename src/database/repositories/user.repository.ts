import UserModel from "@/database/models/user.model";
import { MongoError, UserCreationRepoParams, UserGetAllRepoParams, UserSortParams, UserUpdateRepoParams } from "@/database/repositories/types/user/user-repository.type";
import mongoose, { SortOrder } from "mongoose";
import { APP_ERROR_MESSAGE, InvalidInputError, NotFoundError, ResourceConflictError, PrettyObjectError } from "@/utils/errors";

class UserRepository {
    async getAll(queries: UserGetAllRepoParams) {
        const { page = 1, limit = 10, filter = {}, sort = { createdAt: 'desc' } } = queries;

        // Convert sort from {'field': 'desc'} to {'field': -1}
        const sortFields = Object.keys(sort).reduce((acc, key) => {
            const direction = (sort as UserSortParams)[key as keyof UserSortParams];
            if (direction === 'asc' || direction === 'desc') {
                acc[key as keyof UserSortParams] = direction === 'asc' ? 1 : -1;
            }
            return acc;
        }, {} as Record<keyof UserSortParams, SortOrder>);

        // Build MongoDB filter object
        const buildFilter = (filter: Record<string, any>) => {
            const mongoFilter: Record<string, any> = {};
            for (const key in filter) {
                if (typeof filter[key] === 'object') {
                    if (filter[key].hasOwnProperty('min') || filter[key].hasOwnProperty('max')) {
                        mongoFilter[key] = {};
                        if (filter[key].min !== undefined) {
                            mongoFilter[key].$gte = filter[key].min;
                        }
                        if (filter[key].max !== undefined) {
                            mongoFilter[key].$lte = filter[key].max;
                        }
                    } else {
                        mongoFilter[key] = filter[key];
                    }
                } else {
                    mongoFilter[key] = filter[key];
                }
            }
            return mongoFilter;
        };

        try {
            const mongoFilter = buildFilter(filter);
            console.log(mongoFilter)
            const operation = UserModel.find({ age: { '$gte': 18, '$lte': 28 }, gender: 'Male' })
                .sort(sortFields)
                .skip((page - 1) * limit)
                .limit(limit);

            const result = await operation;
            const totalItems = await UserModel.countDocuments(mongoFilter);

            return {
                [UserModel.collection.collectionName]: result,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page
            };
        } catch (error) {
            console.error(`UserRepository - getAll() method error: `, error);
            const prettyError = new PrettyObjectError(`UserRepository - getAll() method error: ${error}`);
            throw prettyError;
        }
    }

    async findById(userId: string) {
        try {
            const result = await UserModel.findById(userId);

            if (!result) {
                throw new NotFoundError();
            }

            return result;
        } catch (error) {
            console.error(`UserRepository - findById() method error: `, error);
            const prettyError = new PrettyObjectError(`UserRepository - findById() method error:  ${error}`);
            throw prettyError;
        }
    }

    async findBySub(sub: string) {
        try {
            const result = await UserModel.findOne({
                $or: [
                    { sub: sub },
                    { googleSub: sub },
                    { facebookSub: sub },
                    { _id: sub }
                ],
            });

            if (!result) {
                throw new NotFoundError();
            }

            return result;
        } catch (error) {
            console.error(`UserRepository - findById() method error: `, error);
            const prettyError = new PrettyObjectError(`UserRepository - findById() method error:  ${error}`);
            throw prettyError;
        }
    }

    async create(newInfo: UserCreationRepoParams) {
        try {
            const result = await UserModel.create(newInfo);

            return result;
        } catch (error) {
            console.error(`UserRepository - findById() method error: `, error);

            // Duplicate Email
            if ((error as MongoError).code === 11000) {
                throw new ResourceConflictError(APP_ERROR_MESSAGE.existedEmail);
            }

            // Validation Error
            if (error instanceof mongoose.Error.ValidationError) {
                const validationErrors: { [key: string]: string } = {};

                // Iterate over the errors object and collect messages
                for (const key in error.errors) {
                    // Here, error.errors[key] can give you each specific validation error
                    validationErrors[key] = error.errors[key].message;
                }

                throw new InvalidInputError({
                    errors: validationErrors  // Now passing the structured errors
                });
            }

            throw error;
        }
    }

    async updateBySub(id: string, updateInfo: UserUpdateRepoParams) {
        try {
            const { id, ...newUpdateInfo } = updateInfo

            const result = await UserModel.findOneAndUpdate({
                $or: [
                    { sub: id },
                    { googleSub: id },
                    { facebookSub: id },
                ],
            }, newUpdateInfo, { new: true });


            if (!result) {
                throw new NotFoundError();
            }

            return result;
        } catch (error) {
            console.error(`UserRepository - updateById() method error: `, error);
            const prettyError = new PrettyObjectError(`UserRepository - updateById() method error:   ${error}`);
            throw prettyError;
        }
    }

    async deleteById(userId: string) {
        try {
            const result = await UserModel.findByIdAndDelete(userId);

            if (!result) {
                throw new NotFoundError();
            }
        } catch (error) {
            console.error(`UserRepository - updateById() method error: `, error);
            const prettyError = new PrettyObjectError(`UserRepository - updateById() method error:   ${error}`);
            throw prettyError;
        }
    }
}

export default new UserRepository();
