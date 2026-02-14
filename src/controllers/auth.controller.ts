// // import { Request, Response } from "express";
// // import crypto from "crypto";
// // import bcrypt from "bcryptjs";
// // import mongoose from "mongoose";

// // import { AuthService } from "../services/auth.service";
// // import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
// // import { UserModel } from "../models/user.model";
// // import { sendEmail } from "../config/email";
// // import { JWT_SECRET } from "../config"; // keep if used elsewhere

// // const authService = new AuthService();

// // // normalize email safely (trim + lowercase + remove all whitespace)
// // const normalizeEmail = (email: any) =>
// //   typeof email === "string" ? email.trim().toLowerCase().replace(/\s+/g, "") : email;

// // export class AuthController {
// //   // ---------- aliases ----------
// //   async register(req: Request, res: Response) {
// //     return this.registerUser(req, res);
// //   }

// //   async login(req: Request, res: Response) {
// //     return this.loginUser(req, res);
// //   }

// //   async whoami(req: Request, res: Response) {
// //     return this.getUserProfile(req, res);
// //   }

// //   async update(req: Request, res: Response) {
// //     return this.updateUser(req, res);
// //   }

// //   // ---------- REGISTER ----------
// //   async registerUser(req: Request, res: Response) {
// //     try {
// //       (req.body as any).email = normalizeEmail((req.body as any).email);

// //       const parsed = CreateUserDto.safeParse(req.body);
// //       if (!parsed.success) {
// //         return res.status(400).json({
// //           success: false,
// //           message: parsed.error.issues.map((i) => i.message).join(", "),
// //         });
// //       }

// //       const data: any = parsed.data;

// //       if ((req as any).file) {
// //         data.imageUrl = `/uploads/${(req as any).file.filename}`;
// //       }

// //       const newUser = await authService.registerUser(data);

// //       return res.status(201).json({
// //         success: true,
// //         data: newUser,
// //         message: "Registered Success",
// //       });
// //     } catch (error: any) {
// //       if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
// //         return res.status(409).json({ success: false, message: "Email already exists" });
// //       }

// //       return res.status(error.statusCode || 500).json({
// //         success: false,
// //         message: error.message || "Internal Server Error",
// //       });
// //     }
// //   }

// //   // ---------- LOGIN (✅ MUST RETURN token + data._id for tests) ----------
// //   async loginUser(req: Request, res: Response) {
// //     try {
// //       (req.body as any).email = normalizeEmail((req.body as any).email);

// //       const parsed = LoginUserDto.safeParse(req.body);
// //       if (!parsed.success) {
// //         return res.status(400).json({
// //           success: false,
// //           message: parsed.error.issues.map((i) => i.message).join(", "),
// //         });
// //       }

// //       const result: any = await authService.loginUser(parsed.data);

// //       const token = result?.token;
// //       let userObj: any = result?.user;

// //       // ensure plain object
// //       if (userObj && typeof userObj.toObject === "function") {
// //         userObj = userObj.toObject();
// //       }

// //       // safety: if user missing _id (shouldn't happen, but protects tests)
// //       if (token && userObj && !userObj._id && userObj.email) {
// //         const fromDb = await UserModel.findOne({ email: userObj.email }).select("-password");
// //         if (fromDb) userObj = fromDb.toObject();
// //       }

// //       if (!token || !userObj || !userObj._id) {
// //         return res.status(500).json({
// //           success: false,
// //           message: "Login response invalid (missing token/user/_id)",
// //         });
// //       }

// //       delete userObj.password;

// //       return res.status(200).json({
// //         success: true,
// //         token,          // ✅ test uses loginRes.body.token
// //         data: userObj,  // ✅ test uses loginRes.body.data._id
// //         user: userObj,  // ✅ keep for other code compatibility
// //         message: "Login success",
// //       });
// //     } catch (error: any) {
// //       return res.status(error.statusCode || 500).json({
// //         success: false,
// //         message: error.message || "Internal Server Error",
// //       });
// //     }
// //   }

