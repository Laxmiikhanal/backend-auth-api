import { Request, Response, NextFunction } from "express";
import { protect, AuthRequest } from "./auth.middleware";

export const adminOnly = protect(["admin"]);