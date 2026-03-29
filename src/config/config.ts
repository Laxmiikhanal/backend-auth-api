// src/config.ts
import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5051;
export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/blossom_auth";
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export const EMAIL_USER = process.env.EMAIL_USER || "";
export const EMAIL_PASS = process.env.EMAIL_PASS || "";