// //   // ---------- WHOAMI ----------
// //   async getUserProfile(req: Request, res: Response) {
// //     try {
// //       const userId = (req as any).user?._id || (req as any).user?.id;

// //       if (!userId) {
// //         return res.status(401).json({ success: false, message: "Unauthorized" });
// //       }

// //       const user = await authService.getUserById(String(userId));

// //       return res.status(200).json({
// //         success: true,
// //         data: user,
// //         message: "User profile fetched successfully",
// //       });
// //     } catch (error: any) {
// //       return res.status(error.statusCode || 500).json({
// //         success: false,
// //         message: error.message || "Internal Server Error",
// //       });
// //     }
// //   }

// //   // ✅ REQUIRED: POST /api/auth/user (admin creates user)
// //   async createUser(req: Request, res: Response) {
// //     try {
// //       const loggedUser = (req as any).user;

// //       if (!loggedUser?._id) {
// //         return res.status(401).json({ success: false, message: "Unauthorized" });
// //       }

// //       if (loggedUser.role !== "admin") {
// //         return res.status(403).json({ success: false, message: "Forbidden: Admin only" });
// //       }

// //       (req.body as any).email = normalizeEmail((req.body as any).email);

// //       const parsed = CreateUserDto.safeParse(req.body);
// //       if (!parsed.success) {
// //         return res.status(400).json({
// //           success: false,
// //           message: parsed.error.issues.map((i) => i.message).join(", "),
// //         });
// //       }

// //       const data: any = parsed.data;

// //       if ((req as any).file) {
// //         data.imageUrl = `/uploads/${(req as any).file.filename}`;
// //       }

// //       if (req.body?.role) data.role = req.body.role;

// //       const newUser = await authService.registerUser(data);

// //       return res.status(201).json({
// //         success: true,
// //         data: newUser,
// //         message: "User created successfully",
// //       });
// //     } catch (error: any) {
// //       if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
// //         return res.status(409).json({ success: false, message: "Email already exists" });
// //       }

// //       return res.status(error.statusCode || 500).json({
// //         success: false,
// //         message: error.message || "Internal Server Error",
// //       });
// //     }
// //   }

// //   // ✅ REQUIRED: PUT /api/auth/:id (self updates; admin updates anyone)
// //   async updateUser(req: Request, res: Response) {
// //     try {
// //       const loggedIdRaw = (req as any).user?._id || (req as any).user?.id;
// //       const loggedId = loggedIdRaw ? String(loggedIdRaw) : null;
// //       const loggedRole = (req as any).user?.role;

// //       if (!loggedId) {
// //         return res.status(401).json({ success: false, message: "Unauthorized" });
// //       }

// //       const targetId = String(req.params.id || "");

// //       if (!mongoose.Types.ObjectId.isValid(targetId)) {
// //         return res.status(400).json({ success: false, message: "Invalid id format" });
// //       }

// //       if (loggedRole !== "admin" && loggedId !== targetId) {
// //         return res.status(403).json({ success: false, message: "Forbidden" });
// //       }

// //       if (typeof (req.body as any).email === "string") {
// //         (req.body as any).email = normalizeEmail((req.body as any).email);
// //       }

// //       const parsed = UpdateUserDto.safeParse(req.body);
// //       if (!parsed.success) {
// //         return res.status(400).json({
// //           success: false,
// //           message: parsed.error.issues.map((i) => i.message).join(", "),
// //         });
// //       }

// //       const data: any = parsed.data;

// //       if ((req as any).file) {
// //         data.imageUrl = `/uploads/${(req as any).file.filename}`;
// //       }

// //       const updatedUser = await authService.updateUser(targetId, data);

// //       return res.status(200).json({
// //         success: true,
// //         data: updatedUser,
// //         message: "User updated successfully",
// //       });
// //     } catch (error: any) {
// //       if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
// //         return res.status(409).json({ success: false, message: "Email already exists" });
// //       }

