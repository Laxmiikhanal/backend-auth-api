import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AuthRepository } from "../repositories/auth.repository";
import { JWT_SECRET } from "../config";
import { sendResetEmail } from "../utils/email";

const userRepository = new AuthRepository();

export class AuthService {
  async registerUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const existingUser = await userRepository.getUserByEmail(data.email);
    if (existingUser) throw new Error("User already exists");

    // repository already hashes password
    const user = await userRepository.createUser({
      ...data,
      email: data.email.toLowerCase().trim(),
    });

    return user;
  }

  async loginUser(email: string, password: string) {
    const user = await userRepository.getUserByEmail(email.toLowerCase().trim());
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    return { user, token };
  }

  async getCurrentUser(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new Error("User not found");
    return user;
  }

  // ✅ FORGOT PASSWORD
  async forgotPassword(email: string) {
    const normalizedEmail = (email || "").toLowerCase().trim();
    const user = await userRepository.getUserByEmail(normalizedEmail);

    // do not reveal whether email exists
    if (!user) {
      return { message: "If the email exists, a reset link has been sent." };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    await sendResetEmail(user.email, resetUrl);

    return { message: "Reset link sent to email." };
  }

  // ✅ RESET PASSWORD
  async resetPassword(token: string, password: string) {
    if (!token) throw new Error("Reset token is required");
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userRepository.getUserByResetToken(hashedToken);

    if (!user) throw new Error("Invalid reset token");

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new Error("Token expired");
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { message: "Password reset successful" };
  }
}