import { UserModel, IUser } from "../models/user.model";

export class UserRepository {

  async getAllUsers(): Promise<IUser[]> {
    return UserModel.find();
  }

  async getUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

}