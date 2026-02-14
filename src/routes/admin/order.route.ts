import { Router } from "express";
import { AdminOrderController } from "../../controllers/admin/order.controller";
import {
  authorizedMiddelWare,
  adminMiddelware,
} from "../../middlewares/authorized.middleware";

import { OrderModel } from "../../models/order.model";
import { UserModel } from "../../models/user.model";
import { ProductModel } from "../../models/product.model";

const router = Router();
const controller = new AdminOrderController();

router.use(authorizedMiddelWare, adminMiddelware);

// existing endpoints
router.get("/", controller.list.bind(controller));
router.get("/:id", controller.get.bind(controller));
router.patch("/:id/status", controller.updateStatus.bind(controller));

// ✅ SEED ENDPOINT (creates 1 dummy order)
router.post("/seed", async (req, res) => {
  try {
    const user = await UserModel.findOne().lean();
    const product = await ProductModel.findOne().lean();

    if (!user) {
      return res.status(400).json({ success: false, message: "No users found in DB" });
    }
    if (!product) {
      return res.status(400).json({ success: false, message: "No products found in DB" });
    }

    const qty = 1;
    const price = Number((product as any).price || 0);

    const order = await OrderModel.create({
      userId: (user as any)._id,
      items: [
        {
          productId: (product as any)._id,
          name: (product as any).name,
          price,
          qty,
          imageUrl: (product as any).imageUrl || "",
        },
      ],
      total: price * qty,
      status: "pending",
      address: "Seed address",
      phone: "0000000000",
      notes: "Seed order created for admin testing",
      statusHistory: [{ status: "pending", note: "Order created (seed)" }],
    });

    return res.status(201).json({
      success: true,
      data: order,
      message: "Seed order created",
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e?.message || "Seed failed" });
  }
});

export default router;
