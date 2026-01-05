import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      // Validate request body using Zod DTO
      const parsedData = CreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const userData: CreateUserDTO = parsedData.data;
      const newUser = await userService.createUser(userData);

      // Remove password before sending response
      const userObj =
        typeof (newUser as any).toObject === "function"
          ? (newUser as any).toObject()
          : newUser;

      const { password, ...safeUser } = userObj;

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: safeUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      // Validate login request body using Zod DTO
      const parsedData = LoginUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const loginData: LoginUserDTO = parsedData.data;
      const { token, user } = await userService.loginUser(loginData);

      // Remove password before sending response
      const userObj =
        typeof (user as any).toObject === "function"
          ? (user as any).toObject()
          : user;

      const { password, ...safeUser } = userObj;

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: safeUser,
        token,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
