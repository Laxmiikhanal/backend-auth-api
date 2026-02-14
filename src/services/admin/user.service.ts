import bcrypt from "bcryptjs";
import { UserRepository } from "../../repositories/auth.repository";
import { HttpError } from "../../errors/http-error";

const normalizeEmail = (email: any) =>
  typeof email === "string" ? email.trim().toLowerCase().replace(/\s+/g, "") : "";

type CreateAdminUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: "user" | "admin";
  imageUrl?: string;
};

export class AdminUserService {
  private userRepo = new UserRepository();

  async createUser(payload: CreateAdminUserPayload) {
    const firstName = String(payload.firstName || "").trim();
    const lastName = String(payload.lastName || "").trim();
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");
    const role: "user" | "admin" = payload.role === "admin" ? "admin" : "user";
    const imageUrl = String(payload.imageUrl || "");

    if (!firstName || !lastName || !email || !password) {
      throw new HttpError(400, "All fields are required");
    }

    if (password.length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters");
    }

    const exists = await this.userRepo.getUserByEmail(email);
    if (exists) {
      throw new HttpError(409, "Email already exists");
    }

    const hashed = await bcrypt.hash(password, 10);

    const created = await this.userRepo.createUser({
      firstName,
      lastName,
      email,
      password: hashed,
      role,
      imageUrl,
    });

    // sanitize response
    const obj: any =
      typeof (created as any)?.toObject === "function" ? (created as any).toObject() : created;

    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;

    return obj;
  }

  async getAllUsers() {
    const users = await this.userRepo.getAllUsers();

    return users.map((u: any) => {
      const obj = typeof u?.toObject === "function" ? u.toObject() : u;
      delete obj.password;
      delete obj.resetPasswordToken;
      delete obj.resetPasswordExpires;
      return obj;
    });
  }

  async getUserById(userId: string) {
    const user = await this.userRepo.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    const obj: any = typeof (user as any)?.toObject === "function" ? (user as any).toObject() : user;
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;

    return obj;
  }
}
