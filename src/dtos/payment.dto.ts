export type PaymentProvider = "cod" | "esewa" | "khalti" | "stripe";

export type PaymentStatus =
  | "pending"
  | "initiated"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export interface PaymentProviderOption {
  provider: PaymentProvider;
  label: string;
}

export const PAYMENT_PROVIDER_OPTIONS: PaymentProviderOption[] = [
  { provider: "cod", label: "Cash on Delivery" },
  { provider: "esewa", label: "eSewa" },
  { provider: "khalti", label: "Khalti" },
  { provider: "stripe", label: "Stripe" },
];

export interface InitiatePaymentDto {
  orderId: string;
  provider: PaymentProvider;
  amount?: number; // optional if backend calculates from order
  currency?: string; // optional e.g. "NPR"
  returnUrl?: string;
  cancelUrl?: string;
  notes?: string;
  meta?: Record<string, unknown>;
}

export interface GetPaymentSummaryParamsDto {
  orderId: string;
}

export interface MarkCodCollectedDto {
  note?: string;
  collectedAt?: string; // ISO date string optional
}

export function isPaymentProvider(value: unknown): value is PaymentProvider {
  return (
    value === "cod" ||
    value === "esewa" ||
    value === "khalti" ||
    value === "stripe"
  );
}

export function assertInitiatePaymentDto(payload: unknown): InitiatePaymentDto {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid request body");
  }

  const body = payload as Record<string, unknown>;

  const orderId = body.orderId;
  const provider = body.provider;

  if (typeof orderId !== "string" || orderId.trim() === "") {
    throw new Error("orderId is required");
  }

  if (!isPaymentProvider(provider)) {
    throw new Error("provider must be one of: cod, esewa, khalti, stripe");
  }

  if (body.amount !== undefined) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("amount must be a valid non-negative number");
    }
  }

  return {
    orderId: orderId.trim(),
    provider,
    amount:
      body.amount !== undefined ? Number(body.amount) : undefined,
    currency:
      typeof body.currency === "string" ? body.currency.trim() : undefined,
    returnUrl:
      typeof body.returnUrl === "string" ? body.returnUrl.trim() : undefined,
    cancelUrl:
      typeof body.cancelUrl === "string" ? body.cancelUrl.trim() : undefined,
    notes: typeof body.notes === "string" ? body.notes.trim() : undefined,
    meta:
      body.meta && typeof body.meta === "object"
        ? (body.meta as Record<string, unknown>)
        : undefined,
  };
}