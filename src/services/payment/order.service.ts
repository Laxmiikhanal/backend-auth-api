type AnyObject = Record<string, any>;

function pickExport<T = any>(moduleRef: AnyObject, names: string[]): T {
  for (const n of names) {
    if (moduleRef?.[n]) return moduleRef[n] as T;
  }
  if (moduleRef?.default) return moduleRef.default as T;
  throw new Error(`Export not found. Tried: ${names.join(", ")}`);
}

import * as OrderModelModule from "../../models/order.model";
const OrderModel: any = pickExport(OrderModelModule as AnyObject, [
  "Order",
  "OrderModel",
  "default",
]);

function generateReference(prefix = "PAY") {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${now}-${rand}`;
}

function readOrderTotal(order: any) {
  return Number(order?.totalAmount ?? order?.total ?? order?.grandTotal ?? 0);
}

export async function initiateOrderPayment(payload: AnyObject) {
  const { orderId, provider, userId } = payload || {};

  if (!orderId) throw new Error("orderId is required");
  if (!provider) throw new Error("provider is required");

  const order = await OrderModel.findById(orderId);
  if (!order) throw new Error("Order not found");

  if (userId) {
    const ownerId =
      order?.user?._id?.toString?.() ||
      order?.user?.toString?.() ||
      order?.userId?.toString?.();

    if (ownerId && ownerId !== String(userId)) {
      throw new Error("Unauthorized payment access");
    }
  }

  if (!order.payment) order.payment = {};

  const normalizedProvider = String(provider).toLowerCase();
  const amount = payload?.amount != null ? Number(payload.amount) : readOrderTotal(order);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid payment amount");
  }

  const reference = generateReference(normalizedProvider.toUpperCase());

  order.payment.provider = normalizedProvider;
  order.payment.status = normalizedProvider === "cod" ? "pending" : "initiated";
  order.payment.amount = amount;
  order.payment.currency = payload?.currency || order.payment.currency || "NPR";
  order.payment.reference = reference;
  order.payment.returnUrl = payload?.returnUrl ?? order.payment.returnUrl;
  order.payment.cancelUrl = payload?.cancelUrl ?? order.payment.cancelUrl;
  order.payment.meta = payload?.meta ?? order.payment.meta;
  order.payment.initiatedAt = new Date();

  if (!order.paymentMethod) order.paymentMethod = normalizedProvider;

  await order.save();

  if (normalizedProvider === "cod") {
    return {
      provider: "cod",
      mode: "offline",
      orderId: String(order._id),
      amount,
      currency: order.payment.currency || "NPR",
      paymentStatus: order.payment.status,
      reference,
      message: "Cash on Delivery selected",
    };
  }

  return {
    provider: normalizedProvider,
    mode: "online",
    orderId: String(order._id),
    amount,
    currency: order.payment.currency || "NPR",
    paymentStatus: order.payment.status,
    reference,
    redirectUrl: payload?.returnUrl || null,
    gatewayPayload: {
      orderId: String(order._id),
      reference,
      amount,
      provider: normalizedProvider,
    },
  };
}

export async function getOrderPaymentSummary(orderId: string) {
  if (!orderId) throw new Error("Order ID is required");

  const order = await OrderModel.findById(orderId);
  if (!order) throw new Error("Order not found");

  const total = readOrderTotal(order);

  return {
    orderId: String(order._id),
    orderStatus: order.status,
    totalAmount: total,
    payment: {
      provider: order?.payment?.provider ?? order?.paymentMethod ?? "cod",
      status: order?.payment?.status ?? "pending",
      amount: Number(order?.payment?.amount ?? total),
      currency: order?.payment?.currency ?? "NPR",
      reference: order?.payment?.reference ?? null,
      transactionId: order?.payment?.transactionId ?? null,
      paidAt: order?.payment?.paidAt ?? null,
      initiatedAt: order?.payment?.initiatedAt ?? null,
    },
  };
}

export async function markCodCollected(
  orderId: string,
  _userId?: string,
  payload: AnyObject = {}
) {
  if (!orderId) throw new Error("Order ID is required");

  const order = await OrderModel.findById(orderId);
  if (!order) throw new Error("Order not found");

  const provider = String(
    order?.payment?.provider || order?.paymentMethod || "cod"
  ).toLowerCase();

  if (provider !== "cod") {
    throw new Error("COD collection is only allowed for COD payments");
  }

  if (!order.payment) order.payment = {};
  order.payment.provider = "cod";
  order.payment.status = "paid";
  order.payment.paidAt = payload?.collectedAt ? new Date(payload.collectedAt) : new Date();
  order.payment.reference = order.payment.reference || generateReference("COD");

  if (payload?.note) {
    order.payment.note = payload.note;
  }

  await order.save();

  return {
    orderId: String(order._id),
    paymentStatus: order.payment.status,
    provider: "cod",
    paidAt: order.payment.paidAt,
    reference: order.payment.reference,
  };
}

export async function verifyOrderPayment(
  body: AnyObject = {},
  query: AnyObject = {}
) {
  const orderId = body.orderId || query.orderId || body.id || query.id;
  if (!orderId) throw new Error("orderId is required for verification");

  const order = await OrderModel.findById(orderId);
  if (!order) throw new Error("Order not found");

  if (!order.payment) order.payment = {};
  order.payment.status = "paid";
  order.payment.transactionId =
    body.transactionId ||
    body.txnId ||
    query.transactionId ||
    order.payment.transactionId ||
    generateReference("TXN");
  order.payment.paidAt = new Date();

  await order.save();

  return {
    verified: true,
    orderId: String(order._id),
    paymentStatus: order.payment.status,
    transactionId: order.payment.transactionId,
  };
}

// aliases
export const initiatePayment = initiateOrderPayment;
export const createPaymentSession = initiateOrderPayment;

export const getPaymentSummary = getOrderPaymentSummary;
export const paymentSummaryByOrderId = getOrderPaymentSummary;

export const markCODCollected = markCodCollected;
export const collectCodPayment = markCodCollected;

export const verifyPayment = verifyOrderPayment;
export const handlePaymentCallback = verifyOrderPayment;