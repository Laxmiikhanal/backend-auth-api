import { IUser, UserModel } from "../models/user.model";
import { HttpError } from "../errors/http-error";

export class UserRepository {
  async createUser(data: Partial<IUser>): Promise<IUser> {
    try {
      const newUser = new UserModel(data);
      await newUser.save();
      return newUser;
    } catch (error: any) {
  if (error?.code === 11000) {
    const keyValue = error.keyValue || {};
    const field = Object.keys(keyValue)[0];

    if (field === "email") {
      throw new Error("Email already exists");
    }

    throw new Error(`${field || "Value"} already exists`);
  }

  throw error;
}

  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    if (!email) return null;
    return UserModel.findOne({ email });
  }

  async getUserById(id: string): Promise<IUser | null> {
    if (!id) return null;
    return UserModel.findById(id);
  }

  async getAllUsers(): Promise<IUser[]> {
    return UserModel.find();
  }

  async updateUserById(id: string, data: Partial<IUser>): Promise<IUser | null> {
    try {
      return await UserModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error: any) {
      if (error?.code === 11000) {
        const field = Object.keys(error?.keyPattern || error?.keyValue || {})[0] || "field";
        throw new HttpError(409, `${field} already exists`);
      }
      throw error;
    }
  }

  async deleteUserById(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}