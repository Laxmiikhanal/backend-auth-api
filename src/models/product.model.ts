import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string;

  // your current API uses these:
  imageUrl?: string;
  stock?: number;
  isActive?: boolean;
  categoryId?: Types.ObjectId | string;

  // keep compatibility if some code uses "category"
  category?: Types.ObjectId | string;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },

    description: { type: String, default: "" },

    // ✅ matches your API response
    imageUrl: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // ✅ matches your API response
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },

    // optional compatibility field (in case other code uses `category`)
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);