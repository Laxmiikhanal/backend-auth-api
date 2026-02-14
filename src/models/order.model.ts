import { Schema, model, Types } from "mongoose";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

const OrderItemSchema = new Schema(
  {
    // ✅ Product model name is "products"
    productId: { type: Types.ObjectId, ref: "products", required: true },

    // snapshot fields
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, default: "" },
  },
  { _id: false }
);

const OrderStatusHistorySchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String, default: "" },

    // ✅ User model name is "User"
    by: { type: Types.ObjectId, ref: "User", default: null },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    // ✅ User model name is "User"
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },

    items: { type: [OrderItemSchema], default: [] },

    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      index: true,
    },

    address: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },

    cancelReason: { type: String, default: "" },
    cancelledAt: { type: Date, default: null },

    statusHistory: { type: [OrderStatusHistorySchema], default: [] },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export const OrderModel = model("orders", OrderSchema);
