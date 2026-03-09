export {
  initiateOrderPayment,
  getOrderPaymentSummary,
  markCodCollected,
  verifyOrderPayment,
  initiatePayment,
  createPaymentSession,
  getPaymentSummary,
  paymentSummaryByOrderId,
  markCODCollected,
  collectCodPayment,
  verifyPayment,
  handlePaymentCallback,
} from "./order.service";

export type PaymentProvider = "cod" | "esewa" | "khalti" | "stripe";

export type PaymentStatus =
  | "pending"
  | "initiated"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";