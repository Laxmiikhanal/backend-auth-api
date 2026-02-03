import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../../models/user.model"; // ✅ correct export name

export class AdminUserController {
  // POST /api/admin/users  (multer optional)
  async createUser(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }

      const existing = await UserModel.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

      const user = await UserModel.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || "user",
        imageUrl,
      });

      const safeUser = await UserModel.findById(user._id).select("-password");

      return res.status(201).json({
        success: true,
        data: safeUser,
        message: "User created successfully",
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  // GET /api/admin/users
  async getUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.find().select("-password");
      return res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  // GET /api/admin/users/:id
  async getUserById(req: Request, res: Response) {
    try {
      const user = await UserModel.findById(req.params.id).select("-password");
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      return res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  // PUT /api/admin/users/:id  (multer optional)
  async updateUser(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, role } = req.body;

      const update: any = {};
      if (firstName) update.firstName = firstName;
      if (lastName) update.lastName = lastName;
      if (email) update.email = email.toLowerCase();
      if (role) update.role = role;
      if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;

      const user = await UserModel.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      return res.status(200).json({ success: true, data: user, message: "User updated successfully" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  // DELETE /api/admin/users/:id
  async deleteUser(req: Request, res: Response) {
    try {
      const user = await UserModel.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }
}
