import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { UserModel } from "../../models/user.model";

const normalizeEmail = (email: any) =>
  typeof email === "string" ? email.trim().toLowerCase().replace(/\s+/g, "") : "";

const SAFE_SELECT = "-password -resetPasswordToken -resetPasswordExpires";

export class AdminUserController {
  // POST /api/admin/users  (multer optional)
  async createUser(req: Request, res: Response) {
    try {
      const firstName = String(req.body?.firstName || "").trim();
      const lastName = String(req.body?.lastName || "").trim();
      const email = normalizeEmail(req.body?.email);
      const password = String(req.body?.password || "");
      const role = String(req.body?.role || "customer").trim(); // use "admin"/"customer" if you have it

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "firstName, lastName, email, password are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      const existing = await UserModel.findOne({
        $or: [{ email }, { previousEmails: { $in: [email] } }],
      });

      if (existing) {
        return res.status(409).json({ success: false, message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const imageUrl = (req as any).file ? `/uploads/${(req as any).file.filename}` : "";

      const user = await UserModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        imageUrl,
      });

      const safeUser = await UserModel.findById(user._id).select(SAFE_SELECT);

      return res.status(201).json({
        success: true,
        data: safeUser,
        message: "User created successfully",
      });
    } catch (error: any) {
      // duplicate key safety (in case race condition)
      if (error?.code === 11000) {
        return res.status(409).json({ success: false, message: "Email already exists" });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // GET /api/admin/users?page=1&limit=10
  async getUsers(req: Request, res: Response) {
    try {
      const page = Math.max(parseInt(req.query.page as string) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        UserModel.find()
          .select(SAFE_SELECT)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        UserModel.countDocuments(),
      ]);

      return res.status(200).json({
        success: true,
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // GET /api/admin/users/:id
  async getUserById(req: Request, res: Response) {
    try {
      const id = String(req.params.id || "");
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid id format" });
      }

      const user = await UserModel.findById(id).select(SAFE_SELECT);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      return res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // PUT /api/admin/users/:id  (multer optional)
  async updateUser(req: Request, res: Response) {
    try {
      const id = String(req.params.id || "");
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid id format" });
      }

      const update: any = {};

      if (req.body?.firstName) update.firstName = String(req.body.firstName).trim();
      if (req.body?.lastName) update.lastName = String(req.body.lastName).trim();

      // If changing email: normalize + check duplicates
      if (typeof req.body?.email === "string") {
        const newEmail = normalizeEmail(req.body.email);
        if (!newEmail) return res.status(400).json({ success: false, message: "Valid email required" });

        const exists = await UserModel.findOne({
          _id: { $ne: id },
          $or: [{ email: newEmail }, { previousEmails: { $in: [newEmail] } }],
        });

        if (exists) return res.status(409).json({ success: false, message: "Email already exists" });

        update.email = newEmail;
      }

      if (req.body?.role) update.role = String(req.body.role).trim();

      // Admin can update password (hash)
      if (typeof req.body?.password === "string" && req.body.password.trim()) {
        const pw = String(req.body.password);
        if (pw.length < 6) {
          return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }
        update.password = await bcrypt.hash(pw, 10);
      }

      if ((req as any).file) update.imageUrl = `/uploads/${(req as any).file.filename}`;

      const user = await UserModel.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
      }).select(SAFE_SELECT);

      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      return res.status(200).json({
        success: true,
        data: user,
        message: "User updated successfully",
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        return res.status(409).json({ success: false, message: "Email already exists" });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // DELETE /api/admin/users/:id
  async deleteUser(req: Request, res: Response) {
    try {
      const id = String(req.params.id || "");
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid id format" });
      }

      const user = await UserModel.findByIdAndDelete(id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
