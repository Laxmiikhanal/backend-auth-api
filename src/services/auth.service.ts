// import z from "zod";
// import bcryptjs from "bcryptjs";
// import jwt from "jsonwebtoken";

// import { UserRepository } from "../repositories/auth.repository";
// import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
// import { HttpError } from "../errors/http-error";
// import { JWT_SECRET } from "../config";

// type CreateUserInput = z.infer<typeof CreateUserDto>;
// type LoginUserInput = z.infer<typeof LoginUserDto>;
// type UpdateUserInput = z.infer<typeof UpdateUserDto>;

// const userRepository = new UserRepository();

// const normalizeEmail = (email: any) =>
//   typeof email === "string" ? email.trim().toLowerCase().replace(/\s+/g, "") : "";

// export class AuthService {
//   private sanitizeUser(user: any) {
//     if (!user) return user;
//     const obj = typeof user.toObject === "function" ? user.toObject() : user;
//     delete obj.password;
//     return obj;
//   }

//   // ---------------- REGISTER ----------------
//   async registerUser(data: CreateUserInput & { imageUrl?: string; role?: "user" | "admin" }) {
//     const email = normalizeEmail(data.email);

//     const emailExists = await userRepository.getUserByEmail(email);
//     if (emailExists) throw new HttpError(409, "Email already exists");

//     const hashedPassword = await bcryptjs.hash(data.password, 10);

//     const payload: any = {
//       firstName: data.firstName,
//       lastName: data.lastName,
//       email,
//       password: hashedPassword,
//       role: data.role || "user",
//       imageUrl: data.imageUrl || "",
//     };

//     const newUser = await userRepository.createUser(payload);
//     return this.sanitizeUser(newUser);
//   }

//   // ---------------- LOGIN ----------------
//   async loginUser(data: LoginUserInput) {
//     const email = normalizeEmail(data.email);

//     const user = await userRepository.getUserByEmail(email);
//     if (!user) throw new HttpError(404, "User not found");

//     const validPassword = await bcryptjs.compare(data.password, user.password);
//     if (!validPassword) throw new HttpError(401, "Invalid credentials");

//     const payload = {
//       id: user._id,
//       email: user.email,
//       role: user.role,
//     };

//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

//     // IMPORTANT: service returns { token, user }
//     return { token, user: this.sanitizeUser(user) };
//   }

//   // ---------------- WHOAMI ----------------
//   async getUserById(userId: string) {
//     if (!userId) throw new HttpError(400, "User ID is required");

//     const user = await userRepository.getUserById(userId);
//     if (!user) throw new HttpError(404, "User not found");

//     return this.sanitizeUser(user);
//   }

//   // ---------------- UPDATE SELF / ADMIN ----------------
//   async updateUser(userId: string, data: UpdateUserInput) {
//     const user = await userRepository.getUserById(userId);
//     if (!user) throw new HttpError(404, "User not found");

//     const updatePayload: any = { ...data };

//     // email normalize + unique check
//     if (typeof data.email === "string") {
//       const nextEmail = normalizeEmail(data.email);

//       if (nextEmail && nextEmail !== user.email) {
//         const exists = await userRepository.getUserByEmail(nextEmail);
//         if (exists && String(exists._id) !== String(user._id)) {
//           throw new HttpError(409, "Email already exists");
//         }
//         updatePayload.email = nextEmail;
//       } else {
//         delete updatePayload.email;
//       }
//     }

//     // password hash
//     if (data.password) {
//       updatePayload.password = await bcryptjs.hash(data.password, 10);
//     }

//     const updated = await userRepository.updateUserById(userId, updatePayload);
//     if (!updated) throw new HttpError(404, "User not found");

//     return this.sanitizeUser(updated);
//   }
// }

import { UserRepository } from "../repositories/auth.repository";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import z from "zod";
import crypto from "crypto";
import { sendEmail } from "../config/email";

