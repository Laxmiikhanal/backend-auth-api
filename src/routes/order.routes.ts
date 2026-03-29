import { Router, Request, Response } from "express";

const router = Router();

// POST /api/orders
router.post("/", async (req: Request, res: Response) => {
  try {
    const fakeOrderId = `ord_${Date.now()}`;

    return res.status(201).json({
      success: true,
      data: { _id: fakeOrderId, ...req.body },
      message: "Order created",
    });
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e?.message || "Failed" });
  }
});

export default router;