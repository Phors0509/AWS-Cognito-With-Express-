import { UserCreateRequest, UserGetAllRequest, UserUpdateRequest } from "@/controllers/types/user/user-request.type";
import { IUser } from "@/database/models/user.model";
import UserRepository from "@/database/repositories/user.repository";

export class UserService {
    async getAllUsers(queries: UserGetAllRequest) {
        try {
            const { page, limit, filter, sort } = queries;

            const newQueries = {
                page,
                limit,
                filter: filter && JSON.parse(filter),
                sort: sort && JSON.parse(sort)
            };
            const result = await UserRepository.getAll(newQueries);

            return result;
        } catch (error) {
            console.error(`UserService - getAllUsers() method error: ${error}`);
            throw error;
        }
    }

    public async createUser(userRequest: UserCreateRequest): Promise<IUser> {
        try {
            const newUser = await UserRepository.create(userRequest);
            return newUser;
        } catch (error) {
            console.log(`UserService - createUser() method error ${error}`);
            throw error;
        }
    }

    public async getUserById(id: string): Promise<IUser> {
        try {
            const user = await UserRepository.findById(id);
            return user;
        } catch (error) {
            console.log(`UserService - getUserById() method error ${error}`);
            throw error;
        }
    }

    public async updateUser(id: string, userRequest: UserUpdateRequest): Promise<IUser> {
        try {
            const updatedUser = await UserRepository.updateBySub(id, userRequest);
            return updatedUser;
        } catch (error) {
            console.log(`UserService - updateUser() method error ${error}`);
            throw error;
        }
    }

    public async deleteUser(id: string): Promise<void> {
        try {
            await UserRepository.deleteById(id);
        } catch (error) {
            console.log(`UserService - deleteUser() method error ${error}`);
            throw error;
        }
    }
}

export default new UserService();