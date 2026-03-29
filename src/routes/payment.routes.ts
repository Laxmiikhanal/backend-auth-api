import { Router, Request, Response } from "express";

const router = Router();

// POST /api/payment/initiate
router.post("/initiate", async (req: Request, res: Response) => {
  try {
    const { orderId, provider, amount } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    if (provider === "esewa") {
      return res.status(200).json({
        success: true,
        data: {
          orderId,
          provider,
          amount,
          redirectUrl: "", // later: add real eSewa gateway URL
        },
        message: "Payment initiated",
      });
    }

    return res.status(200).json({
      success: true,
      data: { orderId, provider, amount },
      message: "Payment initiated",
    });
  } catch (e: any) {
    return res.status(400).json({ success: false, message: e?.message || "Failed" });
  }
});

export default router;