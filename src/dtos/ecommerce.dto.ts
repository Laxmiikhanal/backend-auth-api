import { z } from 'zod';

export const CreateCategoryDto = z.object({
    name: z.string().min(2).max(100),
    description: z.string().optional(),
});

export const UpdateCategoryDto = z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
});

export const CreateProductDto = z.object({
    name: z.string().min(2).max(200),
    description: z.string().min(10),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    category: z.string(),
});

export const UpdateProductDto = z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    category: z.string().optional(),
});

export const CreateOrderDto = z.object({
    items: z.array(
        z.object({
            productId: z.string(),
            quantity: z.number().int().positive(),
        })
    ).min(1),
    shippingAddress: z.string().min(10),
});

export const UpdateOrderStatusDto = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});
