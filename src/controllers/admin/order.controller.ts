import { Request, Response } from "express";
import mongoose from "mongoose";
import { AdminOrderService } from "../../services/admin/order.service";
import { ORDER_STATUSES } from "../../models/order.model";

const service = new AdminOrderService();
type Status = (typeof ORDER_STATUSES)[number];

const isValidObjectId = (id: any) => mongoose.Types.ObjectId.isValid(String(id));

export class AdminOrderController {
  // GET /api/admin/orders?status=pending&page=1&limit=10
  async list(req: Request, res: Response) {
    try {
      const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
      const limit = Math.min(Math.max(parseInt(String(req.query.limit || "10"), 10), 1), 100);

      const rawStatus = req.query.status ? String(req.query.status).trim() : undefined;
      const status = (rawStatus ? (rawStatus as Status) : undefined);

      const result = await service.list({ page, limit, status });

      return res.status(200).json({
        success: true,
        ...result,
        message: "Orders fetched successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  }

  // GET /api/admin/orders/:id
  async get(req: Request, res: Response) {
    try {
      const id = String(req.params.id || "");
      if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Invalid id format" });
      }

      const order = await service.getById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      return res.status(200).json({
        success: true,
        data: order,
        message: "Order fetched successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  }

  // PATCH /api/admin/orders/:id/status
  // body: { status: "confirmed", note?: "...", cancelReason?: "..." }
  async updateStatus(req: Request, res: Response) {
    try {
      const id = String(req.params.id || "");
      if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Invalid id format" });
      }

      const status = String(req.body?.status || "").trim();
      const note = String(req.body?.note || "").trim();
      const cancelReason = String(req.body?.cancelReason || "").trim();

      // get admin id from auth middleware (adjust if your middleware stores differently)
      const adminId =
        (req as any).user?._id ||
        (req as any).userId ||
        (req as any).authUser?._id ||
        undefined;

      const updated = await service.updateStatus(
        id,
        { status, note, cancelReason },
        adminId
      );

      return res.status(200).json({
        success: true,
        data: updated,
        message: "Order status updated",
      });
    } catch (error: any) {
      const msg = error?.message || "Internal Server Error";
      const code =
        msg.includes("Invalid status") ||
        msg.includes("required") ||
        msg.includes("Invalid transition") ||
        msg.includes("cannot be changed") ||
        msg.includes("Invalid order id")
          ? 400
          : 500;

      return res.status(code).json({
        success: false,
        message: msg,
      });
    }
  }
}
