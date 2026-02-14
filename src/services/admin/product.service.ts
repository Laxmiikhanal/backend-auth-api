import mongoose from "mongoose";
import { ProductModel } from "../../models/product.model";

export class AdminProductService {
  async list(opts: { page: number; limit: number; q?: string }) {
    const { page, limit, q } = opts;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (q?.trim()) filter.$text = { $search: q.trim() };

    const [items, total] = await Promise.all([
      ProductModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ProductModel.countDocuments(filter),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return ProductModel.findById(id).lean();
  }

  async create(payload: any) {
    const created = await ProductModel.create(payload);
    return ProductModel.findById(created._id).lean();
  }

  async update(id: string, payload: any) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return ProductModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const deleted = await ProductModel.findByIdAndDelete(id);
    return !!deleted;
  }
}
