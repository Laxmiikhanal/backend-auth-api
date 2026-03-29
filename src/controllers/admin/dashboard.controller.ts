import { Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import { ProductModel } from "../../models/product.model";
import { OrderModel } from "../../models/order.model";

export const getDashboardStats = async (req: Request, res: Response) => {
  const users = await UserModel.countDocuments();
  const products = await ProductModel.countDocuments();
  const orders = await OrderModel.countDocuments();

  res.json({
    totalUsers: users,
    totalProducts: products,
    totalOrders: orders,
  });
};