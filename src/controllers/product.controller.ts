import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const filters: any = {};
    if (req.query.category) filters.category = req.query.category as string;

    const products = await productService.getAllProducts(filters);
    res.status(200).json({ success: true, data: products });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({ success: true, data: product });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};