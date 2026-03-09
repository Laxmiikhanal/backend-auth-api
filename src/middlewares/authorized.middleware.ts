import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { AuthRepository } from "../repositories/auth.repository";
import { IUser } from "../models/user.model";
import { HttpError } from "../errors/http-error";

const userRepository = new AuthRepository();

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

function getTokenFromRequest(req: Request): string | null {
  // 1) Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1] || null;
  }

  // 2) Cookie token (token=xxxx)
  // Requires cookie-parser enabled in index.ts
  const cookieToken = (req as any).cookies?.token;
  if (cookieToken) return cookieToken;

  return null;
}

export async function authorizedMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) throw new HttpError(401, "Unauthorized, Missing Token");

    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
    if (!decoded?.id) throw new HttpError(401, "Unauthorized, Invalid Token");

    const user = await userRepository.getUserById(decoded.id);
    if (!user) throw new HttpError(401, "Unauthorized, User Not Found");

    req.user = user;
    return next();
  } catch (err: any) {
    return res.status(err?.statusCode || 401).json({
      success: false,
      message: err?.message || "Unauthorized",
    });
  }
}

export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized, User Not Found");
    if (req.user.role !== "admin") throw new HttpError(403, "Forbidden, Admins Only");
    return next();
  } catch (err: any) {
    return res.status(err?.statusCode || 403).json({
      success: false,
      message: err?.message || "Forbidden",
    });
  }
}