// //       return res.status(error.statusCode || 500).json({
// //         success: false,
// //         message: error.message || "Internal Server Error",
// //       });
// //     }
// //   }

// //   // ✅ POST /api/auth/forgot-password
// //   async forgotPassword(req: Request, res: Response) {
// //     try {
// //       const email = normalizeEmail(req.body?.email);

// //       if (!email) {
// //         return res.status(400).json({ success: false, message: "Email is required" });
// //       }

// //       const user = await UserModel.findOne({ email });

// //       // security: always 200
// //       if (!user) {
// //         return res.status(200).json({
// //           success: true,
// //           message: "If the email exists, reset link has been sent.",
// //         });
// //       }

// //       const resetToken = crypto.randomBytes(32).toString("hex");
// //       const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

// //       (user as any).resetPasswordToken = hashedToken;
// //       (user as any).resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
// //       await user.save();

// //       const baseUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
// //       const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

// //       console.log("✅ RESET LINK:", resetLink);

// //       const html = `
// //         <h2>Reset Password</h2>
// //         <p>Click below to reset your password (valid for 15 minutes):</p>
// //         <a href="${resetLink}">${resetLink}</a>
// //       `;

// //       await sendEmail(user.email, "Reset your password", html);

// //       return res.status(200).json({
// //         success: true,
// //         message: "Reset link has been sent to email.",
// //       });
// //     } catch (error: any) {
// //       console.error("forgotPassword error:", error);
// //       return res.status(500).json({
// //         success: false,
// //         message: error.message || "Internal Server Error",
// //       });
// //     }
// //   }

// //   // ✅ POST /api/auth/reset-password
// //   async resetPassword(req: Request, res: Response) {
// //     try {
// //       const token = String(req.body?.token || "").trim();
// //       const password = String(req.body?.password || "").trim();

// //       if (!token || !password) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Token and password are required",
// //         });
// //       }

// //       const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

// //       const user = await UserModel.findOne({
// //         resetPasswordToken: hashedToken,
// //         resetPasswordExpires: { $gt: new Date() },
// //       });

// //       if (!user) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "Invalid or expired token",
// //         });
// //       }

// //       user.password = await bcrypt.hash(password, 10);
// //       (user as any).resetPasswordToken = null;
// //       (user as any).resetPasswordExpires = null;
// //       await user.save();

// //       return res.status(200).json({
// //         success: true,
// //         message: "Password reset successful",
// //       });
// //     } catch (error: any) {
// //       console.error("resetPassword error:", error);
// //       return res.status(500).json({
// //         success: false,
// //         message: error.message || "Internal Server Error",
// //       });
// //     }
// //   }
// // }

// import { Request, Response } from "express";
// import crypto from "crypto";
// import bcrypt from "bcryptjs";
// import mongoose from "mongoose";

// import { AuthService } from "../services/auth.service";
// import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
// import { UserModel } from "../models/user.model";
// import { sendEmail } from "../config/email";

// const authService = new AuthService();

// const normalizeEmail = (email: any) =>
//   typeof email === "string" ? email.trim().toLowerCase().replace(/\s+/g, "") : email;

// export class AuthController {
//   async register(req: Request, res: Response) {
//     return this.registerUser(req, res);
//   }
//   async login(req: Request, res: Response) {
//     return this.loginUser(req, res);
//   }
//   async whoami(req: Request, res: Response) {
//     return this.getUserProfile(req, res);
//   }
//   async update(req: Request, res: Response) {
//     return this.updateUser(req, res);
//   }

//   async registerUser(req: Request, res: Response) {
//     try {
//       (req.body as any).email = normalizeEmail((req.body as any).email);

//       const parsed = CreateUserDto.safeParse(req.body);
//       if (!parsed.success) {
//         return res.status(400).json({
//           success: false,
//           message: parsed.error.issues.map((i) => i.message).join(", "),
//         });
//       }

//       const data: any = parsed.data;

//       if ((req as any).file) data.imageUrl = `/uploads/${(req as any).file.filename}`;

