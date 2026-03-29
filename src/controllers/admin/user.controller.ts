import { Request, Response } from "express";
import { AuthRepository } from "../../repositories/auth.repository";
import { IUser } from "../../models/user.model";

const userRepo = new AuthRepository();

// ---------------- GET ALL USERS ----------------
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users: IUser[] = await userRepo.getAllUsers();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to fetch users" });
  }
};

// ---------------- GET SINGLE USER ----------------
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user: IUser | null = await userRepo.getUserById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to fetch user" });
  }
};

// ---------------- UPDATE USER ----------------
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser: IUser | null = await userRepo.updateUser(req.params.userId, req.body);
    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to update user" });
  }
};

// ---------------- DELETE USER ----------------
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deleted = await userRepo.deleteUser(req.params.userId);
    if (!deleted) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to delete user" });
  }
};