import { UserRepository } from "../repositories/auth.repository";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import z from "zod";

type CreateUserInput = z.infer<typeof CreateUserDto>;
type LoginUserInput = z.infer<typeof LoginUserDto>;
type UpdateUserInput = z.infer<typeof UpdateUserDto>;

const userRepository = new UserRepository();

export class AuthService {
  // ✅ helper: remove password before returning user
  private sanitizeUser(user: any) {
    if (!user) return user;

    // mongoose doc -> plain object
    const obj = typeof user.toObject === "function" ? user.toObject() : user;

    // remove password
    delete obj.password;

    return obj;
  }

  // ---------------- REGISTER (used by normal register + admin create) ----------------
  async registerUser(data: CreateUserInput & { imageUrl?: string; role?: "user" | "admin" }) {
    const email = (data.email || "").trim().toLowerCase();

    // ✅ email duplicate check
    const emailExists = await userRepository.getUserByEmail(email);
    if (emailExists) {
      throw new HttpError(409, "Email already exists");
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // ✅ include imageUrl if present, allow role if provided (admin create)
    const payload: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      password: hashedPassword,
      role: data.role || ("user" as const),
    };

    if (data.imageUrl) payload.imageUrl = data.imageUrl;

    const newUser = await userRepository.createUser(payload);

    return this.sanitizeUser(newUser);
  }

  // ---------------- LOGIN ----------------
  async loginUser(data: LoginUserInput) {
    const email = (data.email || "").trim().toLowerCase();

    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return { token, user: this.sanitizeUser(user) };
  }

  // ---------------- GET USER BY ID (used by whoami + admin read one) ----------------
  async getUserById(userId: string) {
    if (!userId) {
      throw new HttpError(400, "User ID is required");
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return this.sanitizeUser(user);
  }

  // ---------------- GET ALL USERS (admin) ----------------
  async getAllUsers() {
    const users = await userRepository.getAllUsers();
    return users.map((u) => this.sanitizeUser(u));
  }

  // ---------------- UPDATE SELF (PUT /api/auth/:id) ----------------
  async updateUser(userId: string, data: UpdateUserInput) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    // ✅ normalize email if provided
    const nextEmail = data.email ? data.email.trim().toLowerCase() : undefined;

    // ✅ email duplicate check
    if (nextEmail && nextEmail !== user.email) {
      const emailExists = await userRepository.getUserByEmail(nextEmail);
      if (emailExists) {
        throw new HttpError(409, "Email already exists");
      }
    }

    const updatePayload: any = {
      ...data,
      ...(nextEmail ? { email: nextEmail } : {}),
    };

    // ✅ hash password if updated
    if (data.password) {
      updatePayload.password = await bcryptjs.hash(data.password, 10);
    }

    // just in case any confirmPassword comes from frontend
    delete updatePayload.confirmPassword;

    const updatedUser = await userRepository.updateUserById(userId, updatePayload);
    return this.sanitizeUser(updatedUser);
  }

  // ---------------- UPDATE ANY USER BY ID (admin) ----------------
  async updateUserById(id: string, data: UpdateUserInput & { role?: "user" | "admin" }) {
    if (!id) throw new HttpError(400, "User ID is required");

    const user = await userRepository.getUserById(id);
    if (!user) throw new HttpError(404, "User not found");

    const nextEmail = data.email ? data.email.trim().toLowerCase() : undefined;

    // ✅ email duplicate check
    if (nextEmail && nextEmail !== user.email) {
      const emailExists = await userRepository.getUserByEmail(nextEmail);
      if (emailExists) throw new HttpError(409, "Email already exists");
    }

    const updatePayload: any = {
      ...data,
      ...(nextEmail ? { email: nextEmail } : {}),
    };

    // ✅ hash password if updated
    if (data.password) {
      updatePayload.password = await bcryptjs.hash(data.password, 10);
    }

    delete updatePayload.confirmPassword;

    const updated = await userRepository.updateUserById(id, updatePayload);
    return this.sanitizeUser(updated);
  }

  // ---------------- DELETE USER BY ID (admin) ----------------
  async deleteUserById(id: string) {
    if (!id) throw new HttpError(400, "User ID is required");

    const user = await userRepository.getUserById(id);
    if (!user) throw new HttpError(404, "User not found");

    const ok = await userRepository.deleteUserById(id);
    return ok;
  }
}
