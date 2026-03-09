import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { HttpError } from "../errors/http-error";

const orderService = new OrderService();

// POST /api/orders
export const placeOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?._id) throw new HttpError(401, "Unauthorized");

    // ✅ Accept both keys from frontend: items or products
    const rawItems = req.body?.items ?? req.body?.products ?? [];

    const paymentMethod = (req.body?.paymentMethod || req.body?.method || "cod") as string;

    const order = await orderService.placeOrder(user._id.toString(), rawItems, paymentMethod);

    return res.status(201).json({
      success: true,
      data: order,
      message: "Order placed successfully",
    });
  } catch (err: any) {
    return res.status(err?.statusCode || 500).json({
      success: false,
      message: err?.message || "Failed to place order",
    });
  }
};

// GET /api/orders (current user orders)
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?._id) throw new HttpError(401, "Unauthorized");

    const orders = await orderService.getUserOrders(user._id.toString());

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err: any) {
    return res.status(err?.statusCode || 500).json({
      success: false,
      message: err?.message || "Failed to fetch orders",
    });
  }
};