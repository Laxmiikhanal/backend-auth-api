import { Request, Response } from "express";
import { HttpError } from "../../errors/http-error";
import { Order } from "../../models/order.model"; // adjust path/name to your Order model

const allowedStatuses = ["pending", "accepted", "processing", "delivered", "cancelled"];

export const adminGetAllOrders = async (req: Request, res: Response) => {
  try {
    // If your schema has refs, populate them (adjust names)
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName email")
      .populate("items.product", "name price imageUrl");

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch orders" });
  }
};

export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !allowedStatuses.includes(status)) {
      throw new HttpError(400, `Invalid status. Allowed: ${allowedStatuses.join(", ")}`);
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("user", "firstName lastName email")
      .populate("items.product", "name price imageUrl");

    if (!updated) throw new HttpError(404, "Order not found");

    return res.status(200).json({
      success: true,
      data: updated,
      message: "Order status updated",
    });
  } catch (err: any) {
    return res.status(err?.statusCode || 500).json({
      success: false,
      message: err?.message || "Failed to update status",
    });
  }
};