import { Request, Response } from "express";
import * as PaymentService from "../services/payment";
import { assertInitiatePaymentDto } from "../dtos/payment.dto";

type AnyFn = (...args: any[]) => any;

function pickServiceFn(moduleRef: unknown, names: string[]): AnyFn {
  const mod = moduleRef as Record<string, unknown>;

  for (const name of names) {
    if (typeof mod[name] === "function") {
      return mod[name] as AnyFn;
    }
  }

  throw new Error(
    `Payment service function not found. Tried: ${names.join(", ")}`
  );
}

function getAuthUserId(req: Request): string | undefined {
  return (
    ((req as any).user?._id && String((req as any).user._id)) ||
    ((req as any).user?.id && String((req as any).user.id)) ||
    ((req as any).authUser?._id && String((req as any).authUser._id)) ||
    ((req as any).authUserId && String((req as any).authUserId)) ||
    ((req as any).userId && String((req as any).userId)) ||
    undefined
  );
}

export class PaymentController {
  initiate = async (req: Request, res: Response) => {
    try {
      const userId = getAuthUserId(req);
      const dto = assertInitiatePaymentDto(req.body);

      const fn = pickServiceFn(PaymentService, [
        "initiateOrderPayment",
        "initiatePayment",
        "createPaymentSession",
      ]);

      const data = await fn({ ...dto, userId }, req, res);

      return res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to initiate payment",
      });
    }
  };

  getSummary = async (req: Request, res: Response) => {
    try {
      const orderId = String(req.params.orderId || req.params.id || "");

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const fn = pickServiceFn(PaymentService, [
        "getOrderPaymentSummary",
        "getPaymentSummary",
        "paymentSummaryByOrderId",
      ]);

      const data = await fn(orderId, req, res);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to fetch payment summary",
      });
    }
  };

  codCollected = async (req: Request, res: Response) => {
    try {
      const orderId = String(req.params.orderId || req.params.id || "");
      const userId = getAuthUserId(req);

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const fn = pickServiceFn(PaymentService, [
        "markCodCollected",
        "markCODCollected",
        "collectCodPayment",
      ]);

      const data = await fn(orderId, userId, req.body, req, res);

      return res.status(200).json({
        success: true,
        message: "COD marked as collected",
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to mark COD collected",
      });
    }
  };

  verify = async (req: Request, res: Response) => {
    try {
      const fn = pickServiceFn(PaymentService, [
        "verifyOrderPayment",
        "verifyPayment",
        "handlePaymentCallback",
      ]);

      const data = await fn(req.body, req.query, req, res);

      return res.status(200).json({
        success: true,
        message: "Payment verification processed",
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Payment verification failed",
      });
    }
  };

  // aliases
  summary = this.getSummary;
  markCodCollected = this.codCollected;
}

export const paymentController = new PaymentController();