//       const newUser = await authService.registerUser(data);

//       return res.status(201).json({
//         success: true,
//         data: newUser,
//         message: "Registered Success",
//       });
//     } catch (error: any) {
//       if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
//         return res.status(409).json({ success: false, message: "Email already exists" });
//       }
//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // ✅ login ALWAYS returns: { token, data: { _id... } }
//   async loginUser(req: Request, res: Response) {
//     try {
//       (req.body as any).email = normalizeEmail((req.body as any).email);

//       const parsed = LoginUserDto.safeParse(req.body);
//       if (!parsed.success) {
//         return res.status(400).json({
//           success: false,
//           message: parsed.error.issues.map((i) => i.message).join(", "),
//         });
//       }

//       const result: any = await authService.loginUser(parsed.data);

//       const token = result?.token;
//       const userObj = result?.user; // service returns sanitized user

//       if (!token || !userObj?._id) {
//         return res.status(500).json({
//           success: false,
//           message: "Login response invalid",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         token,
//         data: userObj,  // ✅ tests use loginRes.body.data._id
//         message: "Login success",
//       });
//     } catch (error: any) {
//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   async getUserProfile(req: Request, res: Response) {
//     try {
//       const userId = (req as any).user?._id || (req as any).user?.id;
//       if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

//       const user = await authService.getUserById(String(userId));

//       return res.status(200).json({
//         success: true,
//         data: user,
//         message: "User profile fetched successfully",
//       });
//     } catch (error: any) {
//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   async createUser(req: Request, res: Response) {
//     try {
//       const loggedUser = (req as any).user;
//       if (!loggedUser?._id) return res.status(401).json({ success: false, message: "Unauthorized" });
//       if (loggedUser.role !== "admin")
//         return res.status(403).json({ success: false, message: "Forbidden: Admin only" });

//       (req.body as any).email = normalizeEmail((req.body as any).email);

//       const parsed = CreateUserDto.safeParse(req.body);
//       if (!parsed.success) {
//         return res.status(400).json({
//           success: false,
//           message: parsed.error.issues.map((i) => i.message).join(", "),
//         });
//       }

//       const data: any = parsed.data;
//       if ((req as any).file) data.imageUrl = `/uploads/${(req as any).file.filename}`;
//       if (req.body?.role) data.role = req.body.role;

//       const newUser = await authService.registerUser(data);

//       return res.status(201).json({
//         success: true,
//         data: newUser,
//         message: "User created successfully",
//       });
//     } catch (error: any) {
//       if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
//         return res.status(409).json({ success: false, message: "Email already exists" });
//       }
//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   async updateUser(req: Request, res: Response) {
//     try {
//       const loggedIdRaw = (req as any).user?._id || (req as any).user?.id;
//       const loggedId = loggedIdRaw ? String(loggedIdRaw) : null;
//       const loggedRole = (req as any).user?.role;

//       if (!loggedId) return res.status(401).json({ success: false, message: "Unauthorized" });

//       const targetId = String(req.params.id || "");
//       if (!mongoose.Types.ObjectId.isValid(targetId)) {
//         return res.status(400).json({ success: false, message: "Invalid id format" });
//       }

//       if (loggedRole !== "admin" && loggedId !== targetId) {
//         return res.status(403).json({ success: false, message: "Forbidden" });
//       }

//       if (typeof (req.body as any).email === "string") {
//         (req.body as any).email = normalizeEmail((req.body as any).email);
//       }

//       const parsed = UpdateUserDto.safeParse(req.body);
//       if (!parsed.success) {
//         return res.status(400).json({
//           success: false,
//           message: parsed.error.issues.map((i) => i.message).join(", "),
//         });
//       }

//       const data: any = parsed.data;
//       if ((req as any).file) data.imageUrl = `/uploads/${(req as any).file.filename}`;

//       const updatedUser = await authService.updateUser(targetId, data);

