// import { Router } from "express";
// import {
//   getAllOrders,
//   getOrderById,
//   updateOrderStatus,
//   deleteOrder,
// } from "../../controllers/admin/order.controller";
// import {
//   authorizedMiddleware,
//   adminMiddleware,
// } from "../../middlewares/authorized.middleware";

// const router = Router();

// router.get("/", authorizedMiddleware, adminMiddleware, getAllOrders);
// router.get("/:orderId", authorizedMiddleware, adminMiddleware, getOrderById);
// router.put("/:orderId", authorizedMiddleware, adminMiddleware, updateOrderStatus);
// router.delete("/:orderId", authorizedMiddleware, adminMiddleware, deleteOrder);

// export default router;

import { Router, Request, Response } from "express";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";
import { OrderModel } from "../../models/order.model"; // ✅ correct export name

const router = Router();

// ✅ GET all orders (admin)
router.get("/", authorizedMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find()
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName email")
      .populate("products.product", "name price imageUrl");

    return res.status(200).json({ success: true, data: orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch orders" });
  }
});

// ✅ UPDATE order status (admin)
// URL: PATCH /api/admin/orders/:orderId
router.patch("/:orderId", authorizedMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body as { status?: "pending" | "completed" | "cancelled" };

    const allowed = ["pending", "completed", "cancelled"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(", ")}`,
      });
    }

    const updated = await OrderModel.findByIdAndUpdate(orderId, { status }, { new: true })
      .populate("user", "firstName lastName email")
      .populate("products.product", "name price imageUrl");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, data: updated, message: "Status updated" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || "Failed to update status" });
  }
});

export default router;