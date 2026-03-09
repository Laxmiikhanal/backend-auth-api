import { IUser, UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";

export class AuthRepository {
  async createUser(data: Partial<IUser>): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(data.password!, 10);
    const user = new UserModel({ ...data, password: hashedPassword });
    await user.save();
    return user;
  }

  async getUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async getAllUsers(): Promise<IUser[]> {
    return UserModel.find().sort({ createdAt: -1 });
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return UserModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase().trim() });
  }

  async getUserByResetToken(hashedToken: string): Promise<IUser | null> {
    return UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });
  }
}