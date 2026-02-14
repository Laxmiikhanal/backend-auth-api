import { z } from "zod";

export const UpdateOrderStatusDto = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
});