//       return res.status(200).json({
//         success: true,
//         data: updatedUser,
//         message: "User updated successfully",
//       });
//     } catch (error: any) {
//       if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
//         return res.status(409).json({ success: false, message: "Email already exists" });
//       }
//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   async forgotPassword(req: Request, res: Response) {
//     try {
//       const email = normalizeEmail(req.body?.email);
//       if (!email) return res.status(400).json({ success: false, message: "Email is required" });

//       const user = await UserModel.findOne({ email });

//       if (!user) {
//         return res.status(200).json({
//           success: true,
//           message: "If the email exists, reset link has been sent.",
//         });
//       }

//       const resetToken = crypto.randomBytes(32).toString("hex");
//       const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

//       (user as any).resetPasswordToken = hashedToken;
//       (user as any).resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
//       await user.save();

//       const baseUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
//       const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

//       console.log("✅ RESET LINK:", resetLink);

//       const html = `<a href="${resetLink}">${resetLink}</a>`;
//       await sendEmail(user.email, "Reset your password", html);

//       return res.status(200).json({ success: true, message: "Reset link has been sent to email." });
//     } catch (error: any) {
//       return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
//     }
//   }

//   async resetPassword(req: Request, res: Response) {
//     try {
//       const token = String(req.body?.token || "").trim();
//       const password = String(req.body?.password || "").trim();

//       if (!token || !password) {
//         return res.status(400).json({ success: false, message: "Token and password are required" });
//       }

//       const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//       const user = await UserModel.findOne({
//         resetPasswordToken: hashedToken,
//         resetPasswordExpires: { $gt: new Date() },
//       });

//       if (!user) {
//         return res.status(400).json({ success: false, message: "Invalid or expired token" });
//       }

//       user.password = await bcrypt.hash(password, 10);
//       (user as any).resetPasswordToken = null;
//       (user as any).resetPasswordExpires = null;
//       await user.save();

//       return res.status(200).json({ success: true, message: "Password reset successful" });
//     } catch (error: any) {
//       return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
//     }
//   }
// }



// import { Request, Response } from "express";
// import crypto from "crypto";
// import bcrypt from "bcryptjs";
// import mongoose from "mongoose";

// import { AuthService } from "../services/auth.service";
// import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
// import { UserModel } from "../models/user.model";
// import { sendEmail } from "../config/email";
// import { JWT_SECRET } from "../config"; // keep if used elsewhere

// const authService = new AuthService();

// // normalize email safely (trim + lowercase + remove all whitespace)
// const normalizeEmail = (email: any) =>
//   typeof email === "string" ? email.trim().toLowerCase().replace(/\s+/g, "") : email;

// export class AuthController {
//   // ---------- aliases ----------
//   async register(req: Request, res: Response) {
//     return this.registerUser(req, res);
//   }

//   async login(req: Request, res: Response) {
//     return this.loginUser(req, res);
//   }

//   async whoami(req: Request, res: Response) {
//     return this.getUserProfile(req, res);
//   }

//   async update(req: Request, res: Response) {
//     return this.updateUser(req, res);
//   }

//   // ---------- REGISTER ----------
//   async registerUser(req: Request, res: Response) {
//     try {
//       (req.body as any).email = normalizeEmail((req.body as any).email);

//       const parsed = CreateUserDto.safeParse(req.body);
//       if (!parsed.success) {
//         return res.status(400).json({
//           success: false,
//           message: parsed.error.issues.map((i) => i.message).join(", "),
//         });
//       }

//       const data: any = parsed.data;

//       if ((req as any).file) {
//         data.imageUrl = `/uploads/${(req as any).file.filename}`;
//       }

//       const newUser = await authService.registerUser(data);

//       return res.status(201).json({
//         success: true,
//         data: newUser,
//         message: "Registered Success",
//       });
//     } catch (error: any) {
//       if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
//         return res.status(409).json({ success: false, message: "Email already exists" });
//       }

//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // ---------- LOGIN (✅ MUST RETURN token + data._id for tests) ----------
//   async loginUser(req: Request, res: Response) {
//     try {
//       (req.body as any).email = normalizeEmail((req.body as any).email);

