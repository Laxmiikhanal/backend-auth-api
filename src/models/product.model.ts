import { Schema, model, Types } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "", trim: true },

    categoryId: { type: Types.ObjectId, ref: "categories", default: null },

    imageUrl: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: "text" });

export const ProductModel = model("products", ProductSchema);
