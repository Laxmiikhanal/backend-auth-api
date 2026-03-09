import { z } from "zod";
import { PAYMENT_METHODS } from "../models/order.model";

export const CreateOrderDto = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "productId is required"),
        qty: z.number().int().min(1, "qty must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),

  address: z.string().min(3, "Address is required"),
  phone: z.string().min(5, "Phone is required"),
  notes: z.string().optional().default(""),

  paymentMethod: z.enum(PAYMENT_METHODS).default("cod"),
});

export type CreateOrderDtoType = z.infer<typeof CreateOrderDto>;