//       const parsed = LoginUserDto.safeParse(req.body);
//       if (!parsed.success) {
//         return res.status(400).json({
//           success: false,
//           message: parsed.error.issues.map((i) => i.message).join(", "),
//         });
//       }

//       const result: any = await authService.loginUser(parsed.data);

//       const token = result?.token;
//       let userObj: any = result?.user;

//       // ensure plain object
//       if (userObj && typeof userObj.toObject === "function") {
//         userObj = userObj.toObject();
//       }

//       // safety: if user missing _id (shouldn't happen, but protects tests)
//       if (token && userObj && !userObj._id && userObj.email) {
//         const fromDb = await UserModel.findOne({ email: userObj.email }).select("-password");
//         if (fromDb) userObj = fromDb.toObject();
//       }

//       if (!token || !userObj || !userObj._id) {
//         return res.status(500).json({
//           success: false,
//           message: "Login response invalid (missing token/user/_id)",
//         });
//       }

//       delete userObj.password;

//       return res.status(200).json({
//         success: true,
//         token,          // ✅ test uses loginRes.body.token
//         data: userObj,  // ✅ test uses loginRes.body.data._id
//         user: userObj,  // ✅ keep for other code compatibility
//         message: "Login success",
//       });
//     } catch (error: any) {
//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // ---------- WHOAMI ----------
//   async getUserProfile(req: Request, res: Response) {
//     try {
//       const userId = (req as any).user?._id || (req as any).user?.id;

//       if (!userId) {
//         return res.status(401).json({ success: false, message: "Unauthorized" });
//       }

//       const user = await authService.getUserById(String(userId));

//       return res.status(200).json({
//         success: true,
//         data: user,
//         message: "User profile fetched successfully",
//       });
//     } catch (error: any) {
//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // ✅ REQUIRED: POST /api/auth/user (admin creates user)
//   async createUser(req: Request, res: Response) {
//     try {
//       const loggedUser = (req as any).user;

//       if (!loggedUser?._id) {
//         return res.status(401).json({ success: false, message: "Unauthorized" });
//       }

//       if (loggedUser.role !== "admin") {
//         return res.status(403).json({ success: false, message: "Forbidden: Admin only" });
//       }

//       (req.body as any).email = normalizeEmail((req.body as any).email);

//       const parsed = CreateUserDto.safeParse(req.body);
//       if (!parsed.success) {
//         return res.status(400).json({
//           success: false,
//           message: parsed.error.issues.map((i) => i.message).join(", "),
//         });
//       }

//       const data: any = parsed.data;

//       if ((req as any).file) {
//         data.imageUrl = `/uploads/${(req as any).file.filename}`;
//       }

//       if (req.body?.role) data.role = req.body.role;

//       const newUser = await authService.registerUser(data);

//       return res.status(201).json({
//         success: true,
//         data: newUser,
//         message: "User created successfully",
//       });
//     } catch (error: any) {
//       if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
//         return res.status(409).json({ success: false, message: "Email already exists" });
//       }

//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // ✅ REQUIRED: PUT /api/auth/:id (self updates; admin updates anyone)
//   async updateUser(req: Request, res: Response) {
//     try {
//       const loggedIdRaw = (req as any).user?._id || (req as any).user?.id;
//       const loggedId = loggedIdRaw ? String(loggedIdRaw) : null;
//       const loggedRole = (req as any).user?.role;

//       if (!loggedId) {
//         return res.status(401).json({ success: false, message: "Unauthorized" });
//       }

//       const targetId = String(req.params.id || "");

//       if (!mongoose.Types.ObjectId.isValid(targetId)) {
//         return res.status(400).json({ success: false, message: "Invalid id format" });
//       }

//       if (loggedRole !== "admin" && loggedId !== targetId) {
//         return res.status(403).json({ success: false, message: "Forbidden" });
//       }

