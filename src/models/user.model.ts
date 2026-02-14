// import mongoose, { Document, Schema } from "mongoose";
// import { UserType } from "../types/user.type";

// const UserSchema = new Schema(
//   {
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },

//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },

//     imageUrl: { type: String, default: "" },
//     role: { type: String, enum: ["user", "admin"], default: "user" },

//     resetPasswordToken: { type: String, default: null },
//     resetPasswordExpires: { type: Date, default: null },
//   },
//   { timestamps: true }
// );

// export interface IUser extends UserType, Document {
//   _id: mongoose.Types.ObjectId;
//   createdAt: Date;
//   updatedAt: Date;

//   resetPasswordToken?: string | null;
//   resetPasswordExpires?: Date | null;
// }

// export const UserModel = mongoose.model<IUser>("User", UserSchema);


import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },

    imageUrl: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // ✅ IMPORTANT: to allow login with old email after update
    previousEmails: { type: [String], default: [] },

    // reset password fields
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  previousEmails?: string[];

  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
