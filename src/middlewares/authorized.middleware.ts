import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { IUser } from "../models/user.model";
import { UserRepository } from "../repositories/auth.repository";
import { HttpError } from "../errors/http-error";

let userRepository = new UserRepository();

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any> | IUser;
    }
  }
}

export async function authorizedMiddelWare(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // return directly (cleaner than throw)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, No Bearer Token" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, Missing Token" });
    }

    let decoded: Record<string, any>;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;
    } catch (jwtErr: any) {
      // ✅ important: jwt errors must be 401 not 500
      return res.status(401).json({
        success: false,
        message: "Unauthorized, Invalid Token",
      });
    }

    if (!decoded || !decoded.id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, Invalid Token" });
    }

    const user = await userRepository.getUserById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, User Not Found" });
    }

    req.user = user;
    return next();
  } catch (err: any) {
    // keep HttpError behavior, but default to 401 not 500 for auth middleware
    const status = err?.statusCode || 401;
    return res.status(status).json({
      success: false,
      message: err?.message || "Unauthorized",
    });
  }
}

export async function adminMiddelware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, User Not Found" });
    }

    if ((req.user as any).role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden, Admins Only" });
    }

    return next();
  } catch (err: any) {
    return res.status(err?.statusCode || 500).json({
      success: false,
      message: err?.message || "Unauthorized",
    });
  }
}
