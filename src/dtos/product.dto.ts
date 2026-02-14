import { z } from "zod";

export const CreateProductDto = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  price: z.number().min(0, "Price must be >= 0"),
  stock: z.number().min(0).optional().default(0),
  category: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
});

export const UpdateProductDto = CreateProductDto.partial();
