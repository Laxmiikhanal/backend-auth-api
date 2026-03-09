import z from "zod";

export const userSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),   // ✅ fixed email validation
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).default("user"),
  imageUrl: z.string().optional()
});

export type UserType = z.infer<typeof userSchema>;