//       if (typeof (req.body as any).email === "string") {
//         (req.body as any).email = normalizeEmail((req.body as any).email);
//       }

//       const parsed = UpdateUserDto.safeParse(req.body);
//       if (!parsed.success) {
//         return res.status(400).json({
//           success: false,
//           message: parsed.error.issues.map((i) => i.message).join(", "),
//         });
//       }

//       const data: any = parsed.data;

//       if ((req as any).file) {
//         data.imageUrl = `/uploads/${(req as any).file.filename}`;
//       }

//       const updatedUser = await authService.updateUser(targetId, data);

//       return res.status(200).json({
//         success: true,
//         data: updatedUser,
//         message: "User updated successfully",
//       });
//     } catch (error: any) {
//       if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
//         return res.status(409).json({ success: false, message: "Email already exists" });
//       }

//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // ✅ POST /api/auth/forgot-password
//   async forgotPassword(req: Request, res: Response) {
//     try {
//       const email = normalizeEmail(req.body?.email);

//       if (!email) {
//         return res.status(400).json({ success: false, message: "Email is required" });
//       }

//       const user = await UserModel.findOne({ email });

//       // security: always 200
//       if (!user) {
//         return res.status(200).json({
//           success: true,
//           message: "If the email exists, reset link has been sent.",
//         });
//       }

//       const resetToken = crypto.randomBytes(32).toString("hex");
//       const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

//       (user as any).resetPasswordToken = hashedToken;
//       (user as any).resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
//       await user.save();

//       const baseUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
//       const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

//       console.log("✅ RESET LINK:", resetLink);

//       const html = `
//         <h2>Reset Password</h2>
//         <p>Click below to reset your password (valid for 15 minutes):</p>
//         <a href="${resetLink}">${resetLink}</a>
//       `;

//       await sendEmail(user.email, "Reset your password", html);

//       return res.status(200).json({
//         success: true,
//         message: "Reset link has been sent to email.",
//       });
//     } catch (error: any) {
//       console.error("forgotPassword error:", error);
//       return res.status(500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }

//   // ✅ POST /api/auth/reset-password
//   async resetPassword(req: Request, res: Response) {
//     try {
//       const token = String(req.body?.token || "").trim();
//       const password = String(req.body?.password || "").trim();

//       if (!token || !password) {
//         return res.status(400).json({
//           success: false,
//           message: "Token and password are required",
//         });
//       }

//       const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//       const user = await UserModel.findOne({
//         resetPasswordToken: hashedToken,
//         resetPasswordExpires: { $gt: new Date() },
//       });

//       if (!user) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid or expired token",
//         });
//       }

//       user.password = await bcrypt.hash(password, 10);
//       (user as any).resetPasswordToken = null;
//       (user as any).resetPasswordExpires = null;
//       await user.save();

//       return res.status(200).json({
//         success: true,
//         message: "Password reset successful",
//       });
//     } catch (error: any) {
//       console.error("resetPassword error:", error);
//       return res.status(500).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//       });
//     }
//   }
// }

import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { AuthService } from "../services/auth.service";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { UserModel } from "../models/user.model";
import { sendEmail } from "../config/email";

const authService = new AuthService();

const normalizeEmail = (email: any) =>
  typeof email === "string" ? email.trim().toLowerCase().replace(/\s+/g, "") : email;

export class AuthController {
  async register(req: Request, res: Response) {
    return this.registerUser(req, res);
  }
  async login(req: Request, res: Response) {
    return this.loginUser(req, res);
  }
  async whoami(req: Request, res: Response) {
    return this.getUserProfile(req, res);
  }
  async update(req: Request, res: Response) {
    return this.updateUser(req, res);
  }

