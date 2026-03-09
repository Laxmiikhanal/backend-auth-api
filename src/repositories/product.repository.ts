import mongoose, { Types } from "mongoose";
import { IProduct, ProductModel } from "../models/product.model";

export class ProductRepository {
  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const product = new ProductModel(data);
    await product.save();
    return product;
  }

  async getAllProducts(filters?: { category?: string }): Promise<IProduct[]> {
    const query: any = {};
    if (filters?.category) {
      query.category = new Types.ObjectId(filters.category);
    }
    return ProductModel.find(query).populate("category").sort({ createdAt: -1 });
  }

  async getProductById(id: string): Promise<IProduct | null> {
    return ProductModel.findById(id).populate("category");
  }

  async updateProductById(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return ProductModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteProductById(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }
}