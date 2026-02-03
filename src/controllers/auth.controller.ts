import { AuthService } from "../services/auth.service";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { Request, Response } from "express";

const authService = new AuthService();

export class AuthController {
  // ---------- aliases ----------
  async register(req: Request, res: Response) {
    return this.registerUser(req, res);
  }

  async login(req: Request, res: Response) {
    return this.loginUser(req, res);
  }

  async whoami(req: Request, res: Response) {
    return this.getUserProfile(req, res);
  }

  async update(req: Request, res: Response) {
    return this.updateUser(req, res);
  }

  // ---------- REGISTER ----------
  async registerUser(req: Request, res: Response) {
    try {
      const parsed = CreateUserDto.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues.map((i) => i.message).join(", "),
        });
      }

      const data: any = parsed.data;

      // image upload optional
      if ((req as any).file) {
        data.imageUrl = `/uploads/${(req as any).file.filename}`;
      }

      const newUser = await authService.registerUser(data);

      return res.status(201).json({
        success: true,
        data: newUser,
        message: "Registered Success",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------- LOGIN ----------
  async loginUser(req: Request, res: Response) {
    try {
      const parsed = LoginUserDto.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues.map((i) => i.message).join(", "),
        });
      }

      const { token, user } = await authService.loginUser(parsed.data);

      return res.status(200).json({
        success: true,
        data: user,
        token,
        message: "Login success",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------- WHOAMI ----------
  async getUserProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await authService.getUserById(userId);

      return res.status(200).json({
        success: true,
        data: user,
        message: "User profile fetched successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ✅ REQUIRED BY SPRINT: POST /api/auth/user (admin creates user)
  async createUser(req: Request, res: Response) {
    try {
      const loggedUser = (req as any).user;

      if (!loggedUser?._id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // MUST be admin (route also should enforce adminMiddelware)
      if (loggedUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Admin only",
        });
      }

      const parsed = CreateUserDto.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues.map((i) => i.message).join(", "),
        });
      }

      const data: any = parsed.data;

      // image upload optional
      if ((req as any).file) {
        data.imageUrl = `/uploads/${(req as any).file.filename}`;
      }

      // reuse register logic in service
      const newUser = await authService.registerUser(data);

      return res.status(201).json({
        success: true,
        data: newUser,
        message: "User created successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ✅ REQUIRED BY SPRINT: PUT /api/auth/:id (logged user updates self; admin can update anyone)
  async updateUser(req: Request, res: Response) {
    try {
      const loggedId = (req as any).user?._id;
      const loggedRole = (req as any).user?.role;

      if (!loggedId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const targetId = req.params.id; // ✅ uses :id from route

      // allow self OR admin
      if (targetId !== loggedId && loggedRole !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const parsed = UpdateUserDto.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues.map((i) => i.message).join(", "),
        });
      }

      const data: any = parsed.data;

      // image upload optional
      if ((req as any).file) {
        data.imageUrl = `/uploads/${(req as any).file.filename}`;
      }

      const updatedUser = await authService.updateUser(targetId, data);

      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
