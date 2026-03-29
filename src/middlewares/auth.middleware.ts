// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel, IUser } from "../models/user.model";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = (roles: ("user" | "admin")[] = []) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer "))
        return res.status(401).json({ success: false, message: "Unauthorized" });

      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, ACCESS_SECRET);

      const user = await UserModel.findById(decoded.sub);
      if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

      if (roles.length > 0 && !roles.includes(user.role as "user" | "admin"))
        return res.status(403).json({ success: false, message: "Forbidden" });

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  };
};