  async registerUser(req: Request, res: Response) {
    try {
      (req.body as any).email = normalizeEmail((req.body as any).email);

      const parsed = CreateUserDto.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues.map((i) => i.message).join(", "),
        });
      }

      const data: any = parsed.data;

      if ((req as any).file) data.imageUrl = `/uploads/${(req as any).file.filename}`;

      const newUser = await authService.registerUser(data);

      return res.status(201).json({
        success: true,
        data: newUser,
        message: "Registered Success",
      });
    } catch (error: any) {
      if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
        return res.status(409).json({ success: false, message: "Email already exists" });
      }
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ✅ login ALWAYS returns: { token, data: { _id... } }
  async loginUser(req: Request, res: Response) {
    try {
      (req.body as any).email = normalizeEmail((req.body as any).email);

      const parsed = LoginUserDto.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues.map((i) => i.message).join(", "),
        });
      }

      const result: any = await authService.loginUser(parsed.data);

      const token = result?.token;
      const userObj = result?.user; // service returns sanitized user

      if (!token || !userObj?._id) {
        return res.status(500).json({
          success: false,
          message: "Login response invalid",
        });
      }

      return res.status(200).json({
        success: true,
        token,
        data: userObj,  // ✅ tests use loginRes.body.data._id
        message: "Login success",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const user = await authService.getUserById(String(userId));

      return res.status(200).json({
        success: true,
        data: user,
        message: "User profile fetched successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const loggedUser = (req as any).user;
      if (!loggedUser?._id) return res.status(401).json({ success: false, message: "Unauthorized" });
      if (loggedUser.role !== "admin")
        return res.status(403).json({ success: false, message: "Forbidden: Admin only" });

      (req.body as any).email = normalizeEmail((req.body as any).email);

      const parsed = CreateUserDto.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues.map((i) => i.message).join(", "),
        });
      }

      const data: any = parsed.data;
      if ((req as any).file) data.imageUrl = `/uploads/${(req as any).file.filename}`;
      if (req.body?.role) data.role = req.body.role;

      const newUser = await authService.registerUser(data);

      return res.status(201).json({
        success: true,
        data: newUser,
        message: "User created successfully",
      });
    } catch (error: any) {
      if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
        return res.status(409).json({ success: false, message: "Email already exists" });
      }
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const loggedIdRaw = (req as any).user?._id || (req as any).user?.id;
      const loggedId = loggedIdRaw ? String(loggedIdRaw) : null;
      const loggedRole = (req as any).user?.role;

      if (!loggedId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const targetId = String(req.params.id || "");
      if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({ success: false, message: "Invalid id format" });
      }

      if (loggedRole !== "admin" && loggedId !== targetId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (typeof (req.body as any).email === "string") {
        (req.body as any).email = normalizeEmail((req.body as any).email);
      }

      const parsed = UpdateUserDto.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues.map((i) => i.message).join(", "),
        });
      }

      const data: any = parsed.data;
      if ((req as any).file) data.imageUrl = `/uploads/${(req as any).file.filename}`;

      const updatedUser = await authService.updateUser(targetId, data);

      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      });
    } catch (error: any) {
      if (error?.code === 11000 || String(error?.message || "").includes("E11000")) {
        return res.status(409).json({ success: false, message: "Email already exists" });
      }
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const email = normalizeEmail(req.body?.email);
      if (!email) return res.status(400).json({ success: false, message: "Email is required" });

      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(200).json({
          success: true,
          message: "If the email exists, reset link has been sent.",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      (user as any).resetPasswordToken = hashedToken;
      (user as any).resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      const baseUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

      console.log("✅ RESET LINK:", resetLink);

      const html = `<a href="${resetLink}">${resetLink}</a>`;
      await sendEmail(user.email, "Reset your password", html);

      return res.status(200).json({ success: true, message: "Reset link has been sent to email." });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const token = String(req.body?.token || "").trim();
      const password = String(req.body?.password || "").trim();

      if (!token || !password) {
        return res.status(400).json({ success: false, message: "Token and password are required" });
      }

      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const user = await UserModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
      }

      user.password = await bcrypt.hash(password, 10);
      (user as any).resetPasswordToken = null;
      (user as any).resetPasswordExpires = null;
      await user.save();

      return res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }
}
