import { IUser, UserModel } from "../models/user.model";
import { HttpError } from "../errors/http-error";

const normalizeEmail = (email: any) =>
  typeof email === "string" ? email.trim().toLowerCase().replace(/\s+/g, "") : "";

const SAFE_SELECT = "-password -resetPasswordToken -resetPasswordExpires";

export class UserRepository {
  async createUser(data: Partial<IUser>): Promise<IUser> {
    try {
      const newUser = new UserModel(data);
      await newUser.save();
      return newUser;
    } catch (error: any) {
      if (error?.code === 11000) {
        const keyValue = error.keyValue || {};
        const field = Object.keys(keyValue)[0] || "field";
        throw new HttpError(409, `${field} already exists`);
      }
      throw error;
    }
  }

  // ✅ IMPORTANT: find by current email OR previousEmails
  async getUserByEmail(email: string): Promise<IUser | null> {
    const e = normalizeEmail(email);
    if (!e) return null;

    return UserModel.findOne({
      $or: [{ email: e }, { previousEmails: { $in: [e] } }],
    });
  }

  async getUserById(id: string): Promise<IUser | null> {
    if (!id) return null;
    return UserModel.findById(id).select(SAFE_SELECT);
  }

  async getAllUsers(): Promise<IUser[]> {
    return UserModel.find().select(SAFE_SELECT);
  }

  async updateUserById(id: string, data: any): Promise<IUser | null> {
    try {
      return await UserModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).select(SAFE_SELECT);
    } catch (error: any) {
      if (error?.code === 11000) {
        const field =
          Object.keys(error?.keyPattern || error?.keyValue || {})[0] || "field";
        throw new HttpError(409, `${field} already exists`);
      }
      throw error;
    }
  }

  async deleteUserById(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  // =========================
  // RESET PASSWORD METHODS
  // =========================

  async setResetToken(email: string, token: string, expires: Date): Promise<IUser | null> {
    const e = normalizeEmail(email);
    if (!e) return null;

    return UserModel.findOneAndUpdate(
      { $or: [{ email: e }, { previousEmails: { $in: [e] } }] },
      { resetPasswordToken: token, resetPasswordExpires: expires },
      { new: true }
    ).select(SAFE_SELECT);
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    if (!token) return null;

    return UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
  }

  async clearResetToken(userId: string): Promise<IUser | null> {
    if (!userId) return null;

    return UserModel.findByIdAndUpdate(
      userId,
      { resetPasswordToken: null, resetPasswordExpires: null },
      { new: true }
    ).select(SAFE_SELECT);
  }
}
