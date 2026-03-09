import { UserRepository } from "../../repositories/auth.repository";
import { CreateUserDto } from "../../dtos/user.dto";
import { HttpError } from "../../errors/http-error";
let userRepository = new UserRepository();
export class AdminUserService {
    async createUser(data: CreateUserDto) {
        // logic to create user by admin, same as auth service register user
    }
    async getAllUsers() {
        // logic to get all users
        let users = await userRepository.getAllUsers();
        // transform data if needed
        return users;
    }
    async getUserById(userId: string) {
        // logic to get user by id
        let user = await userRepository.getUserById(userId);
        if(!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }
}