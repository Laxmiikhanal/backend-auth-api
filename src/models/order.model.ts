import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrder extends Document {
  user: Types.ObjectId | string;
  products: { product: Types.ObjectId | string; quantity: number }[];
  status: "pending" | "completed" | "cancelled";
}

const OrderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);