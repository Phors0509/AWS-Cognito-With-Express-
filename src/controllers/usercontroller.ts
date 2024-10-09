import { Body, Controller, Delete, Get, Middlewares, Path, Post, Put, Queries, Route, SuccessResponse } from "tsoa";
import { UserCreateRequest, UserGetAllRequest, UserUpdateRequest } from "./types/user/user-request.type";
import UserService from "@/services/user.service";
import validateRequest from "@/middlewares/validateRequest";
import userCreateSchema from "@/schema/userCreateSchema";
import { UserPaginatedResponse, UserResponse } from "./types/user/user-reponse.type";

@Route("users")
export class UserController extends Controller {
    // Get all users
    @SuccessResponse("200", "OK")
    @Get()
    public async getAllUsers(
        @Queries() queries: UserGetAllRequest
    ): Promise<UserPaginatedResponse> {
        try {
            const response = await UserService.getAllUsers(queries);

            return {
                message: "success",
                data: response
            };
        } catch (error) {
            console.error(`UserController - getAllUsers() method error: ${error}`);
            throw error;
        }
    }

    // Get a user by id
    @SuccessResponse("200", "OK")
    @Get("{id}")
    public async getUserByID(@Path() id: string): Promise<UserResponse> {
        try {
            const user = await UserService.getUserById(id);
            return {
                message: "Success",
                data: user
            };
        } catch (error) {
            console.log("UserController - getUserByID() method error", error);
            throw error;
        }
    }

    // Create a new user
    @Post()
    @SuccessResponse("201", "Created Successfully")
    @Middlewares(validateRequest(userCreateSchema))
    public async createUser(@Body() requestBody: UserCreateRequest): Promise<UserResponse> {
        try {
            const newUser = await UserService.createUser(requestBody);
            return {
                message: "success",
                data: {
                    name: newUser.name,
                    email: newUser.email,
                    age: newUser.age,
                    gender: newUser.gender,
                    password: newUser.password,
                    sub: newUser.sub,
                    googleSub: newUser.googleSub,
                    facebookSub: newUser.facebookSub
                }
            };
        } catch (error) {
            console.log("UserController - createUser() method error", error);
            throw error;
        }
    }

    // Update a user
    @SuccessResponse("204", "Updated Successfully")
    @Put("{id}")
    public async updateUser(@Path() id: string, @Body() requestBody: UserUpdateRequest): Promise<UserResponse> {
        try {
            const updatedUser = await UserService.updateUser(id, requestBody);
            return { message: "Success", data: updatedUser };
        } catch (error) {
            console.log("UserController - updateUser() method error", error);
            throw error;
        }
    }

    // Delete a user
    @SuccessResponse("204", "Deleted Successfully")
    @Delete("{id}")
    public async deleteUser(@Path() id: string): Promise<void> {
        try {
            await UserService.deleteUser(id);
        } catch (error) {
            console.log("UserController - deleteUser() method error", error);
            throw error;
        }
    }
}