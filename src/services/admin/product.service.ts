import { ProductModel } from "../../models/product.model";

export const getAllProducts = async () => {
  return ProductModel.find().sort({ createdAt: -1 });
};

export const createProduct = async (data: any) => {
  return ProductModel.create(data);
};

export const updateProduct = async (id: string, data: any) => {
  return ProductModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteProduct = async (id: string) => {
  return ProductModel.findByIdAndDelete(id);
};