type CreateUserInput = z.infer<typeof CreateUserDto>;
type LoginUserInput = z.infer<typeof LoginUserDto>;
type UpdateUserInput = z.infer<typeof UpdateUserDto>;

const userRepository = new UserRepository();

const normalizeEmail = (email: any) =>
  typeof email === "string" ? email.trim().toLowerCase().replace(/\s+/g, "") : "";

export class AuthService {
  private sanitizeUser(user: any) {
    if (!user) return user;
    const obj = typeof user.toObject === "function" ? user.toObject() : user;
    delete obj.password;
    return obj;
  }

  async registerUser(
    data: CreateUserInput & { imageUrl?: string; role?: "user" | "admin" }
  ) {
    const email = normalizeEmail(data.email);

    const emailExists = await userRepository.getUserByEmail(email);
    if (emailExists) throw new HttpError(409, "Email already exists");

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const payload: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      password: hashedPassword,
      role: data.role || "user",
      imageUrl: data.imageUrl || "",
      previousEmails: [],
    };

    const newUser = await userRepository.createUser(payload);
    return this.sanitizeUser(newUser);
  }

  async loginUser(data: LoginUserInput) {
    const email = normalizeEmail(data.email);

    // ✅ now searches current OR previous emails (repo does it)
    const user = await userRepository.getUserByEmail(email);
    if (!user) throw new HttpError(404, "User not found");

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) throw new HttpError(401, "Invalid credentials");

    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return { token, user: this.sanitizeUser(user) };
  }

  async getUserById(userId: string) {
    if (!userId) throw new HttpError(400, "User ID is required");

    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    return this.sanitizeUser(user);
  }

  // ✅ THE IMPORTANT FIX: when changing email, keep old email in previousEmails
  async updateUser(userId: string, data: UpdateUserInput) {
    const user: any = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    const updatePayload: any = { ...data };

    if (typeof data.email === "string") {
      const nextEmail = normalizeEmail(data.email);

      if (nextEmail && nextEmail !== user.email) {
        const exists: any = await userRepository.getUserByEmail(nextEmail);
        if (exists && String(exists._id) !== String(user._id)) {
          throw new HttpError(409, "Email already exists");
        }

        // ✅ store old email
        const prev: string[] = Array.isArray(user.previousEmails) ? [...user.previousEmails] : [];
        if (user.email && !prev.includes(user.email)) prev.push(user.email);

        // ✅ if switching back to an older email, remove it from previous list
        const cleanedPrev = prev.filter((e) => e !== nextEmail);

        updatePayload.email = nextEmail;
        updatePayload.previousEmails = cleanedPrev;
      } else {
        delete updatePayload.email;
      }
    }

    if (data.password) {
      updatePayload.password = await bcryptjs.hash(data.password, 10);
    }

    delete updatePayload.confirmPassword;

    const updatedUser = await userRepository.updateUserById(userId, updatePayload);
    if (!updatedUser) throw new HttpError(404, "User not found");

    return this.sanitizeUser(updatedUser);
  }

  // password reset (already passing)
  async forgotPassword(emailInput: string) {
    const email = normalizeEmail(emailInput);

    const user = await userRepository.getUserByEmail(email);
    if (!user) return { success: true, message: "If the email exists, reset link has been sent." };

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await userRepository.setResetToken(email, token, expires);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await sendEmail(email, "Reset Password", `<a href="${resetLink}">${resetLink}</a>`);
    console.log("✅ RESET LINK:", resetLink);

    return { success: true, message: "If the email exists, reset link has been sent." };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) throw new HttpError(400, "Token and new password are required");

    const user: any = await userRepository.findByResetToken(token);
    if (!user) throw new HttpError(400, "Invalid or expired token");

    const hashed = await bcryptjs.hash(newPassword, 10);
    await userRepository.updateUserById(user._id.toString(), { password: hashed } as any);
    await userRepository.clearResetToken(user._id.toString());

    return { success: true, message: "Password reset successfully" };
  }
}
