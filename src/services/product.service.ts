import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();

export class ProductService {
  async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    category: string;
    image: string;
  }) {
    const category = await categoryRepository.getCategoryById(data.category);
    if (!category) throw new HttpError(404, "Category not found");

    return productRepository.createProduct({
      ...data,
      category: new mongoose.Types.ObjectId(data.category),
    });
  }

  async getAllProducts(filters?: { category?: string }) {
    return productRepository.getAllProducts(filters);
  }

  async getProductById(id: string) {
    const product = await productRepository.getProductById(id);
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  }

  async updateProduct(id: string, data: Partial<any>) {
    if (data.category) {
      const category = await categoryRepository.getCategoryById(data.category);
      if (!category) throw new HttpError(404, "Category not found");
      data.category = new mongoose.Types.ObjectId(data.category);
    }
    const updated = await productRepository.updateProductById(id, data);
    if (!updated) throw new HttpError(404, "Product not found");
    return updated;
  }

  async deleteProduct(id: string) {
    const deleted = await productRepository.deleteProductById(id);
    if (!deleted) throw new HttpError(404, "Product not found");
    return true;
  }
}